module "certificate" {
  count       = local.has_custom_domain ? 1 : 0
  source      = "../certificate"
  domain_name = var.api_domain_name
  zone_id     = var.zone_id
}

module "api" {
  source               = "../http_api"
  name                 = local.name
  cors_allow_origins   = var.cors_allow_origins
  integration_uri      = local.has_function ? aws_lambda_function.chat[0].invoke_arn : local.function_arn_template
  route_key            = "POST /chat"
  create_default_stage = local.has_default_stage
  domain_name          = local.has_custom_domain ? var.api_domain_name : null
  certificate_arn      = local.has_custom_domain ? module.certificate[0].certificate_arn : null
}

module "budget" {
  count             = var.preview ? 0 : 1
  source            = "../budget"
  name              = "${var.project_name}-bedrock-monthly"
  limit_amount      = "10"
  subscriber_emails = [var.alert_email]
  cost_filters      = { Service = ["Amazon Bedrock"] }
}
