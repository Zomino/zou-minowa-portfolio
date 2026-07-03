variable "name" {
  type = string
}

variable "integration_uri" {
  type = string
}

variable "route_key" {
  type = string
}

variable "cors_allow_origins" {
  type = list(string)
}

variable "cors_allow_methods" {
  type    = list(string)
  default = ["POST", "OPTIONS"]
}

variable "cors_allow_headers" {
  type    = list(string)
  default = ["content-type"]
}

variable "cors_max_age" {
  type    = number
  default = 3600
}

variable "create_default_stage" {
  type    = bool
  default = false
}

variable "throttle_rate_limit" {
  type    = number
  default = 10
}

variable "throttle_burst_limit" {
  type    = number
  default = 20
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "domain_name" {
  type    = string
  default = null
}

variable "certificate_arn" {
  type    = string
  default = null
}
