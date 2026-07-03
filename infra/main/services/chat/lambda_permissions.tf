data "aws_iam_policy_document" "prod" {
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
    resources = [aws_bedrock_guardrail.this.guardrail_arn]
  }

  statement {
    sid = "ProtectionStore"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
    ]
    resources = [aws_dynamodb_table.prod.arn]
  }
}

data "aws_iam_policy_document" "preview" {
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
    resources = [aws_bedrock_guardrail.this.guardrail_arn]
  }

  statement {
    sid = "ProtectionStore"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
    ]
    resources = [aws_dynamodb_table.preview.arn]
  }
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_prod.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = format("%s/*/*", module.api_prod.execution_arn)
}
