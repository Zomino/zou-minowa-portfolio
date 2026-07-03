resource "aws_route53_record" "api" {
  for_each = toset(["A", "AAAA"])

  zone_id = var.zone_id
  name    = format("api.%s", var.zone_name)
  type    = each.value

  alias {
    name                   = module.api_prod.domain_target
    zone_id                = module.api_prod.domain_hosted_zone_id
    evaluate_target_health = false
  }
}
