output "production_distribution_domain" {
  value = module.frontend.production_domain_name
}

output "production_github_actions_role_arn" {
  value = module.github_oidc.role_arns["deploy"]
}

output "preview_distribution_domain" {
  value = module.frontend.preview_domain_name
}

output "preview_base_domain" {
  value = aws_route53_zone.site.name
}

output "preview_github_actions_role_arn" {
  value = module.github_oidc.role_arns["preview"]
}

output "chat_preview_api_id" {
  value = module.chat.preview_api_id
}

output "chat_preview_table_name" {
  value = module.chat.preview_table_name
}

output "chat_preview_execution_role_arn" {
  value = module.chat.preview_execution_role_arn
}

output "chat_preview_model_id" {
  value = module.chat.preview_model_id
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
