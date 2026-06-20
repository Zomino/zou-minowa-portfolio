#!/usr/bin/env bash
set -euo pipefail

BUCKET="${DEPLOY_BUCKET:-$(terraform -chdir=infra output -raw bucket_name)}"
DIST_ID="${DEPLOY_DISTRIBUTION_ID:-$(terraform -chdir=infra output -raw distribution_id)}"
DIST_DIR="${DEPLOY_DIST_DIR:-frontend/dist}"

aws s3 sync "$DIST_DIR" "s3://$BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
