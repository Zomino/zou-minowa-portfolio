data "aws_caller_identity" "current" {}

resource "aws_cloudwatch_log_group" "cf_access" {
  count             = var.enable_monitoring ? 1 : 0
  provider          = aws.us_east_1
  name              = "/cloudfront/${var.project_name}/access-logs"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_resource_policy" "cf_delivery" {
  count       = var.enable_monitoring ? 1 : 0
  provider    = aws.us_east_1
  policy_name = "${var.project_name}-cf-access-logs-delivery"

  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "delivery.logs.amazonaws.com" }
        Action    = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource  = "${aws_cloudwatch_log_group.cf_access[0].arn}:*"
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
          ArnLike = {
            "aws:SourceArn" = "arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:delivery-source:*"
          }
        }
      }
    ]
  })
}

resource "aws_cloudwatch_log_delivery_source" "cf_access" {
  count        = var.enable_monitoring ? 1 : 0
  provider     = aws.us_east_1
  name         = "${var.project_name}-cf-access-logs"
  log_type     = "ACCESS_LOGS"
  resource_arn = aws_cloudfront_distribution.site.arn
}

resource "aws_cloudwatch_log_delivery_destination" "cf_access" {
  count         = var.enable_monitoring ? 1 : 0
  provider      = aws.us_east_1
  name          = "${var.project_name}-cf-access-logs"
  output_format = "json"

  delivery_destination_configuration {
    destination_resource_arn = aws_cloudwatch_log_group.cf_access[0].arn
  }
}

resource "aws_cloudwatch_log_delivery" "cf_access" {
  count                    = var.enable_monitoring ? 1 : 0
  provider                 = aws.us_east_1
  delivery_source_name     = aws_cloudwatch_log_delivery_source.cf_access[0].name
  delivery_destination_arn = aws_cloudwatch_log_delivery_destination.cf_access[0].arn

  depends_on = [aws_cloudwatch_log_resource_policy.cf_delivery]
}
