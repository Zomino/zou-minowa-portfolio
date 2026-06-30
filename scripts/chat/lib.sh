#!/usr/bin/env bash

require() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "Missing required environment variable: ${name}" >&2
    exit 1
  fi
}

build_zip() {
  local dist_dir="$1" zip_path="$2"
  rm -f "$zip_path"
  (cd "$dist_dir" && zip -q -X "$zip_path" index.mjs)
}

update_function() {
  local name="$1" zip_path="$2"
  aws lambda update-function-code \
    --function-name "$name" \
    --zip-file "fileb://${zip_path}" \
    >/dev/null
  aws lambda wait function-updated --function-name "$name"
}
