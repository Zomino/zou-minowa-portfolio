resource "aws_cognito_identity_pool" "rum" {
  count                            = var.enable_monitoring ? 1 : 0
  identity_pool_name               = format("%s-rum", var.project_name)
  allow_unauthenticated_identities = true
}

resource "aws_iam_role" "rum_unauth" {
  count                = var.enable_monitoring ? 1 : 0
  name                 = format("%s-rum-unauth", var.project_name)
  path                 = "/service-role/"
  description          = "CloudWatch Put RUM events for application monitors"
  max_session_duration = 3600

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Federated = "cognito-identity.amazonaws.com" }
        Action    = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.rum[0].id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "unauthenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "rum_put" {
  count = var.enable_monitoring ? 1 : 0
  name  = format("%s-rum-put", var.project_name)
  path  = "/service-role/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "rum:PutRumEvents"
        Resource = aws_rum_app_monitor.portfolio[0].arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rum" {
  count      = var.enable_monitoring ? 1 : 0
  role       = aws_iam_role.rum_unauth[0].name
  policy_arn = aws_iam_policy.rum_put[0].arn
}

resource "aws_cognito_identity_pool_roles_attachment" "rum" {
  count            = var.enable_monitoring ? 1 : 0
  identity_pool_id = aws_cognito_identity_pool.rum[0].id

  roles = {
    unauthenticated = aws_iam_role.rum_unauth[0].arn
  }
}

resource "aws_rum_app_monitor" "portfolio" {
  count          = var.enable_monitoring ? 1 : 0
  name           = var.project_name
  domain_list    = [var.rum_domain]
  cw_log_enabled = true

  app_monitor_configuration {
    allow_cookies       = true
    enable_xray         = false
    session_sample_rate = 1
    telemetries         = ["performance", "errors", "http"]
    identity_pool_id    = aws_cognito_identity_pool.rum[0].id
  }

  custom_events {
    status = "ENABLED"
  }
}
