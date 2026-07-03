terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

module "certificate" {
  source                    = "../../modules/certificate"
  domain_name               = var.zone_name
  subject_alternative_names = [format("*.%s", var.zone_name)]
  zone_id                   = var.zone_id

  providers = {
    aws = aws.us_east_1
  }
}

module "cloudfront_prod" {
  source              = "../../modules/cloudfront"
  project_name        = var.project_name
  domain_names        = [var.zone_name, format("www.%s", var.zone_name)]
  enable_logging      = true
  acm_certificate_arn = module.certificate.certificate_arn
}

module "cloudfront_preview" {
  source                       = "../../modules/cloudfront"
  project_name                 = format("%s-preview", var.project_name)
  bucket_name                  = format("%s-previews", var.project_name)
  domain_names                 = [format("*.%s", var.zone_name)]
  enable_asset_cache_behaviors = false
  rewrite_function_filename    = "rewrite-preview.js"
  acm_certificate_arn          = module.certificate.certificate_arn
}
