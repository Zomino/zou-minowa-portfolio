# Amazon Route 53

A beginner first reference for moving DNS hosting for `zouminowa.com` from Vercel to AWS, as part of serving the site from a CloudFront distribution.

If terms like DNS, nameserver, or record are new to you, read [dns-fundamentals.md](./dns-fundamentals.md) and [nameservers-and-propagation.md](./nameservers-and-propagation.md) first. This doc assumes those basics and focuses on Route 53 specifically.

## What it is

Amazon Route 53 is AWS's authoritative DNS service. Authoritative means it is the service that holds the real answers for your domain. When someone's browser asks "what is the address for `zouminowa.com`?", the question is eventually routed to Route 53, and Route 53 gives the definitive answer. It is not a cache or a relay. It is the source of truth.

Route 53 can both register domain names and host DNS for a domain. This doc is only about hosting DNS. Your domain can stay registered wherever it is now, while Route 53 answers the DNS queries.

## Why it matters for this migration

The site is moving to a CloudFront distribution, `d18nr8ucmhk74s.cloudfront.net`. For visitors to reach the site at `zouminowa.com` rather than at that long CloudFront name, DNS has to point the domain at the distribution. Today Vercel answers DNS for the domain. After the migration, Route 53 will.

Route 53 matters here for one concrete reason beyond just being AWS's DNS: it has a record type, the ALIAS record, that lets the bare domain `zouminowa.com` point directly at a CloudFront distribution. As explained below, ordinary DNS cannot do this. Getting this wrong is the single most common way a domain migration to CloudFront fails, so it is worth understanding properly.

## Hosted zones

A hosted zone is Route 53's container for all the DNS records belonging to one domain. You create one hosted zone for `zouminowa.com`, and every record for the domain and its subdomains, including `www.zouminowa.com`, lives inside it.

There are two kinds:

- A **public hosted zone** answers DNS queries from the open internet. This is what the migration needs, because visitors on the public internet must be able to resolve `zouminowa.com`.
- A **private hosted zone** answers queries only inside an Amazon VPC, a private network. It is not reachable from the internet and is not relevant here.

When you create a public hosted zone, Route 53 assigns it four nameservers. These four names are what you give to your domain registrar so that the registrar delegates DNS for `zouminowa.com` to Route 53. Until the registrar points at those exact four nameservers, Route 53 is hosting records that nobody on the internet is asking it for, and the site will not resolve. How delegation and propagation work is covered in [nameservers-and-propagation.md](./nameservers-and-propagation.md).

There is a critical consequence here. The four nameservers are assigned when the zone is created, and they are tied to that specific zone. If you delete the hosted zone and create a new one, even for the same domain, Route 53 assigns a different set of four nameservers. The nameservers at your registrar would then point at a zone that no longer exists, delegation would break, and the domain would stop resolving until you updated the registrar again and waited for propagation. The rule that follows is simple: create the hosted zone once and keep it. Do not let tooling destroy and recreate it casually.

## Record sets

Inside the hosted zone you create record sets. A record set is a single DNS instruction, such as "the address record for `www.zouminowa.com` is this target". Common types include A and AAAA for addresses, CNAME for aliases to another name, NS for nameservers, and SOA for zone metadata.

Two record sets are created automatically with every hosted zone and matter for the gotcha above: the NS record and the SOA record, both at the zone apex `zouminowa.com`. The NS record lists the zone's four nameservers, and the SOA record holds administrative data for the zone. You do not normally edit these, and nothing else may occupy the apex name in a way that conflicts with them, which is exactly where the ALIAS record comes in.

## ALIAS vs CNAME

You want `zouminowa.com` (the zone apex, the bare domain with nothing in front) to point at the CloudFront distribution `d18nr8ucmhk74s.cloudfront.net`. The obvious tool would be a CNAME, which points one name at another name. It will not work at the apex, and it is worth knowing why.

A CNAME tells resolvers "for this name, go look up that other name instead, for every record type". But the apex already has NS and SOA records. The DNS standard forbids a CNAME coexisting with any other record at the same name. So a CNAME at `zouminowa.com` would collide with the mandatory NS and SOA records, which is why DNS simply does not allow it. This is a limitation of the DNS specification itself, not of any one provider.

Route 53's ALIAS record exists to solve exactly this. It is an AWS specific record that behaves like an A or AAAA record to the outside world, so it does not conflict with NS and SOA and can live at the apex. Internally it resolves to an AWS target such as a CloudFront distribution, and Route 53 follows that target to the current addresses for you.

| | ALIAS (Route 53) | CNAME |
| --- | --- | --- |
| Works at the zone apex `zouminowa.com` | Yes | No, forbidden by DNS |
| What resolvers see | An A or AAAA record with addresses | A pointer to another name |
| Target | AWS resources such as a CloudFront distribution | Any DNS name |
| Tracks target address changes automatically | Yes | No |
| TTL | Managed by Route 53 from the target | You set it |
| Query billing | Free for queries to supported AWS targets | Charged like a standard query |

Because ALIAS queries to supported AWS targets such as CloudFront are billed differently from ordinary records, do not assume standard query pricing. For current figures see the [Route 53 pricing page](https://aws.amazon.com/route53/pricing/). For how CloudFront expects the domain to be wired up at its end, see [cloudfront-custom-domains.md](./cloudfront-custom-domains.md).

For `www.zouminowa.com`, which is a subdomain and not the apex, a CNAME would be technically valid, but an ALIAS to the same CloudFront distribution is the consistent and cost effective choice.

## Route 53 in Terraform

Two resources cover everything here.

`aws_route53_zone` creates the hosted zone. Create it once and keep it in state. Its output includes the assigned nameservers, which you then configure at the registrar.

`aws_route53_record` creates a record set. For an apex ALIAS to CloudFront, you specify type `A` and provide an `alias` block instead of a TTL and records. The `alias` block references the distribution's domain name and its hosted zone ID, and sets `evaluate_target_health`. Exactly one of `records` or `alias` must be present.

```hcl
resource "aws_route53_zone" "primary" {
  name = "zouminowa.com"
}

resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "zouminowa.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
```

A matching record for `www.zouminowa.com` follows the same shape with its own `name`. Because destroying and recreating `aws_route53_zone` changes the nameservers and breaks delegation, treat that resource as long lived and avoid any change that forces its replacement.

## Sources

- AWS Route 53 Developer Guide, Working with hosted zones: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-working-with.html
- AWS Route 53 Developer Guide, Choosing between alias and non alias records: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html
- AWS Route 53 Developer Guide, Considerations when working with public hosted zones: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zone-public-considerations.html
- AWS Route 53 pricing: https://aws.amazon.com/route53/pricing/
- Terraform Registry, aws_route53_record: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record
- Jayendra Patil, AWS Route 53 Alias vs CNAME (independent): https://jayendrapatil.com/aws-route-53-alias-vs-cname/
