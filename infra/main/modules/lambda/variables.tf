variable "name" {
  type = string
}

variable "source_file" {
  type    = string
  default = null
}

variable "runtime" {
  type    = string
  default = "nodejs22.x"
}

variable "handler" {
  type    = string
  default = "index.handler"
}

variable "architectures" {
  type    = list(string)
  default = ["arm64"]
}

variable "memory_size" {
  type    = number
  default = 512
}

variable "timeout" {
  type    = number
  default = 30
}

variable "reserved_concurrency" {
  type    = number
  default = 5
}

variable "environment" {
  type    = map(string)
  default = {}
}

variable "policy_json" {
  type    = string
  default = null
}

variable "log_retention_days" {
  type    = number
  default = 30
}
