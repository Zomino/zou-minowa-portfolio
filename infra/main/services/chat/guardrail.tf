resource "aws_bedrock_guardrail" "this" {
  name                      = local.name
  description               = "Topic restriction and prompt injection protection for the portfolio chat."
  blocked_input_messaging   = "I can only help with questions about Zou Minowa and his work as a software engineer."
  blocked_outputs_messaging = "I can only help with questions about Zou Minowa and his work as a software engineer."

  content_policy_config {
    filters_config {
      type            = "PROMPT_ATTACK"
      input_strength  = "HIGH"
      output_strength = "NONE"
    }
  }
}

resource "aws_bedrock_guardrail_version" "this" {
  guardrail_arn = aws_bedrock_guardrail.this.guardrail_arn
}
