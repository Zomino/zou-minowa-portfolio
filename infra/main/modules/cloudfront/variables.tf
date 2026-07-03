variable "project_name" {
  type = string
}

variable "bucket_name" {
  type    = string
  default = null
}

variable "domain_names" {
  type    = list(string)
  default = []
}

variable "acm_certificate_arn" {
  type    = string
  default = null
}

variable "enable_logging" {
  type    = bool
  default = false
}

variable "enable_asset_cache_behaviors" {
  type    = bool
  default = true
}

variable "rewrite_function_filename" {
  type    = string
  default = "rewrite.js"
}
