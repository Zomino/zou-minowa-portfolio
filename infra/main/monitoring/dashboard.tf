resource "aws_cloudwatch_dashboard" "overview" {
  dashboard_name = "${var.project_name}-overview"
  dashboard_body = file("${path.module}/resources/overview.json")
}
