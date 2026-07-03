data "aws_iam_policy_document" "chat" {
  statement {
    sid     = "InvokeModel"
    actions = ["bedrock:InvokeModel"]
    resources = [
      format("arn:aws:bedrock:%s:%s:inference-profile/%s", data.aws_region.current.name, data.aws_caller_identity.current.account_id, local.inference_profile_id),
      format("arn:aws:bedrock:*::foundation-model/%s", var.model_id),
    ]
  }

  statement {
    sid       = "ApplyGuardrail"
    actions   = ["bedrock:ApplyGuardrail"]
    resources = [local.guardrail_arn]
  }

  statement {
    sid = "ProtectionStore"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
    ]
    resources = [aws_dynamodb_table.chat.arn]
  }
}

resource "aws_lambda_permission" "chat_apigw" {
  count         = local.has_function ? 1 : 0
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = format("%s/*/*", module.api.execution_arn)
}
