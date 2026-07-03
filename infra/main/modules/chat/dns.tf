resource "aws_route53_record" "api" {
  for_each = local.has_custom_domain ? toset(["A", "AAAA"]) : toset([])

  zone_id = var.zone_id
  name    = var.api_domain_name
  type    = each.value

  alias {
    name                   = module.api.domain_target
    zone_id                = module.api.domain_hosted_zone_id
    evaluate_target_health = false
  }
}
