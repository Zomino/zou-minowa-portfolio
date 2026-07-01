resource "aws_cloudwatch_log_group" "chat" {
  count             = local.has_function ? 1 : 0
  name              = "/aws/lambda/${local.name}"
  retention_in_days = 30
}
