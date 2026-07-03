data "aws_region" "current" {}

resource "aws_s3_bucket" "log_archive" {
  count  = var.enable_monitoring ? 1 : 0
  bucket = format("%s-log-archive", var.project_name)
}

resource "aws_cloudwatch_log_group" "firehose_rum_archive" {
  count             = var.enable_monitoring ? 1 : 0
  name              = format("/aws/kinesisfirehose/%s-rum-archive", var.project_name)
  retention_in_days = 30
}

resource "aws_s3_bucket_public_access_block" "log_archive" {
  count  = var.enable_monitoring ? 1 : 0
  bucket = aws_s3_bucket.log_archive[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_role" "firehose_delivery" {
  count = var.enable_monitoring ? 1 : 0
  name  = format("%s-firehose-delivery", var.project_name)

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "firehose.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "firehose_delivery" {
  count = var.enable_monitoring ? 1 : 0
  name  = "write-to-s3"
  role  = aws_iam_role.firehose_delivery[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:AbortMultipartUpload",
          "s3:GetBucketLocation",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:ListBucketMultipartUploads",
          "s3:PutObject"
        ]
        Resource = [
          aws_s3_bucket.log_archive[0].arn,
          format("%s/*", aws_s3_bucket.log_archive[0].arn)
        ]
      }
    ]
  })
}

resource "aws_kinesis_firehose_delivery_stream" "rum_archive" {
  count       = var.enable_monitoring ? 1 : 0
  name        = format("%s-rum-archive", var.project_name)
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn            = aws_iam_role.firehose_delivery[0].arn
    bucket_arn          = aws_s3_bucket.log_archive[0].arn
    prefix              = "rum/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/"
    error_output_prefix = "rum-errors/"
    compression_format  = "GZIP"
    buffering_size      = 5
    buffering_interval  = 300

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = aws_cloudwatch_log_group.firehose_rum_archive[0].name
      log_stream_name = "DestinationDelivery"
    }
  }
}

resource "aws_iam_role" "cwl_to_firehose" {
  count = var.enable_monitoring ? 1 : 0
  name  = format("%s-cwl-to-firehose", var.project_name)

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = format("logs.%s.amazonaws.com", data.aws_region.current.name) }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "cwl_to_firehose" {
  count = var.enable_monitoring ? 1 : 0
  name  = "put-to-firehose"
  role  = aws_iam_role.cwl_to_firehose[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["firehose:PutRecord", "firehose:PutRecordBatch"]
        Resource = aws_kinesis_firehose_delivery_stream.rum_archive[0].arn
      }
    ]
  })
}

resource "aws_cloudwatch_log_subscription_filter" "rum_to_s3" {
  count           = var.enable_monitoring ? 1 : 0
  name            = "rum-to-s3"
  log_group_name  = aws_rum_app_monitor.portfolio[0].cw_log_group
  filter_pattern  = ""
  destination_arn = aws_kinesis_firehose_delivery_stream.rum_archive[0].arn
  role_arn        = aws_iam_role.cwl_to_firehose[0].arn
}
