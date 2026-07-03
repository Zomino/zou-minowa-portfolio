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
  source           = "./services/frontend"
  project_name     = var.project_name
  zone_id          = aws_route53_zone.site.zone_id
  zone_name        = aws_route53_zone.site.name
  sns_topic_arn    = module.alerts_us.arn
  sns_topic_eu_arn = module.alerts_eu.arn
  deploy_role_id   = module.github_oidc.role_ids["deploy"]
  preview_role_id  = module.github_oidc.role_ids["preview"]

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "chat" {
  source           = "./services/chat"
  project_name     = var.project_name
  alert_email      = var.alert_email
  zone_id          = aws_route53_zone.site.zone_id
  zone_name        = aws_route53_zone.site.name
  sns_topic_eu_arn = module.alerts_eu.arn
  deploy_role_id   = module.github_oidc.role_ids["deploy"]
  preview_role_id  = module.github_oidc.role_ids["preview"]
}

module "alerts_us" {
  source        = "./modules/sns"
  name          = format("%s-alerts", var.project_name)
  subscriptions = [{ protocol = "email", endpoint = var.alert_email }]

  providers = {
    aws = aws.us_east_1
  }
}

module "alerts_eu" {
  source        = "./modules/sns"
  name          = format("%s-alerts", var.project_name)
  subscriptions = [{ protocol = "email", endpoint = var.alert_email }]
}

module "budget" {
  source            = "./modules/budget"
  name              = format("%s-monthly", var.project_name)
  limit_amount      = "5"
  subscriber_emails = [var.alert_email]
}

module "github_oidc" {
  source      = "./modules/github_oidc"
  repository  = "Zomino/zou-minowa-portfolio"
  name_prefix = var.project_name

  subjects = {
    deploy  = "ref:refs/heads/main"
    preview = "pull_request"
  }
}

