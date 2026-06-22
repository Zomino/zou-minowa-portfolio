# Vercel to AWS cutover

A runbook for moving `zouminowa.com` from Vercel to AWS CloudFront with zero downtime. The site already runs on CloudFront distribution `E107EPWOTD58BJ` on its default domain `d18nr8ucmhk74s.cloudfront.net`. This doc describes the ordered process for pointing the real domain at it without any visitor seeing an error.

It assumes you know the underlying concepts. If any term is unfamiliar, read these first, in order: [dns-fundamentals.md](dns-fundamentals.md), [nameservers-and-propagation.md](nameservers-and-propagation.md), [amazon-route53.md](amazon-route53.md), [acm-tls-certificates.md](acm-tls-certificates.md), [cloudfront-custom-domains.md](cloudfront-custom-domains.md).

## The one idea that makes it zero-downtime

The cutover is a single action: changing the nameservers for `zouminowa.com` in the Vercel registrar panel from Vercel's to Route 53's. Nothing else routes traffic. Everything before that action is preparation that does not touch the live site, and everything after is waiting and verification.

It is safe because of one fact: when you flip nameservers, resolvers around the world switch from Vercel to Route 53 gradually, not all at once, as their cached delegation expires. During that window some visitors resolve to Vercel and some to Route 53. As long as **both backends serve the same working site**, every request reaches a live server and nobody sees an outage. The whole method is therefore "keep both alive until the switch finishes", not "switch fast".

## Before you start

- CloudFront must already serve the site correctly on its default domain. Confirm `https://d18nr8ucmhk74s.cloudfront.net` loads.
- Decide your canonical hostname, apex `zouminowa.com` or `www.zouminowa.com`, and redirect the other to it. Serving both without a redirect splits search ranking and analytics. See [cloudfront-custom-domains.md](cloudfront-custom-domains.md).
- Confirm whether `zouminowa.com` receives email. If it does, the MX and TXT records (SPF, DKIM, any verification) must be copied into Route 53 before the flip, or email stops being delivered the moment nameservers change. This is the most common cutover mistake. See [nameservers-and-propagation.md](nameservers-and-propagation.md). **Open question to answer before Stage 1.**

## The stages

For each stage, the key columns are where a request for `zouminowa.com` resolves, and what the visitor gets.

### Stage 0: Today

`.com` delegation points at Vercel. The Vercel zone holds the live records. CloudFront answers only on its default domain.

Resolution: visitor to resolver to `.com` to Vercel to the Vercel site. Visitor gets the Vercel site, all of them. No risk.

### Stage 1: Build the Route 53 zone

Create the Route 53 public hosted zone for `zouminowa.com`. Note its four assigned nameservers. Add the records that must exist after the flip: an ALIAS at the apex pointing at the distribution, an ALIAS or CNAME for `www`, and copies of any MX and TXT records from Vercel. Do not touch the Vercel nameservers yet.

Resolution: unchanged, `.com` still points at Vercel. Route 53 exists but nobody is delegated to it, so it is never queried. Visitor gets the Vercel site. No risk, the live site is untouched.

### Stage 2: Certificate and CloudFront alias

Request an ACM certificate in us-east-1 covering `zouminowa.com` and `*.zouminowa.com`. Add its validation CNAME to the current Vercel zone so the certificate issues now, while Vercel is still live. Once issued, add `zouminowa.com` and `www.zouminowa.com` as alternate domain names on the distribution and attach the certificate. Also add the same validation CNAME to Route 53 so automatic renewal keeps working after the flip.

Resolution: still `.com` to Vercel to the Vercel site. CloudFront is now able to serve the custom domain over HTTPS, but no DNS sends anyone there. Visitor gets the Vercel site. No risk. Everything to this point is reversible and invisible.

### Stage 3: The cutover

In the Vercel registrar panel, replace Vercel's nameservers with Route 53's four. This is the switch.

Resolution now splits across the internet. Resolvers whose cached delegation has expired go `.com` to Route 53 to the ALIAS to CloudFront. Resolvers still holding the old delegation go to Vercel. Visitor gets CloudFront or Vercel depending on their resolver, and both serve the same site, so there are no errors. This split is the zero-downtime mechanism, not a fault.

### Stage 4: Propagation tail

Do nothing but watch, and leave both Vercel and CloudFront running. Cached delegations expire one by one over the NS delegation TTL, which is set by the `.com` registry and is commonly around two days. You cannot shorten it. Lowering record TTLs in Vercel does not help here, because a nameserver change is governed by the delegation TTL, not by record TTLs.

Resolution: the share of resolvers using Route 53 and CloudFront climbs from near zero towards one hundred per cent. Visitor gets mostly CloudFront, with a shrinking tail still on Vercel. Both remain live, so no risk.

### Stage 5: Decommission Vercel

Once verification shows essentially all traffic on CloudFront and Vercel traffic at nil, held past the full NS TTL, disconnect the Vercel project. Transferring the domain registration away from Vercel is a separate, later task.

Resolution: `.com` to Route 53 to the ALIAS to CloudFront, for everyone. Migration complete.

## State at each stage

| Stage | `.com` points to | Visitor served by | Risk |
| --- | --- | --- | --- |
| 0 Today | Vercel | Vercel | none |
| 1 Build zone | Vercel | Vercel | none |
| 2 Cert and alias | Vercel | Vercel | none |
| 3 Flip nameservers | Vercel changing to Route 53 | Vercel or CloudFront | none, both live |
| 4 Propagation tail | mostly Route 53 | mostly CloudFront | none, both live |
| 5 Vercel off | Route 53 | CloudFront | safe, tail drained |

## How to tell traffic is switching

Use several signals together, because each shows a different part of the picture.

- DNS progress: `dig zouminowa.com NS +short` and `dig zouminowa.com A +short` from your machine show what your resolver sees. For the global view, enter `zouminowa.com` at whatsmydns.net with type NS and watch regions change from Vercel to Route 53.
- Traffic arriving at AWS: on the CloudWatch dashboard, CloudFront `Requests` for `E107EPWOTD58BJ` rises from near zero, and RUM `SessionCount` and `PageViewCount` rise as real users land.
- Proof it is the real domain: CloudFront S3 access logs show requests with `Host: zouminowa.com`, not just the default CloudFront domain.
- The mirror: Vercel analytics traffic falls towards zero over the same window.

The safe-to-decommission call is when all of these agree, sustained past the NS TTL: whatsmydns shows nearly all regions on Route 53, CloudFront is at full expected volume, and Vercel is at nil.

## Rollback

Until Stage 5, the change is reversible. Paste Vercel's nameservers back into the Vercel panel and, after propagation, every resolver returns to Vercel. It is the same harmless split in reverse. The point of no return is only when you actually turn Vercel off, which is why Stage 5 waits for the tail to drain and verification to pass.

## Preview environments

Preview environments are currently path-based, served at `…cloudfront.net/pr-N/`, so they create no per-PR DNS records and carry no subdomain-takeover risk. If previews ever move to per-PR subdomains such as `pr-7.zouminowa.com`, they would need the `*.zouminowa.com` wildcard certificate (already covered by the Stage 2 certificate) and teardown must delete the Route 53 record together with the distribution. A DNS record left pointing at a deleted distribution can be claimed by someone else. See [acm-tls-certificates.md](acm-tls-certificates.md) for the wildcard and [amazon-route53.md](amazon-route53.md) for the records.

## Sources

- Making Route 53 the DNS service for a domain registered elsewhere: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html
- Routing traffic to a CloudFront distribution with Route 53: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html
- Use custom URLs by adding alternate domain names (CNAMEs): https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html
- Requirements for using SSL/TLS certificates with CloudFront: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
- DNS validation in AWS Certificate Manager: https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
- Subdomain takeover and dangling DNS records: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/protection-from-dangling-dns.html
