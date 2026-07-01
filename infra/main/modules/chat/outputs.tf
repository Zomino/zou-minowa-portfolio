output "function_arn" {
  value = one(aws_lambda_function.chat[*].arn)
}

output "api_id" {
  value = module.api.api_id
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
  value = local.guardrail_id
}

output "guardrail_arn" {
  value = local.guardrail_arn
}

output "guardrail_version" {
  value = local.guardrail_version
}
