resource "aws_cloudfront_cache_policy" "html" {
  name        = "${var.project_name}-html"
  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_brotli = false
    enable_accept_encoding_gzip   = false
  }
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = var.project_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "rewrite" {
  name    = "${var.project_name}-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/resources/rewrite.js")
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  default_root_object = var.default_root_object
  price_class         = "PriceClass_100"
  aliases             = var.aliases

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.site.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  dynamic "logging_config" {
    for_each = var.enable_logging ? [1] : []
    content {
      bucket          = aws_s3_bucket.logs[0].bucket_domain_name
      prefix          = "cloudfront/"
      include_cookies = false
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.enable_asset_cache_behaviors ? [
      { pattern = "/_astro/*" },
      { pattern = "/fonts/*" }
    ] : []
    content {
      path_pattern               = ordered_cache_behavior.value.pattern
      allowed_methods            = ["GET", "HEAD"]
      cached_methods             = ["GET", "HEAD"]
      target_origin_id           = "s3-${aws_s3_bucket.site.id}"
      viewer_protocol_policy     = "redirect-to-https"
      cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
      response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
      compress                   = true
    }
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-${aws_s3_bucket.site.id}"
    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = aws_cloudfront_cache_policy.html.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    compress                   = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite.arn
    }
  }

  # S3 with OAC returns 403 (not 404) for missing objects — map to the custom 404 page
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 500
    response_code         = 500
    response_page_path    = "/500.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 502
    response_code         = 502
    response_page_path    = "/500.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 503
    response_code         = 503
    response_page_path    = "/500.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 504
    response_code         = 504
    response_page_path    = "/500.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.acm_certificate_arn == null ? true : null
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = var.acm_certificate_arn == null ? null : "sni-only"
    minimum_protocol_version       = var.acm_certificate_arn == null ? null : "TLSv1.2_2021"
  }
}
