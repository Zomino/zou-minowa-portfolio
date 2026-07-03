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
  count                     = var.manage_certificate ? 1 : 0
  source                    = "../certificate"
  domain_name               = var.certificate_domain_name
  subject_alternative_names = [format("*.%s", var.certificate_domain_name)]
  zone_id                   = var.zone_id

  providers = {
    aws = aws.us_east_1
  }
}
