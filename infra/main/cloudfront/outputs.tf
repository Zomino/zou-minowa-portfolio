output "domain_name" {
  value = aws_cloudfront_distribution.site.domain_name
}

output "bucket_arn" {
  value = aws_s3_bucket.site.arn
}
