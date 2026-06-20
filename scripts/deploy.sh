#!/usr/bin/env bash
set -euo pipefail

resolve_destination() {
  local bucket="${DEPLOY_BUCKET:-zou-minowa-portfolio}"
  local prefix="${DEPLOY_PREFIX:-}"
  echo "s3://${bucket}${prefix:+/${prefix}}"
}

sync_hashed_assets() {
  local dist_dir="$1" dest="$2"
  aws s3 sync "$dist_dir" "$dest" \
    --exclude "*" \
    --include "_astro/*" \
    --cache-control "public,max-age=31536000,immutable" \
    --metadata-directive REPLACE
}

sync_html_and_rest() {
  local dist_dir="$1" dest="$2"
  aws s3 sync "$dist_dir" "$dest" \
    --exclude "_astro/*" \
    --cache-control "public,max-age=0,must-revalidate" \
    --metadata-directive REPLACE \
    --delete
}

main() {
  local dist_dir="${DEPLOY_DIST_DIR:-frontend/dist}"
  local dest
  dest="$(resolve_destination)"

  sync_hashed_assets "$dist_dir" "$dest"
  sync_html_and_rest "$dist_dir" "$dest"
}

main
