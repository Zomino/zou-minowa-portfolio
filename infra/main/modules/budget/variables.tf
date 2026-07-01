variable "name" {
  type = string
}

variable "limit_amount" {
  type = string
}

variable "subscriber_emails" {
  type = list(string)
}

variable "cost_filters" {
  type    = map(list(string))
  default = {}
}

variable "notifications" {
  type = list(object({
    threshold           = number
    notification_type   = string
    comparison_operator = optional(string, "GREATER_THAN")
    threshold_type      = optional(string, "PERCENTAGE")
  }))
  default = [
    { threshold = 80, notification_type = "ACTUAL" },
    { threshold = 100, notification_type = "FORECASTED" },
  ]
}
