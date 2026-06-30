variable "project_name" {
  type = string
}

variable "preview" {
  type    = bool
  default = false
}

variable "guardrail_id" {
  type    = string
  default = null
}

variable "guardrail_arn" {
  type    = string
  default = null
}

variable "guardrail_version" {
  type    = string
  default = null
}

variable "model_id" {
  type    = string
  default = "anthropic.claude-haiku-4-5-20251001-v1:0"
}

variable "memory_size" {
  type    = number
  default = 512
}

variable "timeout_seconds" {
  type    = number
  default = 30
}

variable "reserved_concurrency" {
  type    = number
  default = 5
}

variable "api_domain_name" {
  type    = string
  default = null
}

variable "api_certificate_arn" {
  type    = string
  default = null
}

variable "cors_allow_origins" {
  type = list(string)
}

variable "api_throttle_rate" {
  type    = number
  default = 10
}

variable "api_throttle_burst" {
  type    = number
  default = 20
}
