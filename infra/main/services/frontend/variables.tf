variable "project_name" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "zone_name" {
  type = string
}

variable "sns_topic_arn" {
  type    = string
  default = null
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

variable "enable_monitoring" {
  type    = bool
  default = true
}
