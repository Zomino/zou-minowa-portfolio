resource "aws_cognito_identity_pool" "rum" {
  identity_pool_name               = "${var.project_name}-rum"
  allow_unauthenticated_identities = true
}

resource "aws_iam_role" "rum_unauth" {
  name                 = "${var.project_name}-rum-unauth"
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
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.rum.id
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
  name = "${var.project_name}-rum-put"
  path = "/service-role/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "rum:PutRumEvents"
        Resource = aws_rum_app_monitor.portfolio.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rum" {
  role       = aws_iam_role.rum_unauth.name
  policy_arn = aws_iam_policy.rum_put.arn
}

resource "aws_cognito_identity_pool_roles_attachment" "rum" {
  identity_pool_id = aws_cognito_identity_pool.rum.id

  roles = {
    unauthenticated = aws_iam_role.rum_unauth.arn
  }
}

resource "aws_rum_app_monitor" "portfolio" {
  name           = var.project_name
  domain_list    = [var.rum_domain]
  cw_log_enabled = true

  app_monitor_configuration {
    allow_cookies       = true
    enable_xray         = false
    session_sample_rate = 1
    telemetries         = ["performance", "errors", "http"]
    identity_pool_id    = aws_cognito_identity_pool.rum.id
  }

  custom_events {
    status = "ENABLED"
  }
}
