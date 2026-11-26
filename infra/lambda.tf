data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/dist"
  output_path = "${path.module}/taskflow-api.zip"
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name}-api"
  retention_in_days = 14
}

resource "aws_lambda_function" "api" {
  function_name    = "${local.name}-api"
  role             = aws_iam_role.lambda.arn
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256
  environment {
    variables = { TABLE_NAME = aws_dynamodb_table.tasks.name, ALLOWED_ORIGIN = "*" }
  }
  depends_on = [aws_cloudwatch_log_group.lambda, aws_iam_role_policy_attachment.lambda_logs]
}

