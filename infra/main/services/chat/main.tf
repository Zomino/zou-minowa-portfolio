data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

locals {
  name                       = format("%s-chat", var.project_name)
  name_preview               = format("%s-chat-preview", var.project_name)
  inference_profile_id       = format("%s.%s", substr(data.aws_region.current.name, 0, 2), var.model_id)
  judge_inference_profile_id = format("%s.%s", substr(data.aws_region.current.name, 0, 2), var.judge_model_id)
}

module "certificate" {
  source      = "../../modules/certificate"
  domain_name = format("api.%s", var.zone_name)
  zone_id     = var.zone_id
}

module "lambda_prod" {
  source      = "../../modules/lambda"
  name        = local.name
  source_file = format("%s/../../../../apps/chat/dist/index.mjs", path.module)
  policy_json = data.aws_iam_policy_document.prod.json

  environment = {
    CHAT_TABLE_NAME        = aws_dynamodb_table.prod.name
    CHAT_MODEL_ID          = local.inference_profile_id
    CHAT_GUARDRAIL_ID      = aws_bedrock_guardrail.this.guardrail_id
    CHAT_GUARDRAIL_VERSION = aws_bedrock_guardrail_version.this.version
  }
}

module "lambda_preview" {
  source      = "../../modules/lambda"
  name        = local.name_preview
  policy_json = data.aws_iam_policy_document.preview.json
}

module "api_prod" {
  source               = "../../modules/http_api"
  name                 = local.name
  cors_allow_origins   = [format("https://%s", var.zone_name), format("https://www.%s", var.zone_name)]
  integration_uri      = module.lambda_prod.invoke_arn
  route_key            = "POST /chat"
  create_default_stage = true
  domain_name          = format("api.%s", var.zone_name)
  certificate_arn      = module.certificate.certificate_arn
}

module "api_preview" {
  source             = "../../modules/http_api"
  name               = local.name_preview
  cors_allow_origins = ["*"]
  integration_uri    = format("arn:aws:lambda:%s:%s:function:%s-$${stageVariables.previewId}", data.aws_region.current.name, data.aws_caller_identity.current.account_id, local.name_preview)
  route_key          = "POST /chat"
}

module "budget" {
  source            = "../../modules/budget"
  name              = format("%s-bedrock-monthly", var.project_name)
  limit_amount      = "10"
  subscriber_emails = [var.alert_email]
  cost_filters      = { Service = ["Amazon Bedrock"] }
}
