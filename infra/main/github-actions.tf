locals {
  pipeline_roles = {
    deploy = {
      sub_claim  = "repo:Zomino/zou-minowa-portfolio:ref:refs/heads/main"
      bucket_arn = module.cloudfront.bucket_arn
    }
    preview = {
      sub_claim  = "repo:Zomino/zou-minowa-portfolio:pull_request"
      bucket_arn = module.cloudfront_preview.bucket_arn
    }
  }
}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_actions" {
  for_each = local.pipeline_roles
  name     = "${var.project_name}-github-actions-${each.key}"

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
  role     = aws_iam_role.github_actions[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${each.value.bucket_arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = each.value.bucket_arn
      }
    ]
  })
}
