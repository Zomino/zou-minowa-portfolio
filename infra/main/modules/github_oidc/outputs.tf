output "role_ids" {
  value = { for name, role in aws_iam_role.this : name => role.id }
}

output "role_arns" {
  value = { for name, role in aws_iam_role.this : name => role.arn }
}
