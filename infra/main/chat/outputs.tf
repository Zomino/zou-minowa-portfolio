output "function_name" {
  value = one(aws_lambda_function.chat[*].function_name)
}

output "function_arn" {
  value = one(aws_lambda_function.chat[*].arn)
}

output "api_id" {
  value = aws_apigatewayv2_api.chat.id
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.chat.api_endpoint
}

output "api_domain_target" {
  value = one(aws_apigatewayv2_domain_name.chat[*].domain_name_configuration[0].target_domain_name)
}

output "api_domain_hosted_zone_id" {
  value = one(aws_apigatewayv2_domain_name.chat[*].domain_name_configuration[0].hosted_zone_id)
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
