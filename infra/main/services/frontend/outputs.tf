output "production_domain_name" {
  value = module.cloudfront_prod.domain_name
}

output "preview_domain_name" {
  value = module.cloudfront_preview.domain_name
}
