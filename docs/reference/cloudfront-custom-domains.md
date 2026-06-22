# CloudFront custom domains

A reference for attaching a real domain name to a CloudFront distribution. The running example is the portfolio site, served by distribution `E107EPWOTD58BJ`, which currently answers only on its default CloudFront domain. The goal is to make it answer on `zouminowa.com` and `www.zouminowa.com` instead.

If terms like apex, CNAME, ALIAS, or nameserver are unfamiliar, read [dns-fundamentals.md](dns-fundamentals.md) first. This doc assumes you know what a DNS record is and focuses on the CloudFront side.

## What this is

A CloudFront distribution is a content delivery network endpoint. It sits in front of your origin and serves your site from edge locations close to each visitor. Every distribution can be reached two ways: on a default domain that AWS gives it, or on one or more custom domains that you attach. This doc covers attaching the custom domains.

## Default domain vs custom domain

When AWS creates a distribution it assigns a default domain. For `E107EPWOTD58BJ` that is `d18nr8ucmhk74s.cloudfront.net`. This domain works immediately, needs no certificate setup from you, and is useful for testing. It is not the address you want visitors to use, because it is not your brand and you do not control it.

A custom domain is a name you own, such as `zouminowa.com`, that you tell CloudFront to also answer on. CloudFront does not discover your domain by itself. You must declare each custom name on the distribution and point DNS at it. Both steps are required. Doing only one serves errors.

## Alternate domain names and the certificate requirement

The setting that declares your custom names is called alternate domain names, also shown as CNAMEs or aliases. For this site you list two values there: `zouminowa.com` and `www.zouminowa.com`. All alternate domain names must be lowercase.

CloudFront will not accept an alternate domain name unless the distribution also has an attached TLS certificate that covers that name. You prove you are allowed to use a domain by attaching a certificate that includes it, either as an exact match or under a wildcard such as `*.zouminowa.com`. If you add an alias without a matching certificate, CloudFront rejects the change. This is why the alias list and the certificate are configured together, not in separate steps. The certificate must be issued in the US East (N. Virginia) region for CloudFront to use it. See [acm-tls-certificates.md](acm-tls-certificates.md) for how to request and validate that certificate.

## Alias uniqueness across all of CloudFront

An alternate domain name must be unique across every CloudFront distribution in the world, not just within your account. You cannot claim `zouminowa.com` as an alias if another distribution, owned by anyone, already serves it. The attempt fails with a `CNAMEAlreadyExists` error. This exists because CloudFront routes an incoming HTTPS request to a distribution by reading the requested hostname, so each hostname can map to only one distribution. If the conflict is a distribution in your own account, the AWS CLI commands `list-conflicting-aliases` and `associate-alias` let you move the alias across. If it belongs to another account, the other owner must release it first.

## Pointing DNS at the distribution

Once the aliases and certificate are on the distribution, you create DNS records so the names resolve to it.

For `www.zouminowa.com` you can use a CNAME or, in Route 53, an ALIAS record pointing at `d18nr8ucmhk74s.cloudfront.net`. For the apex `zouminowa.com` you cannot use a plain CNAME, because the DNS standard forbids a CNAME at the apex of a zone. Route 53 solves this with an ALIAS record, which behaves like a CNAME but is allowed at the apex and resolves to the distribution at no per query charge. See [amazon-route53.md](amazon-route53.md) for creating these records and [dns-fundamentals.md](dns-fundamentals.md) for the apex limitation.

If you point DNS at the distribution before the matching alias is added, CloudFront receives a request for a hostname it does not recognise and returns an HTTP 403 error. So always add the alias first, then the DNS record.

## www vs apex: choosing a canonical hostname

Decide which single hostname is your real address and redirect the other to it. Pick either the apex `zouminowa.com` or `www.zouminowa.com`, then send all traffic for the other name to the chosen one with a 301 redirect. Serving the same content on both names without a redirect splits search engine ranking signals between two URLs and confuses analytics. One canonical name keeps links, ranking, and reporting consistent.

Common ways to implement the redirect:

| Option | How it works | Trade-offs |
| --- | --- | --- |
| CloudFront Function | A small function attached to the distribution inspects the host header and returns a 301 to the canonical name. | No extra origin to manage. Runs at the edge, so the redirect is fast. Logic lives in code you maintain. |
| S3 redirect bucket plus distribution | An S3 bucket with website redirect enabled returns the 301, fronted by a second distribution for the non canonical name. | More moving parts, a second distribution and a bucket. Familiar, no function code. CloudFront can cache the 301. |

Both serve the redirect from the CDN rather than your application. Pricing for functions and distributions is on the [CloudFront pricing page](https://aws.amazon.com/cloudfront/pricing/); compare before deciding.

## Viewer certificate and TLS settings

The viewer certificate setting tells CloudFront which certificate to present to browsers and how. The normal choice is SNI based serving, set as `sni-only`. Server Name Indication is a TLS extension that lets CloudFront share edge IP addresses across many distributions and select the right certificate from the hostname the browser sends in the TLS handshake. It is supported by browsers and clients released after 2010, which is effectively all current traffic. The alternative, a dedicated IP address per edge location, exists only for clients too old to send SNI and adds a fixed monthly charge, so SNI is the default.

You also set a minimum TLS protocol version, the security policy. It defines the lowest TLS version and the cipher suites CloudFront will accept from viewers. Setting it too low allows outdated, weaker connections; choose a recent policy so old protocols are refused.

## Cutover ordering for zero downtime

The order of operations is what prevents an outage while the domain still serves live traffic from Vercel. Do it in this sequence:

1. Request and validate the ACM certificate in us-east-1 covering both names.
2. Add the aliases and attach the certificate to distribution `E107EPWOTD58BJ`, with `sni-only` and your chosen minimum protocol version.
3. Create the Route 53 records, ALIAS at the apex and ALIAS or CNAME for www, pointing at the distribution.
4. Only then flip the nameservers to Route 53.

Each step depends on the one before it. The certificate must exist before the alias is accepted. The alias must exist before DNS resolves to the distribution, otherwise visitors hit the 403 wrong host error. DNS records must be in place before you delegate the domain. See [nameservers-and-propagation.md](nameservers-and-propagation.md) for the final delegation step and how long it takes to take effect.

## CloudFront aliases in Terraform

In the `aws_cloudfront_distribution` resource the aliases and certificate are set together:

```hcl
resource "aws_cloudfront_distribution" "site" {
  aliases = ["zouminowa.com", "www.zouminowa.com"]

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.site.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
```

The `acm_certificate_arn` must reference a certificate in us-east-1 that covers both names in `aliases`, or the apply fails for the same reason the console rejects the change.

## Sources

- Use custom URLs by adding alternate domain names (CNAMEs): https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html
- Requirements for using SSL/TLS certificates with CloudFront: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
- Choose how CloudFront serves HTTPS requests (SNI vs dedicated IP): https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-https-dedicated-ip-or-sni.html
- ViewerCertificate API reference (minimum protocol version): https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_ViewerCertificate.html
- Resolve the CNAMEAlreadyExists error in CloudFront: https://repost.aws/knowledge-center/resolve-cnamealreadyexists-error
- Redirect a domain in CloudFront: https://repost.aws/knowledge-center/cloudfront-redirect-domain
- Terraform aws_cloudfront_distribution resource: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution
