resource "aws_sns_topic" "alerts" {
  provider = aws.us_east_1
  name     = "${var.project_name}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  provider  = aws.us_east_1
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "cf_5xx" {
  provider            = aws.us_east_1
  alarm_name          = "${var.project_name}-cloudfront-5xx"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = var.distribution_id
    Region         = "Global"
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_log_metric_filter" "cf_real_4xx" {
  provider       = aws.us_east_1
  name           = "${var.project_name}-cf-real-4xx"
  log_group_name = aws_cloudwatch_log_group.cf_access.name

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
  provider            = aws.us_east_1
  alarm_name          = "${var.project_name}-cloudfront-4xx"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 3
  datapoints_to_alarm = 2
  metric_name         = "RealRoute4xx"
  namespace           = "Portfolio/CloudFront"
  period              = 900
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_sns_topic" "alerts_eu" {
  name = "${var.project_name}-alerts"
}

resource "aws_sns_topic_subscription" "email_eu" {
  topic_arn = aws_sns_topic.alerts_eu.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "rum_js_errors" {
  alarm_name          = "${var.project_name}-rum-js-errors"
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

  alarm_actions = [aws_sns_topic.alerts_eu.arn]
}

resource "aws_cloudwatch_metric_alarm" "firehose_delivery_failed" {
  alarm_name          = "${var.project_name}-firehose-delivery-failed"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DeliveryToS3.Success"
  namespace           = "AWS/Firehose"
  period              = 300
  statistic           = "Average"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  dimensions = {
    DeliveryStreamName = aws_kinesis_firehose_delivery_stream.rum_archive.name
  }

  alarm_actions = [aws_sns_topic.alerts_eu.arn]
}
