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

output "chat_preview_api_id" {
  value = module.chat_preview.api_id
}

output "chat_preview_api_endpoint" {
  value = module.chat_preview.api_endpoint
}

output "chat_preview_table_name" {
  value = module.chat_preview.table_name
}

output "chat_preview_execution_role_arn" {
  value = module.chat_preview.execution_role_arn
}

output "chat_preview_model_id" {
  value = module.chat_preview.model_id
}

output "chat_guardrail_id" {
  value = module.chat.guardrail_id
}

output "chat_guardrail_version" {
  value = module.chat.guardrail_version
}

output "nameservers" {
  value = aws_route53_zone.site.name_servers
}

output "acm_validation_records" {
  value = aws_acm_certificate.site.domain_validation_options
}
