locals {
  aliases = {
    (var.zone_name) = {
      name    = module.cloudfront_prod.domain_name
      zone_id = module.cloudfront_prod.hosted_zone_id
    }
    (format("www.%s", var.zone_name)) = {
      name    = module.cloudfront_prod.domain_name
      zone_id = module.cloudfront_prod.hosted_zone_id
    }
    (format("*.%s", var.zone_name)) = {
      name    = module.cloudfront_preview.domain_name
      zone_id = module.cloudfront_preview.hosted_zone_id
    }
  }
}

resource "aws_route53_record" "alias" {
  for_each = local.aliases

  zone_id = var.zone_id
  name    = each.key
  type    = "A"

  alias {
    name                   = each.value.name
    zone_id                = each.value.zone_id
    evaluate_target_health = false
  }
}
