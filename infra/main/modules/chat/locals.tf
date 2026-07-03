data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

locals {
  name                 = format("%s-chat%s", var.project_name, var.preview ? "-preview" : "")
  inference_profile_id = format("%s.%s", substr(data.aws_region.current.name, 0, 2), var.model_id)

  has_function = !var.preview

  guardrail_id      = var.preview ? var.guardrail_id : one(aws_bedrock_guardrail.chat[*].guardrail_id)
  guardrail_arn     = var.preview ? var.guardrail_arn : one(aws_bedrock_guardrail.chat[*].guardrail_arn)
  guardrail_version = var.preview ? var.guardrail_version : one(aws_bedrock_guardrail_version.chat[*].version)
}
