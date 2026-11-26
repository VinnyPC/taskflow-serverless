resource "aws_api_gateway_rest_api" "api" {
  name = "${local.name}-api"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "api"
}
resource "aws_api_gateway_resource" "tasks" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "tasks"
}
resource "aws_api_gateway_resource" "task" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.tasks.id
  path_part   = "{id}"
}

resource "aws_api_gateway_method" "tasks" {
  for_each      = toset(["GET", "POST", "OPTIONS"])
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.tasks.id
  http_method   = each.key
  authorization = "NONE"
}
resource "aws_api_gateway_method" "task" {
  for_each      = toset(["GET", "PUT", "DELETE", "OPTIONS"])
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.task.id
  http_method   = each.key
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "tasks" {
  for_each                = aws_api_gateway_method.tasks
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.tasks.id
  http_method             = each.value.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}
resource "aws_api_gateway_integration" "task" {
  for_each                = aws_api_gateway_method.task
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.task.id
  http_method             = each.value.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  triggers = {
    redeployment = sha1(jsonencode([aws_api_gateway_resource.api.id, aws_api_gateway_resource.tasks.id, aws_api_gateway_resource.task.id, aws_api_gateway_method.tasks, aws_api_gateway_method.task, aws_api_gateway_integration.tasks, aws_api_gateway_integration.task]))
  }
  lifecycle {
    create_before_destroy = true
  }
}
resource "aws_api_gateway_stage" "api" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.environment
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}
