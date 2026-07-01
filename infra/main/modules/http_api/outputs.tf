output "api_id" {
  value = aws_apigatewayv2_api.this.id
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.this.api_endpoint
}

output "execution_arn" {
  value = aws_apigatewayv2_api.this.execution_arn
}

output "domain_target" {
  value = one(aws_apigatewayv2_domain_name.this[*].domain_name_configuration[0].target_domain_name)
}

output "domain_hosted_zone_id" {
  value = one(aws_apigatewayv2_domain_name.this[*].domain_name_configuration[0].hosted_zone_id)
}
