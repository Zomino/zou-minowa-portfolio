resource "aws_cloudwatch_metric_alarm" "cf_5xx" {
  count               = var.enable_monitoring ? 1 : 0
  provider            = aws.us_east_1
  alarm_name          = format("%s-cloudfront-5xx", var.project_name)
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.site.id
    Region         = "Global"
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_log_metric_filter" "cf_real_4xx" {
  count          = var.enable_monitoring ? 1 : 0
  provider       = aws.us_east_1
  name           = format("%s-cf-real-4xx", var.project_name)
  log_group_name = aws_cloudwatch_log_group.cf_access[0].name

  pattern = <<-EOT
    { ($.sc-status = "4*")
      && ($.cs-uri-stem != "*.php")
      && ($.cs-uri-stem != "*wp-*")
      && ($.cs-uri-stem != "*.env*")
      && ($.cs-uri-stem != "*.git*")
      && ($.cs-uri-stem != "/admin*") }
  EOT

  metric_transformation {
    name          = "RealRoute4xx"
    namespace     = "Portfolio/CloudFront"
    value         = "1"
    default_value = "0"
  }
}

resource "aws_cloudwatch_metric_alarm" "cf_4xx" {
  count               = var.enable_monitoring ? 1 : 0
  provider            = aws.us_east_1
  alarm_name          = format("%s-cloudfront-4xx", var.project_name)
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 3
  datapoints_to_alarm = 2
  metric_name         = "RealRoute4xx"
  namespace           = "Portfolio/CloudFront"
  period              = 900
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "firehose_delivery_failed" {
  count               = var.enable_monitoring ? 1 : 0
  alarm_name          = format("%s-firehose-delivery-failed", var.project_name)
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DeliveryToS3.Success"
  namespace           = "AWS/Firehose"
  period              = 300
  statistic           = "Average"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  dimensions = {
    DeliveryStreamName = aws_kinesis_firehose_delivery_stream.rum_archive[0].name
  }

  alarm_actions = [var.sns_topic_eu_arn]
}

resource "aws_cloudwatch_metric_alarm" "rum_js_errors" {
  count               = var.enable_monitoring ? 1 : 0
  alarm_name          = format("%s-rum-js-errors", var.project_name)
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "JsErrorCount"
  namespace           = "AWS/RUM"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    application_name = var.project_name
  }

  alarm_actions = [var.sns_topic_eu_arn]
}

resource "aws_cloudwatch_dashboard" "frontend" {
  count          = var.enable_monitoring ? 1 : 0
  dashboard_name = format("%s-frontend", var.project_name)
  dashboard_body = templatefile(format("%s/resources/dashboard.json", path.module), {
    project_name    = var.project_name
    distribution_id = aws_cloudfront_distribution.site.id
  })
}
