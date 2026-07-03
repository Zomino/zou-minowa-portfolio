terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  create_function = var.source_file != null
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

resource "aws_iam_role" "this" {
  name               = var.name
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "this" {
  count  = var.policy_json == null ? 0 : 1
  name   = var.name
  role   = aws_iam_role.this.id
  policy = var.policy_json
}

data "archive_file" "this" {
  count       = local.create_function ? 1 : 0
  type        = "zip"
  source_file = var.source_file
  output_path = format("%s/build/%s.zip", path.module, var.name)
}

resource "aws_lambda_function" "this" {
  count                          = local.create_function ? 1 : 0
  function_name                  = var.name
  role                           = aws_iam_role.this.arn
  runtime                        = var.runtime
  handler                        = var.handler
  architectures                  = var.architectures
  filename                       = data.archive_file.this[0].output_path
  source_code_hash               = data.archive_file.this[0].output_base64sha256
  memory_size                    = var.memory_size
  timeout                        = var.timeout
  reserved_concurrent_executions = var.reserved_concurrency

  environment {
    variables = var.environment
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "this" {
  count             = local.create_function ? 1 : 0
  name              = format("/aws/lambda/%s", var.name)
  retention_in_days = var.log_retention_days
}
