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
      Project = var.project_name
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project = var.project_name
    }
  }
}

module "cloudfront" {
  source       = "./cloudfront"
  project_name = var.project_name
  bucket_name  = var.project_name
  alert_email  = var.alert_email
}

# No ordered cache behaviours for /_astro/* or /fonts/* because preview S3 keys
# are prefixed (pr-42/_astro/...), so those path patterns never match. All content
# is served through the default behaviour at zero TTL.
module "cloudfront_preview" {
  source                       = "./cloudfront"
  project_name                 = "${var.project_name}-preview"
  bucket_name                  = "${var.project_name}-previews"
  alert_email                  = var.alert_email
  default_root_object          = null
  enable_asset_cache_behaviors = false
}

module "monitoring" {
  source       = "./monitoring"
  project_name = var.project_name
  alert_email  = var.alert_email
  rum_domain   = module.cloudfront.domain_name

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}
