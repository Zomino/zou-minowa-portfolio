resource "aws_cloudwatch_dashboard" "frontend" {
  count          = var.enable_monitoring ? 1 : 0
  dashboard_name = "${var.project_name}-frontend"
  dashboard_body = templatefile("${path.module}/resources/dashboard.json", {
    project_name    = var.project_name
    distribution_id = aws_cloudfront_distribution.site.id
  })
}
