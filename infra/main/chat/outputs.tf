output "function_name" {
  value = aws_lambda_function.chat.function_name
}

output "function_arn" {
  value = aws_lambda_function.chat.arn
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.chat.api_endpoint
}

output "api_domain_target" {
  value = aws_apigatewayv2_domain_name.chat.domain_name_configuration[0].target_domain_name
}

output "api_domain_hosted_zone_id" {
  value = aws_apigatewayv2_domain_name.chat.domain_name_configuration[0].hosted_zone_id
}

output "table_name" {
  value = aws_dynamodb_table.chat.name
}

output "guardrail_id" {
  value = aws_bedrock_guardrail.chat.guardrail_id
}
