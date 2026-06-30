data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

locals {
  name                 = "${var.project_name}-chat${var.preview ? "-preview" : ""}"
  geo                  = substr(data.aws_region.current.name, 0, 2)
  inference_profile_id = "${local.geo}.${var.model_id}"

  has_function      = !var.preview
  has_default_stage = !var.preview
  has_custom_domain = var.api_domain_name != null

  function_arn_template = "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:function:${local.name}-$${stageVariables.previewId}"
}
