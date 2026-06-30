resource "aws_route53_record" "api_cert_validation" {
  for_each = local.has_custom_domain ? {
    for dvo in aws_acm_certificate.api[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  zone_id         = var.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_route53_record" "api" {
  count   = local.has_custom_domain ? 1 : 0
  zone_id = var.zone_id
  name    = var.api_domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.chat[0].domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.chat[0].domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_aaaa" {
  count   = local.has_custom_domain ? 1 : 0
  zone_id = var.zone_id
  name    = var.api_domain_name
  type    = "AAAA"

  alias {
    name                   = aws_apigatewayv2_domain_name.chat[0].domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.chat[0].domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}
