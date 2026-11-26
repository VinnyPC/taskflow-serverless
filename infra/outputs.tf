output "site_url" {
  description = "URL pública da aplicação."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}
output "api_url" {
  description = "URL direta da API."
  value       = "${aws_api_gateway_stage.api.invoke_url}/api/tasks"
}
output "dynamodb_table" {
  value = aws_dynamodb_table.tasks.name
}
output "frontend_bucket" {
  value = aws_s3_bucket.frontend.id
}

