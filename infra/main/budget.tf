module "budget" {
  source            = "./modules/budget"
  name              = "${var.project_name}-monthly"
  limit_amount      = "5"
  subscriber_emails = [var.alert_email]
}
