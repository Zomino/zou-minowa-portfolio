# CloudFront: Cost & Security Reference

## Cost

CloudFront has a permanent free tier covering a generous amount of monthly transfer and requests. A static portfolio site will sit within it indefinitely.

Beyond the free tier, you pay per GB transferred and per request. S3 to CloudFront transfer is free; only the final leg to the client is billed.

## Gotchas

- **APAC egress costs more than US/EU.** An audience in Asia-Pacific eats the free tier faster and costs more beyond it.
- **Cache invalidations beyond the free monthly allowance are charged per path.** Invalidating individual files per deploy adds up. Invalidating `/*` counts as one path.
- **WAF is not included.** Application-layer protection (bot floods, injection attempts) is a separate paid service on top of the distribution cost.

## Security

**Included free with every distribution:**

- AWS Shield Standard: L3/L4 DDoS, SYN flood mitigation, UDP reflection blocking
- TLS termination at the edge (origin never receives raw connections)
- Origin Access Control (OAC): locks S3 so only CloudFront can fetch from it

**Not included:**

- AWS WAF: required for L7 threats (HTTP floods, XSS, SQL injection)
- AWS Shield Advanced: full L7 DDoS coverage with response team support, priced for enterprise use

For a static portfolio, Shield Standard plus OAC is sufficient. Add WAF if the site handles user data or auth.
