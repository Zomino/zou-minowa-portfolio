module "chat_preview" {
  source             = "./chat"
  project_name       = var.project_name
  preview            = true
  cors_allow_origins = ["*"]
  guardrail_id       = module.chat.guardrail_id
  guardrail_arn      = module.chat.guardrail_arn
  guardrail_version  = module.chat.guardrail_version
}
