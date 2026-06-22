output "production_distribution_domain" {
  value = module.cloudfront.domain_name
}

output "production_github_actions_role_arn" {
  value = aws_iam_role.github_actions["deploy"].arn
}

output "preview_distribution_domain" {
  value = module.cloudfront_preview.domain_name
}

output "preview_base_domain" {
  value = aws_route53_zone.site.name
}

output "preview_github_actions_role_arn" {
  value = aws_iam_role.github_actions["preview"].arn
}

output "nameservers" {
  value = aws_route53_zone.site.name_servers
}

output "acm_validation_records" {
  value = aws_acm_certificate.site.domain_validation_options
}
