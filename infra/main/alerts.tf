module "alerts_us" {
  source        = "./modules/sns"
  name          = "${var.project_name}-alerts"
  subscriptions = [{ protocol = "email", endpoint = var.alert_email }]

  providers = {
    aws = aws.us_east_1
  }
}

module "alerts_eu" {
  source        = "./modules/sns"
  name          = "${var.project_name}-alerts"
  subscriptions = [{ protocol = "email", endpoint = var.alert_email }]
}
