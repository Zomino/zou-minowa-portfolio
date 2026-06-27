terraform {
  required_version = ">= 1.5"

  backend "s3" {
    bucket         = "zou-minowa-portfolio-tfstate"
    key            = "portfolio/terraform.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "zou-minowa-portfolio-tflock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "terraform"
    }
  }
}

module "cloudfront" {
  source              = "./cloudfront"
  project_name        = var.project_name
  bucket_name         = var.project_name
  alert_email         = var.alert_email
  enable_logging      = true
  aliases             = [aws_route53_zone.site.name, "www.${aws_route53_zone.site.name}"]
  acm_certificate_arn = aws_acm_certificate_validation.site.certificate_arn
}

# No ordered cache behaviours for /_astro/* or /fonts/* because the host to prefix
# rewrite function is attached only to the default behaviour. Enabling them would
# route asset requests around the function, so the pr-N prefix would not be applied
# and the objects would 404. All requests must flow through the default behaviour.
module "cloudfront_preview" {
  source                       = "./cloudfront"
  project_name                 = "${var.project_name}-preview"
  bucket_name                  = "${var.project_name}-previews"
  alert_email                  = var.alert_email
  default_root_object          = null
  enable_asset_cache_behaviors = false
  aliases                      = ["*.${aws_route53_zone.site.name}"]
  acm_certificate_arn          = aws_acm_certificate_validation.site.certificate_arn
  rewrite_function_filename    = "preview-rewrite.js"
}

module "monitoring" {
  source           = "./monitoring"
  project_name     = var.project_name
  alert_email      = var.alert_email
  rum_domain       = aws_route53_zone.site.name
  distribution_arn = module.cloudfront.distribution_arn
  distribution_id  = module.cloudfront.distribution_id

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

