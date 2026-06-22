resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = aws_route53_zone.site.name
  subject_alternative_names = ["*.${aws_route53_zone.site.name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
