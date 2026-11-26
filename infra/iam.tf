data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "dynamodb" {
  statement {
    effect    = "Allow"
    actions   = ["dynamodb:DeleteItem", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Scan"]
    resources = [aws_dynamodb_table.tasks.arn]
  }
}

resource "aws_iam_role_policy" "dynamodb" {
  name   = "dynamodb-tasks"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.dynamodb.json
}

