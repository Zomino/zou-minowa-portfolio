resource "aws_cloudwatch_dashboard" "chat" {
  count          = var.preview ? 0 : 1
  dashboard_name = format("%s-chat", var.project_name)
  dashboard_body = templatefile(format("%s/resources/dashboard.json", path.module), {
    project_name = var.project_name
  })
}

resource "aws_cloudwatch_metric_alarm" "chat_throttled" {
  count               = var.preview ? 0 : 1
  alarm_name          = format("%s-chat-throttled", var.project_name)
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 20
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = format("%s-chat", var.project_name)
  }

  alarm_actions = [var.sns_topic_eu_arn]
}
