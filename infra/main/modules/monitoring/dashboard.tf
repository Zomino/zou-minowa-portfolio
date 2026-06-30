resource "aws_cloudwatch_dashboard" "overview" {
  dashboard_name = "${var.project_name}-overview"
  dashboard_body = templatefile("${path.module}/resources/overview.json", {
    project_name    = var.project_name
    distribution_id = var.distribution_id
  })
}
