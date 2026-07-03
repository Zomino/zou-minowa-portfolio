terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_iam_openid_connect_provider" "this" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "this" {
  for_each = var.subjects
  name     = format("%s-github-actions-%s", var.name_prefix, each.key)

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.this.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = format("repo:%s:%s", var.repository, each.value.subject)
          }
        }
      }
    ]
  })
}

locals {
  policy_attachments = merge([
    for name, cfg in var.subjects : {
      for arn in cfg.managed_policy_arns : format("%s:%s", name, arn) => { role = name, arn = arn }
    }
  ]...)
}

resource "aws_iam_role_policy_attachment" "this" {
  for_each = local.policy_attachments

  role       = aws_iam_role.this[each.value.role].name
  policy_arn = each.value.arn
}
