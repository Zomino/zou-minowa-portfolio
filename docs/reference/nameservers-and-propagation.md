# Nameservers and DNS propagation

A guide for moving DNS hosting for `zouminowa.com` from Vercel to Amazon Route53 while keeping Vercel as the registrar. Read this alongside [dns-fundamentals.md](dns-fundamentals.md) for what DNS records are, and [amazon-route53.md](amazon-route53.md) for the Route53 specifics.

## Registrar versus DNS host

These are two separate jobs that one company can perform at the same time, which is the source of most confusion in a migration like this one.

The **registrar** is the company you bought the domain from. It records who owns `zouminowa.com` and renews the lease with the `.com` registry. Registrars are accredited by ICANN to sell domains on behalf of the registry. The registrar holds one critical setting: the list of nameservers for your domain.

The **DNS host** runs the nameservers that answer queries for `zouminowa.com`. It holds the actual records: the A record pointing visitors to your site, the MX records that route email, the TXT records that verify ownership.

For `zouminowa.com` today, Vercel is both. You bought the domain through Vercel, so Vercel is the registrar, and Vercel's nameservers answer queries, so Vercel is also the DNS host. The migration changes only the second role. Vercel stays the registrar, Route53 becomes the DNS host, and you do this by changing the nameservers at the Vercel registrar to point at Route53.

## Nameservers and delegation

A nameserver is a server that answers DNS questions about a domain. The list of nameservers for your domain is stored in two places: at your DNS host, and as **NS records** in the parent zone, which for `zouminowa.com` is the `.com` zone run by the registry.

When someone visits your site, their resolver asks the `.com` servers "who is authoritative for `zouminowa.com`?". The `.com` servers reply with the NS records, which name your nameservers. This handoff is called **delegation**: the registry delegates authority for your domain down to whichever nameservers the NS records list. The resolver then asks those nameservers for the actual A record.

Your registrar is the only party that can write the NS records into the `.com` zone. That is why "changing nameservers" is done at the registrar, not the DNS host. When you change them at Vercel, you are telling the `.com` registry to delegate `zouminowa.com` to Route53's nameservers instead of Vercel's. From that point, resolvers are sent to Route53 for answers.

## What propagation is and why it takes time

DNS answers are cached, so a change is not visible everywhere at once. The lag is called propagation, and three caches cause it.

First, **resolver caching against your record TTL**. Every record you serve carries a TTL, the number of seconds a resolver may cache it. If your A record has a TTL of 3600, a resolver that fetched it will keep serving the old value for up to an hour, even after you change it. Get this wrong and some visitors hit the old server long after cutover.

Second, **the parent NS delegation TTL**. The NS records in the `.com` zone have their own TTL, commonly 48 hours, and you do not control it. Even after the registry updates the delegation, resolvers that already cached the old nameservers keep asking Vercel for up to two days.

Third, **registry update time**. After you save new nameservers at Vercel, the registry has to publish them into the `.com` zone, which is not instant.

The practical consequence: budget up to 48 hours for the world to fully move to Route53, and assume both Vercel and Route53 will receive live traffic during that window.

## The zero-downtime cutover method

Because both hosts serve traffic during propagation, the goal is to make both return correct answers throughout. The sequence:

1. **Lower TTLs in advance.** Several days before cutover, drop the TTL on Vercel's records to a low value such as 300 seconds. Then wait at least one full original TTL period so the old high TTL has expired from caches. This matters because a low TTL is what lets you, or a resolver, move on quickly; if you skip it, resolvers stay pinned to stale answers for the old TTL after you flip.
2. **Build the Route53 zone fully before flipping.** Create the hosted zone and populate every record so Route53 returns correct answers the moment any resolver is sent there. An empty or partial zone means the resolvers that switch first get broken answers.
3. **Issue the TLS certificate before flipping.** The certificate for the new origin must already be valid, otherwise users sent to Route53 during propagation hit HTTPS errors.
4. **Change nameservers at Vercel last.** Only once Route53 is complete and verified do you point the registrar at Route53's nameservers.

## Replicating existing records: the email and verification trap

When you move DNS hosting, the new host starts with an empty zone. It does not know about any record Vercel was serving. The instant nameservers flip to Route53, anything not copied into Route53 stops resolving.

The records people forget are the ones not tied to the website. **MX records** route your email; if they are not in Route53 before cutover, mail delivery stops the moment delegation moves. **TXT records** carry SPF, DKIM, and DMARC for email authentication, plus verification tokens for third party services; lose the SPF or DKIM record and your outbound mail starts failing authentication and landing in spam.

So before flipping, export every record from Vercel and recreate all of it in Route53: A and AAAA, CNAME, MX, every TXT, plus CAA or SRV if present. Verify against the Vercel zone that nothing is missing.

## How to verify

Confirm Route53 is correct **before** you change nameservers by querying its nameservers directly, bypassing all caching:

- `dig @ns-xxxx.awsdns-xx.com zouminowa.com A`
- `dig @ns-xxxx.awsdns-xx.com zouminowa.com MX`
- `dig @ns-xxxx.awsdns-xx.com zouminowa.com TXT`

After the flip, check which nameservers the world now sees with `dig NS zouminowa.com`, and use a whatsmydns style multi location checker to watch the change reach resolvers in different regions. Do not cancel Vercel DNS or delete anything until `dig NS` returns the Route53 nameservers and your records resolve correctly everywhere.

## Sources

- Registrar versus DNS host roles: https://www.digicert.com/blog/registrar-or-dns-hosting-the-difference-explained
- Nameserver delegation and the parent zone: https://showdns.net/learn/what-are-nameservers
- Propagation, TTL and the 48 hour parent NS delegation: https://www.thednsnexus.com/guides/dns-ttl-explained
- Zero-downtime migration checklist (lower TTL, replicate records, verify): https://www.cloudns.net/blog/checklist-for-changing-your-dns-provider-without-downtime/
- AWS Route53: updating nameservers at another registrar: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register-other-dns-service.html
- AWS Route53: confirm new nameservers respond before decommissioning: https://repost.aws/knowledge-center/route-53-update-name-servers-registrar
