data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

locals {
  name                 = "${var.project_name}-chat${var.preview ? "-preview" : ""}"
  geo                  = substr(data.aws_region.current.name, 0, 2)
  inference_profile_id = "${local.geo}.${var.model_id}"

  has_function      = !var.preview
  has_default_stage = !var.preview
  has_custom_domain = var.api_domain_name != null

  guardrail_id      = var.preview ? var.guardrail_id : one(aws_bedrock_guardrail.chat[*].guardrail_id)
  guardrail_arn     = var.preview ? var.guardrail_arn : one(aws_bedrock_guardrail.chat[*].guardrail_arn)
  guardrail_version = var.preview ? var.guardrail_version : one(aws_bedrock_guardrail_version.chat[*].version)

  function_arn_template = "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:function:${local.name}-$${stageVariables.previewId}"
}
