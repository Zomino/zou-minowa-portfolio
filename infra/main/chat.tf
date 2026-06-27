module "chat" {
  source              = "./chat"
  project_name        = var.project_name
  api_domain_name     = "api.${aws_route53_zone.site.name}"
  api_certificate_arn = aws_acm_certificate_validation.chat_api.certificate_arn
  cors_allow_origins = [
    "https://${aws_route53_zone.site.name}",
    "https://www.${aws_route53_zone.site.name}",
  ]
}
