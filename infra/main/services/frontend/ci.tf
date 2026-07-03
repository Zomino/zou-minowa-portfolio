locals {
  ci_policies = {
    deploy  = { role_id = var.deploy_role_id, bucket_arn = module.cloudfront_prod.bucket_arn }
    preview = { role_id = var.preview_role_id, bucket_arn = module.cloudfront_preview.bucket_arn }
  }
}

resource "aws_iam_role_policy" "ci" {
  for_each = { for name, cfg in local.ci_policies : name => cfg if cfg.role_id != null }

  name = each.key
  role = each.value.role_id

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
