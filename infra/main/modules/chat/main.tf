module "certificate" {
  count       = local.has_custom_domain ? 1 : 0
  source      = "../certificate"
  domain_name = var.api_domain_name
  zone_id     = var.zone_id
}

module "lambda" {
  source          = "../lambda"
  name            = local.name
  create_function = local.has_function
  source_file     = "${path.module}/../../../../apps/chat/dist/index.mjs"
  policy_json     = data.aws_iam_policy_document.chat.json

  environment = {
    CHAT_TABLE_NAME        = aws_dynamodb_table.chat.name
    CHAT_MODEL_ID          = local.inference_profile_id
    CHAT_GUARDRAIL_ID      = local.guardrail_id
    CHAT_GUARDRAIL_VERSION = local.guardrail_version
  }
}

module "api" {
  source               = "../http_api"
  name                 = local.name
  cors_allow_origins   = var.cors_allow_origins
  integration_uri      = local.has_function ? module.lambda.invoke_arn : local.function_arn_template
  route_key            = "POST /chat"
  create_default_stage = local.has_default_stage
  domain_name          = local.has_custom_domain ? var.api_domain_name : null
  certificate_arn      = local.has_custom_domain ? module.certificate[0].certificate_arn : null
}

module "budget" {
  count             = var.preview ? 0 : 1
  source            = "../budget"
  name              = "${var.project_name}-bedrock-monthly"
  limit_amount      = "10"
  subscriber_emails = [var.alert_email]
  cost_filters      = { Service = ["Amazon Bedrock"] }
}
