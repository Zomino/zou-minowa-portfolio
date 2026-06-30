locals {
  certificate_arn = var.manage_certificate ? aws_acm_certificate_validation.site[0].certificate_arn : var.acm_certificate_arn
}
