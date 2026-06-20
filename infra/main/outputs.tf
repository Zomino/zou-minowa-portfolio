output "cloudfront_domain_name" {
  value = module.cloudfront.domain_name
}

output "bucket_name" {
  value = module.cloudfront.bucket_name
}

output "distribution_id" {
  value = module.cloudfront.distribution_id
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions_deploy.arn
}
