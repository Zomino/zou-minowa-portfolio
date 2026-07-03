resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = local.name
  dashboard_body = templatefile(format("%s/resources/dashboard.json", path.module), {
    project_name = var.project_name
  })
}

resource "aws_cloudwatch_metric_alarm" "throttled" {
  alarm_name          = format("%s-throttled", local.name)
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 20
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = local.name
  }

  alarm_actions = [var.sns_topic_eu_arn]
}
