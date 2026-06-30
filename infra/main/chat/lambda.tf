data "archive_file" "lambda" {
  count       = local.has_function ? 1 : 0
  type        = "zip"
  source_file = "${path.module}/../../../apps/chat/dist/index.mjs"
  output_path = "${path.module}/build/chat-lambda.zip"
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "chat" {
  name               = local.name
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.chat.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "chat" {
  statement {
    sid     = "InvokeModel"
    actions = ["bedrock:InvokeModel"]
    resources = [
      "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:inference-profile/${local.inference_profile_id}",
      "arn:aws:bedrock:*::foundation-model/${var.model_id}",
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

resource "aws_iam_role_policy" "chat" {
  name   = local.name
  role   = aws_iam_role.chat.id
  policy = data.aws_iam_policy_document.chat.json
}

resource "aws_lambda_function" "chat" {
  count                          = local.has_function ? 1 : 0
  function_name                  = local.name
  role                           = aws_iam_role.chat.arn
  runtime                        = "nodejs22.x"
  handler                        = "index.handler"
  architectures                  = ["arm64"]
  filename                       = data.archive_file.lambda[0].output_path
  source_code_hash               = data.archive_file.lambda[0].output_base64sha256
  memory_size                    = var.memory_size
  timeout                        = var.timeout_seconds
  reserved_concurrent_executions = var.reserved_concurrency

  environment {
    variables = {
      CHAT_TABLE_NAME        = aws_dynamodb_table.chat.name
      CHAT_MODEL_ID          = local.inference_profile_id
      CHAT_GUARDRAIL_ID      = local.guardrail_id
      CHAT_GUARDRAIL_VERSION = local.guardrail_version
    }
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "chat" {
  count             = local.has_function ? 1 : 0
  name              = "/aws/lambda/${local.name}"
  retention_in_days = 30
}
