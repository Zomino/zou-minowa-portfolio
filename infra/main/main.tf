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

module "cloudfront" {
  source       = "./cloudfront"
  project_name = var.project_name
  alert_email  = var.alert_email
}
