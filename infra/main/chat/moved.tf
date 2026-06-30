moved {
  from = aws_lambda_function.chat
  to   = aws_lambda_function.chat[0]
}

moved {
  from = aws_cloudwatch_log_group.chat
  to   = aws_cloudwatch_log_group.chat[0]
}

moved {
  from = aws_lambda_permission.chat_apigw
  to   = aws_lambda_permission.chat_apigw[0]
}

moved {
  from = aws_apigatewayv2_stage.default
  to   = aws_apigatewayv2_stage.default[0]
}

moved {
  from = aws_cloudwatch_log_group.chat_api
  to   = aws_cloudwatch_log_group.chat_api[0]
}

moved {
  from = aws_apigatewayv2_domain_name.chat
  to   = aws_apigatewayv2_domain_name.chat[0]
}

moved {
  from = aws_apigatewayv2_api_mapping.chat
  to   = aws_apigatewayv2_api_mapping.chat[0]
}
