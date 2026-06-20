output "production_distribution_domain" {
  value = module.cloudfront.domain_name
}

output "production_github_actions_role_arn" {
  value = aws_iam_role.github_actions["deploy"].arn
}

output "preview_distribution_domain" {
  value = module.cloudfront_preview.domain_name
}

output "preview_github_actions_role_arn" {
  value = aws_iam_role.github_actions["preview"].arn
}
