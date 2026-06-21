variable "project_name" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "alert_email" {
  type = string
}

variable "monthly_budget_limit" {
  type    = string
  default = "5"
}

variable "default_root_object" {
  type    = string
  default = null
}

variable "enable_asset_cache_behaviors" {
  type    = bool
  default = true
}

variable "enable_logging" {
  type    = bool
  default = false
}
