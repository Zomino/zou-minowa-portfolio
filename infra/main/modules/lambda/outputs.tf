output "role_arn" {
  value = aws_iam_role.this.arn
}

output "role_name" {
  value = aws_iam_role.this.name
}

output "function_arn" {
  value = one(aws_lambda_function.this[*].arn)
}

output "function_name" {
  value = one(aws_lambda_function.this[*].function_name)
}

output "invoke_arn" {
  value = one(aws_lambda_function.this[*].invoke_arn)
}
