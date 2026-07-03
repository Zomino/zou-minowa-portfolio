variable "name" {
  type = string
}

variable "subscriptions" {
  type = list(object({
    protocol = string
    endpoint = string
  }))
  default = []
}
