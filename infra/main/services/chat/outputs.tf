output "guardrail_id" {
  value = aws_bedrock_guardrail.this.guardrail_id
}

output "guardrail_version" {
  value = aws_bedrock_guardrail_version.this.version
}

output "preview_api_id" {
  value = module.api_preview.api_id
}

output "preview_table_name" {
  value = aws_dynamodb_table.preview.name
}

output "preview_execution_role_arn" {
  value = module.lambda_preview.role_arn
}

output "preview_model_id" {
  value = local.inference_profile_id
}
