resource "aws_route53_zone" "site" {
  name = "zouminowa.com"
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id         = aws_route53_zone.site.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_route53_record" "chat_api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.chat_api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id         = aws_route53_zone.site.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.site.zone_id
  name    = "api.${aws_route53_zone.site.name}"
  type    = "A"

  alias {
    name                   = module.chat.api_domain_target
    zone_id                = module.chat.api_domain_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_aaaa" {
  zone_id = aws_route53_zone.site.zone_id
  name    = "api.${aws_route53_zone.site.name}"
  type    = "AAAA"

  alias {
    name                   = module.chat.api_domain_target
    zone_id                = module.chat.api_domain_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.site.zone_id
  name    = aws_route53_zone.site.name
  type    = "A"

  alias {
    name                   = module.cloudfront.domain_name
    zone_id                = module.cloudfront.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.site.zone_id
  name    = "www.${aws_route53_zone.site.name}"
  type    = "A"

  alias {
    name                   = module.cloudfront.domain_name
    zone_id                = module.cloudfront.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "preview_wildcard" {
  zone_id = aws_route53_zone.site.zone_id
  name    = "*.${aws_route53_zone.site.name}"
  type    = "A"

  alias {
    name                   = module.cloudfront_preview.domain_name
    zone_id                = module.cloudfront_preview.hosted_zone_id
    evaluate_target_health = false
  }
}
