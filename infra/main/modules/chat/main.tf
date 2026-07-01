module "budget" {
  count             = var.preview ? 0 : 1
  source            = "../budget"
  name              = "${var.project_name}-bedrock-monthly"
  limit_amount      = "10"
  subscriber_emails = [var.alert_email]
  cost_filters      = { Service = ["Amazon Bedrock"] }
}
