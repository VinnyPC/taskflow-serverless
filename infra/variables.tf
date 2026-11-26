variable "aws_region" {
  description = "Região AWS dos recursos regionais."
  type        = string
  default     = "us-east-1"
}
variable "project_name" {
  description = "Prefixo único e minúsculo para os recursos."
  type        = string
  default     = "taskflow-academico"
}
variable "environment" {
  description = "Nome do ambiente."
  type        = string
  default     = "dev"
}
variable "frontend_dist_path" {
  description = "Caminho do build Angular, relativo à pasta infra."
  type        = string
  default     = "../frontend/dist/taskflow/browser"
}

