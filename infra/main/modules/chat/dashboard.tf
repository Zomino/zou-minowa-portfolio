resource "aws_cloudwatch_dashboard" "chat" {
  count          = var.preview ? 0 : 1
  dashboard_name = "${var.project_name}-chat"
  dashboard_body = templatefile("${path.module}/resources/dashboard.json", {
    project_name = var.project_name
  })
}
