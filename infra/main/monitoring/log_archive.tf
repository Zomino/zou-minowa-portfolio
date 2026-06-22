data "aws_region" "current" {}

resource "aws_s3_bucket" "log_archive" {
  bucket = "${var.project_name}-log-archive"
}

resource "aws_s3_bucket_public_access_block" "log_archive" {
  bucket = aws_s3_bucket.log_archive.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_role" "firehose_delivery" {
  name = "${var.project_name}-firehose-delivery"

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
  name = "write-to-s3"
  role = aws_iam_role.firehose_delivery.id

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
          aws_s3_bucket.log_archive.arn,
          "${aws_s3_bucket.log_archive.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_kinesis_firehose_delivery_stream" "rum_archive" {
  name        = "${var.project_name}-rum-archive"
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn            = aws_iam_role.firehose_delivery.arn
    bucket_arn          = aws_s3_bucket.log_archive.arn
    prefix              = "rum/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/"
    error_output_prefix = "rum-errors/"
    compression_format  = "GZIP"
    buffering_size      = 5
    buffering_interval  = 300

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = "/aws/kinesisfirehose/${var.project_name}-rum-archive"
      log_stream_name = "DestinationDelivery"
    }
  }
}

resource "aws_iam_role" "cwl_to_firehose" {
  name = "${var.project_name}-cwl-to-firehose"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "logs.${data.aws_region.current.name}.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "cwl_to_firehose" {
  name = "put-to-firehose"
  role = aws_iam_role.cwl_to_firehose.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["firehose:PutRecord", "firehose:PutRecordBatch"]
        Resource = aws_kinesis_firehose_delivery_stream.rum_archive.arn
      }
    ]
  })
}

resource "aws_cloudwatch_log_subscription_filter" "rum_to_s3" {
  name            = "rum-to-s3"
  log_group_name  = aws_rum_app_monitor.portfolio.cw_log_group
  filter_pattern  = ""
  destination_arn = aws_kinesis_firehose_delivery_stream.rum_archive.arn
  role_arn        = aws_iam_role.cwl_to_firehose.arn
}
