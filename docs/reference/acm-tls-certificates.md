# ACM TLS Certificates

How HTTPS certificates work for a custom domain on CloudFront, and how to issue one with AWS Certificate Manager (ACM). Written for the migration of `zouminowa.com` from Vercel to CloudFront.

This doc assumes the domain itself is handled elsewhere. For how DNS records work see `dns-fundamentals.md`, for the hosted zone see `amazon-route53.md`, and for attaching the domain to the distribution see `cloudfront-custom-domains.md`.

---

## What it is

A TLS certificate is a file that proves a server is genuinely the one answering for a given domain name, and it carries the keys used to encrypt traffic between the browser and that server. TLS is the protocol behind the `https://` prefix and the padlock in the address bar. The terms SSL and TLS are used interchangeably, but TLS is the current standard.

A certificate is issued for one or more specific domain names. A certificate issued for `zouminowa.com` is only valid for `zouminowa.com`. If the browser receives a certificate that does not match the address it asked for, it treats the connection as untrusted.

---

## Why HTTPS matters for the custom domain

CloudFront serves content over HTTPS on its own default domain automatically. The moment you point a custom domain such as `zouminowa.com` at the distribution, that built in coverage no longer applies, because the certificate must match the name the visitor typed.

Without a matching certificate, every browser shows a full page security warning before it will load anything. Visitors cannot reach the site without clicking through an alarming interstitial, and most will leave. Search engines also penalise sites served without valid HTTPS. So a certificate is not optional polish, it is the difference between a working site and an unreachable one.

---

## ACM basics

AWS Certificate Manager issues TLS certificates, stores them, and renews them automatically before they expire. Certificates issued through ACM for use with integrated AWS services such as CloudFront are provided at no charge. See the [ACM pricing page](https://aws.amazon.com/certificate-manager/pricing/) for the current terms, including the separate paid tier for exportable certificates, which you do not need here.

The key advantage of ACM over a manually purchased certificate is automatic renewal. A certificate has a fixed lifetime and expires. If it lapses, the site breaks in exactly the same way as having no certificate at all. ACM removes that risk by renewing on your behalf, provided the validation it depends on stays in place.

---

## The us-east-1 rule (most important)

A certificate used with CloudFront must be requested in the US East (N. Virginia) Region, `us-east-1`. This holds no matter where the rest of the infrastructure lives. The CloudFront distribution, the S3 bucket, and the Route 53 zone can all sit in other regions, but the certificate has to be in `us-east-1`.

The reason is that CloudFront is a global service rather than a regional one, and it reads certificates only from `us-east-1`. That region acts as its central store, and the certificate is then distributed to every edge location.

Getting this wrong is a common and confusing mistake. If you request the certificate in any other region, nothing errors at creation time. The certificate issues normally and looks healthy. But when you go to attach it to the distribution, it simply does not appear in the list of selectable certificates. The fix is to issue a new one in `us-east-1`, so it is worth getting right the first time.

---

## DNS validation (and the cutover early validation tip)

Before ACM issues a certificate it must confirm you actually control the domain. There are two methods.

- **DNS validation.** ACM gives you a CNAME record to add to the domain's DNS zone. ACM then polls public DNS until it sees that record, and once it does, it issues the certificate. Crucially, leaving the record in place lets ACM renew the certificate automatically and indefinitely.
- **Email validation.** ACM emails the registered domain contacts, who click a link to approve. This must be repeated at every renewal, and renewal emails are easily missed or sent to a stale address. A missed renewal means an expired certificate and a down site.

Prefer DNS validation. It is the method that makes renewal hands off, and the consequence of choosing email validation is a future outage that arrives with little warning.

How DNS validation works in practice: ACM generates a unique CNAME record name and value for each domain name on the certificate. You add those records to the zone, ACM detects them, and the certificate moves to issued. The records only need to be added once, and they stay in place permanently to keep renewal working.

**Cutover tip.** During the migration the domain's live DNS is still served by Vercel until you flip the nameservers. Add the ACM validation CNAME into the current live DNS at Vercel, not just into the new Route 53 zone. Doing so lets ACM validate and issue the certificate while the old DNS is still authoritative, so the certificate is ready before the nameserver switch. If you wait until after the flip, there is a window where the certificate has not yet validated and the new domain cannot serve HTTPS.

---

## Covering apex plus www

You want both `zouminowa.com` (the apex) and `www.zouminowa.com` to work. A certificate can cover more than one name through Subject Alternative Names (SANs), or through a single wildcard entry.

| Approach | What it covers | Trade-offs |
| --- | --- | --- |
| SANs (list each name) | Exactly the names you list, e.g. `zouminowa.com` and `www.zouminowa.com` | Explicit and minimal. Each name needs its own validation CNAME. Adding a new subdomain later means reissuing the certificate. |
| Wildcard (`*.zouminowa.com`) | Any single level subdomain, plus the apex if you also list `zouminowa.com` | One certificate covers future subdomains with no reissue. A wildcard does not cover the bare apex on its own, so you still add `zouminowa.com` as a second name. Broader scope than strictly needed. |

For this site, listing `zouminowa.com` with `www.zouminowa.com` as a SAN is the simplest fit. Reach for a wildcard only if you expect several subdomains.

---

## ACM in Terraform

Two resources cover this. `aws_acm_certificate` requests the certificate, and `aws_acm_certificate_validation` blocks until ACM confirms the DNS records and the certificate is issued, so that anything depending on it does not run against a certificate that is not ready yet.

Both must use a provider aliased to `us-east-1`, per the rule above, even if your default provider points elsewhere.

```hcl
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = "zouminowa.com"
  subject_alternative_names = ["www.zouminowa.com"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
```

The validation record itself is a separate `aws_route53_record`, derived from `aws_acm_certificate.site.domain_validation_options`. The CloudFront distribution then references `aws_acm_certificate.site.arn`. See `cloudfront-custom-domains.md` for that wiring and `amazon-route53.md` for the validation record resource.

---

## Sources

- [Requirements for using SSL/TLS certificates with CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)
- [AWS Certificate Manager DNS validation](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html)
- [Renewal for domains validated by DNS](https://docs.aws.amazon.com/acm/latest/userguide/dns-renewal-validation.html)
- [AWS Certificate Manager pricing](https://aws.amazon.com/certificate-manager/pricing/)
- [Associate an SSL certificate in us-east-1 with a CloudFront distribution (AWS re:Post)](https://repost.aws/knowledge-center/migrate-ssl-cert-us-east)
- [Creating and validating ACM certificates with Terraform (Head for the Cloud)](https://headforthe.cloud/article/managing-acm-with-terraform/)
- [Terraform aws_acm_certificate_validation resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate_validation)
