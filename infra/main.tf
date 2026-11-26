locals {
  name          = "${var.project_name}-${var.environment}"
  frontend_path = abspath("${path.module}/${var.frontend_dist_path}")
  mime_types = {
    ".html" = "text/html; charset=utf-8", ".js" = "application/javascript", ".css" = "text/css", ".json" = "application/json",
    ".svg"  = "image/svg+xml", ".png" = "image/png", ".jpg" = "image/jpeg", ".jpeg" = "image/jpeg", ".ico" = "image/x-icon", ".woff2" = "font/woff2"
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

