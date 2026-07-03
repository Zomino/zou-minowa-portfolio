locals {
  pipeline_roles = {
    deploy = {
      sub_claim  = "repo:Zomino/zou-minowa-portfolio:ref:refs/heads/main"
      bucket_arn = module.frontend.bucket_arn
    }
    preview = {
      sub_claim  = "repo:Zomino/zou-minowa-portfolio:pull_request"
      bucket_arn = module.frontend_preview.bucket_arn
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "oidc" {
  for_each = local.pipeline_roles
  name     = format("%s-github-actions-%s", var.project_name, each.key)

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = each.value.sub_claim
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "github_actions" {
  for_each = local.pipeline_roles
  name     = each.key
  role     = aws_iam_role.oidc[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = format("%s/*", each.value.bucket_arn)
      },
      {
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = each.value.bucket_arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "github_actions_chat_prod" {
  name = "chat-prod"
  role = aws_iam_role.oidc["deploy"].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DeployProdFunction"
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:GetFunction",
        ]
        Resource = module.chat.function_arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "github_actions_chat_preview" {
  name = "chat-preview"
  role = aws_iam_role.oidc["preview"].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ManagePreviewFunctions"
        Effect = "Allow"
        Action = [
          "lambda:CreateFunction",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:PutFunctionConcurrency",
          "lambda:DeleteFunction",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:AddPermission",
          "lambda:RemovePermission",
        ]
        Resource = format("arn:aws:lambda:%s:%s:function:%s-chat-preview-pr-*", data.aws_region.current.name, data.aws_caller_identity.current.account_id, var.project_name)
      },
      {
        Sid    = "ManagePreviewStages"
        Effect = "Allow"
        Action = [
          "apigateway:POST",
          "apigateway:DELETE",
          "apigateway:GET",
          "apigateway:PATCH",
        ]
        Resource = [
          format("arn:aws:apigateway:%s::/apis/%s/stages", data.aws_region.current.name, module.chat_preview.api_id),
          format("arn:aws:apigateway:%s::/apis/%s/stages/*", data.aws_region.current.name, module.chat_preview.api_id),
        ]
      },
      {
        Sid      = "PassExecutionRole"
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = module.chat_preview.execution_role_arn
      }
    ]
  })
}
