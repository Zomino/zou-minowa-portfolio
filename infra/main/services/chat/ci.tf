resource "aws_iam_role_policy" "deploy" {
  count = var.deploy_role_id == null ? 0 : 1
  name  = "chat-prod"
  role  = var.deploy_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DeployProdFunction"
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
        ]
        Resource = module.lambda_prod.function_arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "evals" {
  count = var.evals_role_id == null ? 0 : 1
  name  = "chat-evals"
  role  = var.evals_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "InvokeModels"
        Effect = "Allow"
        Action = ["bedrock:InvokeModel"]
        Resource = [
          format("arn:aws:bedrock:%s:%s:inference-profile/%s", data.aws_region.current.name, data.aws_caller_identity.current.account_id, local.inference_profile_id),
          format("arn:aws:bedrock:*::foundation-model/%s", var.model_id),
          format("arn:aws:bedrock:%s:%s:inference-profile/%s", data.aws_region.current.name, data.aws_caller_identity.current.account_id, local.judge_inference_profile_id),
          format("arn:aws:bedrock:*::foundation-model/%s", var.judge_model_id),
        ]
      },
      {
        Sid      = "ApplyGuardrail"
        Effect   = "Allow"
        Action   = ["bedrock:ApplyGuardrail"]
        Resource = aws_bedrock_guardrail.this.guardrail_arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "preview" {
  count = var.preview_role_id == null ? 0 : 1
  name  = "chat-preview"
  role  = var.preview_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ManagePreviewFunctions"
        Effect = "Allow"
        Action = [
          "lambda:CreateFunction",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:PutFunctionConcurrency",
          "lambda:DeleteFunction",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:AddPermission",
          "lambda:RemovePermission",
        ]
        Resource = format("arn:aws:lambda:%s:%s:function:%s-pr-*", data.aws_region.current.name, data.aws_caller_identity.current.account_id, local.name_preview)
      },
      {
        Sid    = "ManagePreviewStages"
        Effect = "Allow"
        Action = [
          "apigateway:POST",
          "apigateway:DELETE",
          "apigateway:GET",
          "apigateway:PATCH",
        ]
        Resource = [
          format("arn:aws:apigateway:%s::/apis/%s/stages", data.aws_region.current.name, module.api_preview.api_id),
          format("arn:aws:apigateway:%s::/apis/%s/stages/*", data.aws_region.current.name, module.api_preview.api_id),
        ]
      },
      {
        Sid      = "PassExecutionRole"
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = module.lambda_preview.role_arn
      }
    ]
  })
}
