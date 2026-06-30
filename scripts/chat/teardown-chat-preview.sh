#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-zou-minowa-portfolio}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"

delete_stage() {
  local stage="$1"
  if aws apigatewayv2 get-stage --api-id "$CHAT_PREVIEW_API_ID" --stage-name "$stage" >/dev/null 2>&1; then
    aws apigatewayv2 delete-stage --api-id "$CHAT_PREVIEW_API_ID" --stage-name "$stage"
  fi
}

delete_function() {
  local name="$1"
  if aws lambda get-function --function-name "$name" >/dev/null 2>&1; then
    aws lambda delete-function --function-name "$name"
  fi
}

main() {
  require PREVIEW_ID
  require CHAT_PREVIEW_API_ID

  local name="${PROJECT_NAME}-chat-preview-${PREVIEW_ID}"
  local stage="${PREVIEW_ID}"

  delete_stage "$stage"
  delete_function "$name"
}

main
