resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = "zouminowa.com"
  subject_alternative_names = ["*.zouminowa.com"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}
