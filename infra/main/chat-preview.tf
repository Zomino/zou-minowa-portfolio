module "chat_preview" {
  source             = "./chat"
  project_name       = var.project_name
  preview            = true
  cors_allow_origins = ["*"]
}
