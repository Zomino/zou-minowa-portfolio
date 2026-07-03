variable "repository" {
  type = string
}

variable "name_prefix" {
  type = string
}

variable "subjects" {
  type = map(object({
    subject             = string
    managed_policy_arns = optional(list(string), [])
  }))
}
