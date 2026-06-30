output "function_arn" {
  value = one(aws_lambda_function.chat[*].arn)
}

output "api_id" {
  value = aws_apigatewayv2_api.chat.id
}

output "table_name" {
  value = aws_dynamodb_table.chat.name
}

output "execution_role_arn" {
  value = aws_iam_role.chat.arn
}

output "model_id" {
  value = local.inference_profile_id
}

output "guardrail_id" {
  value = aws_bedrock_guardrail.chat.guardrail_id
}

output "guardrail_version" {
  value = aws_bedrock_guardrail_version.chat.version
}
