resource "aws_route53_record" "api" {
  count   = local.has_custom_domain ? 1 : 0
  zone_id = var.zone_id
  name    = var.api_domain_name
  type    = "A"

  alias {
    name                   = module.api.domain_target
    zone_id                = module.api.domain_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_aaaa" {
  count   = local.has_custom_domain ? 1 : 0
  zone_id = var.zone_id
  name    = var.api_domain_name
  type    = "AAAA"

  alias {
    name                   = module.api.domain_target
    zone_id                = module.api.domain_hosted_zone_id
    evaluate_target_health = false
  }
}
