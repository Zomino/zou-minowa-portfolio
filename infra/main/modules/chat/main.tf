module "certificate" {
  count       = local.has_custom_domain ? 1 : 0
  source      = "../certificate"
  domain_name = var.api_domain_name
  zone_id     = var.zone_id
}

module "budget" {
  count             = var.preview ? 0 : 1
  source            = "../budget"
  name              = "${var.project_name}-bedrock-monthly"
  limit_amount      = "10"
  subscriber_emails = [var.alert_email]
  cost_filters      = { Service = ["Amazon Bedrock"] }
}
