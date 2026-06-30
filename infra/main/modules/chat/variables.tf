variable "project_name" {
  type = string
}

variable "preview" {
  type    = bool
  default = false
}

variable "model_id" {
  type    = string
  default = "anthropic.claude-haiku-4-5-20251001-v1:0"
}

variable "api_domain_name" {
  type    = string
  default = null
}

variable "zone_id" {
  type    = string
  default = null
}

variable "cors_allow_origins" {
  type = list(string)
}
