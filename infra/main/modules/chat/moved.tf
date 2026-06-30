moved {
  from = aws_bedrock_guardrail.chat
  to   = aws_bedrock_guardrail.chat[0]
}

moved {
  from = aws_bedrock_guardrail_version.chat
  to   = aws_bedrock_guardrail_version.chat[0]
}
