output "domain_name" {
  value = aws_cloudfront_distribution.site.domain_name
}

output "acm_certificate_arn" {
  value = var.manage_certificate ? module.certificate[0].certificate_arn : null
}

output "bucket_arn" {
  value = aws_s3_bucket.site.arn
}

output "distribution_arn" {
  value = aws_cloudfront_distribution.site.arn
}

output "distribution_id" {
  value = aws_cloudfront_distribution.site.id
}
