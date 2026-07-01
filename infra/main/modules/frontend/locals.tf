locals {
  certificate_arn = var.manage_certificate ? module.certificate[0].certificate_arn : var.acm_certificate_arn
}
