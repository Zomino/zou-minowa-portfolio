resource "aws_cloudwatch_metric_alarm" "chat_throttled" {
  count               = var.preview ? 0 : 1
  alarm_name          = "${var.project_name}-chat-throttled"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 20
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "${var.project_name}-chat"
  }

  alarm_actions = [var.sns_topic_eu_arn]
}
