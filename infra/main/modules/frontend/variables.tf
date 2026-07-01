variable "project_name" {
  type = string
}

variable "bucket_name" {
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

variable "domain_names" {
  type    = list(string)
  default = []
}

variable "acm_certificate_arn" {
  type    = string
  default = null
}

variable "manage_certificate" {
  type    = bool
  default = false
}

variable "certificate_domain_name" {
  type    = string
  default = null
}

variable "rewrite_function_filename" {
  type    = string
  default = "rewrite.js"
}

variable "zone_id" {
  type    = string
  default = null
}

variable "enable_monitoring" {
  type    = bool
  default = false
}

variable "rum_domain" {
  type    = string
  default = null
}

variable "sns_topic_arn" {
  type    = string
  default = null
}

variable "sns_topic_eu_arn" {
  type    = string
  default = null
}
