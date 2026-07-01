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
  region = "eu-west-2"

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

resource "aws_route53_zone" "site" {
  name = "zouminowa.com"
}

module "frontend" {
  source                  = "./modules/frontend"
  project_name            = var.project_name
  enable_logging          = true
  domain_names            = [aws_route53_zone.site.name, "www.${aws_route53_zone.site.name}"]
  zone_id                 = aws_route53_zone.site.zone_id
  manage_certificate      = true
  certificate_domain_name = aws_route53_zone.site.name
  enable_monitoring       = true
  rum_domain              = aws_route53_zone.site.name
  sns_topic_arn           = module.alerts_us.arn
  sns_topic_eu_arn        = module.alerts_eu.arn

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "frontend_preview" {
  source                       = "./modules/frontend"
  project_name                 = "${var.project_name}-preview"
  bucket_name                  = "${var.project_name}-previews"
  enable_asset_cache_behaviors = false
  domain_names                 = ["*.${aws_route53_zone.site.name}"]
  acm_certificate_arn          = module.frontend.acm_certificate_arn
  rewrite_function_filename    = "preview-rewrite.js"
  zone_id                      = aws_route53_zone.site.zone_id

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "chat" {
  source           = "./modules/chat"
  project_name     = var.project_name
  alert_email      = var.alert_email
  api_domain_name  = "api.${aws_route53_zone.site.name}"
  zone_id          = aws_route53_zone.site.zone_id
  sns_topic_eu_arn = module.alerts_eu.arn
  cors_allow_origins = [
    "https://${aws_route53_zone.site.name}",
    "https://www.${aws_route53_zone.site.name}",
  ]
}

module "chat_preview" {
  source             = "./modules/chat"
  project_name       = var.project_name
  preview            = true
  guardrail_id       = module.chat.guardrail_id
  guardrail_arn      = module.chat.guardrail_arn
  guardrail_version  = module.chat.guardrail_version
  cors_allow_origins = ["*"]
}

