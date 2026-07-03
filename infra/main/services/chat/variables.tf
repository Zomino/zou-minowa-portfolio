variable "project_name" {
  type = string
}

variable "alert_email" {
  type    = string
  default = null
}

variable "zone_id" {
  type = string
}

variable "zone_name" {
  type = string
}

variable "model_id" {
  type    = string
  default = "anthropic.claude-haiku-4-5-20251001-v1:0"
}

variable "sns_topic_eu_arn" {
  type    = string
  default = null
}

variable "deploy_role_id" {
  type    = string
  default = null
}

variable "preview_role_id" {
  type    = string
  default = null
}
