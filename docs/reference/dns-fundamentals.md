# DNS fundamentals

A beginner-first explanation of the Domain Name System, written for the migration of `zouminowa.com` from Vercel to AWS CloudFront. If you have ever thought "I do not understand DNS", start here. The sibling docs go deeper on the parts this one only touches: nameserver delegation and propagation timing live in `nameservers-and-propagation.md`, the AWS DNS service in `amazon-route53.md`, certificates in `acm-tls-certificates.md`, and wiring a domain onto a distribution in `cloudfront-custom-domains.md`.

## What it is

DNS, the Domain Name System, is the part of the internet that turns a name people can remember, such as `zouminowa.com`, into the numeric address a computer needs to open a connection. An address looks like `203.0.113.10` for IPv4 or `2001:db8::1` for IPv6. People navigate by name, machines route by number, and DNS is the lookup layer in between. It is often called the phonebook of the internet for that reason.

## Why it matters

For this migration, DNS is the switch that decides whether a visitor reaches Vercel or CloudFront. Nothing about your site content changes the destination. The DNS records do. If the records are wrong, the site is unreachable or points at the old host, and because answers are cached around the world (see TTL below), a mistake is not instant to undo. Understanding DNS is what lets you cut over with confidence instead of guessing.

## Core concepts: the resolution journey

When a browser needs the address for `zouminowa.com`, it does not ask one server. It triggers a chain:

1. The browser asks a **recursive resolver**, usually run by your internet provider or a public service such as Cloudflare 1.1.1.1 or Google 8.8.8.8. The resolver does the legwork on the browser's behalf.
2. If the resolver does not already have the answer cached, it asks a **root nameserver**. The root does not know your address, but it knows who handles `.com` and points the resolver there.
3. The resolver asks the **TLD nameserver** for `.com`. The top-level-domain server does not know your address either, but it knows which **authoritative nameservers** hold the records for `zouminowa.com`.
4. The resolver asks the **authoritative nameserver**, which holds the real records and returns the address.

The resolver then caches the answer so the next lookup for a while is instant. The authoritative nameserver is the source of truth. In this migration that authority is what you move when you point the domain at Route 53. The delegation step that decides which nameservers are authoritative is covered in `nameservers-and-propagation.md`.

## Record types that matter here

A DNS zone is the set of records for a domain. Each record has a type that says what kind of answer it gives.

| Type | Purpose | Relevance to this migration |
| --- | --- | --- |
| A | Maps a name to an IPv4 address. | The basic "this name lives at this address" record. |
| AAAA | Maps a name to an IPv6 address. | Same role as A, for IPv6. Set both so IPv6 visitors are not left out. |
| CNAME | Aliases one name to another name, not to an address. The resolver then looks up that target. | Works for `www.zouminowa.com`, but not for the apex. See below. |
| ALIAS / ANAME | Behaves like a CNAME but resolves to an address at the authoritative server and returns A/AAAA data. A provider feature, not a standard record. | The fix for pointing the apex `zouminowa.com` at CloudFront. Route 53 calls its version an alias record. |
| MX | Lists the mail servers that receive email for the domain. | Leave these untouched during the move, or email breaks even though the website works. |
| TXT | Holds arbitrary text. Used for domain verification and email authentication such as SPF and DKIM. | ACM and other services ask you to add a TXT record to prove you own the domain. |
| NS | Declares which nameservers are authoritative for the zone. | Changing these is how you delegate the domain to Route 53. Covered in `nameservers-and-propagation.md`. |
| SOA | Start of authority. One per zone, holding administrative data about the zone. | Created automatically with the zone. You rarely edit it. |

A key rule: a CNAME points at a **name**, an A or AAAA points at an **address**. CloudFront gives you a name such as `d111111abcdef8.cloudfront.net`, not a fixed address, which is why aliasing matters next.

## The apex CNAME problem

The **apex**, also called the root or naked domain, is the bare domain itself: `zouminowa.com` with nothing in front. A **subdomain** has a label in front, such as `www.zouminowa.com`.

You can point `www.zouminowa.com` at CloudFront with a plain CNAME, because a subdomain has no conflicting records. You **cannot** put a CNAME on the apex `zouminowa.com`. The reason is in the DNS standard. RFC 1034 states that if a CNAME exists at a name, no other records may exist at that same name. The apex is required to hold SOA and NS records (and often MX for mail), so a CNAME there would collide with records that must be present. Putting a CNAME at the apex therefore breaks the rule and most providers reject it outright.

This is a genuine protocol limitation, not a provider quirk, and it cannot be relaxed without changing every resolver in the world at once. So providers invented ALIAS and ANAME records to solve it. An alias record sits at the apex like a CNAME conceptually, but the authoritative server follows the target internally and returns real A and AAAA addresses to the resolver, so the apex stays valid. For this migration that is exactly the mechanism that lets `zouminowa.com` point at a CloudFront distribution. Route 53's alias record is the AWS form of this, detailed in `amazon-route53.md` and `cloudfront-custom-domains.md`.

## TTL and cutover

Every record carries a **TTL**, time to live, measured in seconds. It tells resolvers how long they may cache the answer before fetching a fresh copy. A TTL of 86400 means one day of caching, a TTL of 300 means five minutes.

TTL is the single most important setting to get right before a migration. If your records sit at a one-day TTL and you change them at cutover, resolvers that cached the old answer keep serving the old host for up to a full day. Some visitors land on Vercel hours after you switched to CloudFront, and you cannot force their cache to clear. The fix is to lower the TTL on the records you intend to change to a small value such as 300 seconds, well before the cutover, and to wait for the old, longer TTL to fully expire so the low value has taken hold everywhere. Then when you make the real change, caches refresh within minutes and the switch is quick and reversible. After the migration is stable, raise the TTL again to ease load on the nameservers.

One caveat to expect: a small number of resolvers ignore TTL and cache for their own fixed period, so even a low TTL never makes a change perfectly instant. The detailed timing of propagation is covered in `nameservers-and-propagation.md`.

## Sources

- What is DNS, Cloudflare Learning Center: https://www.cloudflare.com/learning/dns/what-is-dns/
- DNS server types (recursive, root, TLD, authoritative), Cloudflare: https://www.cloudflare.com/learning/dns/dns-server-types/
- DNS records overview, Cloudflare: https://www.cloudflare.com/learning/dns/dns-records/
- CNAME at the apex of a zone, ISC: https://www.isc.org/blogs/cname-at-the-apex-of-a-zone/
- Why a CNAME cannot be used at the root of a domain, Better Stack: https://betterstack.com/community/questions/why-cant-cname-be-used-at-the-root-of-domain/
- Solving DNS zone apex challenges with third-party DNS providers using AWS: https://aws.amazon.com/blogs/networking-and-content-delivery/solving-dns-zone-apex-challenges-with-third-party-dns-providers-using-aws/
- Time to Live (TTL), Cloudflare DNS docs: https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/
- TTL best practices, DigiCert: https://www.digicert.com/blog/long-short-ttls
