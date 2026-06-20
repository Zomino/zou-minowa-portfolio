#!/usr/bin/env bash
set -euo pipefail

BUCKET="${DEPLOY_BUCKET:-$(terraform -chdir=infra output -raw bucket_name)}"
DIST_DIR="${DEPLOY_DIST_DIR:-frontend/dist}"

aws s3 sync "$DIST_DIR" "s3://$BUCKET" \
  --exclude "*" \
  --include "_astro/*" \
  --cache-control "public,max-age=31536000,immutable" \
  --metadata-directive REPLACE

aws s3 sync "$DIST_DIR" "s3://$BUCKET" \
  --exclude "_astro/*" \
  --cache-control "public,max-age=0,must-revalidate" \
  --metadata-directive REPLACE \
  --delete
