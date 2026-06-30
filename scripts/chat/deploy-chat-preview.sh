#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-zou-minowa-portfolio}"
AWS_REGION="${AWS_REGION:-eu-west-2}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"

function_exists() {
  local name="$1"
  aws lambda get-function --function-name "$name" >/dev/null 2>&1
}

create_function() {
  local name="$1" zip_path="$2"
  aws lambda create-function \
    --function-name "$name" \
    --runtime nodejs22.x \
    --handler index.handler \
    --architectures arm64 \
    --role "$CHAT_PREVIEW_ROLE_ARN" \
    --memory-size 512 \
    --timeout 30 \
    --reserved-concurrent-executions 2 \
    --zip-file "fileb://${zip_path}" \
    --environment "Variables={CHAT_TABLE_NAME=${CHAT_PREVIEW_TABLE_NAME},CHAT_MODEL_ID=${CHAT_MODEL_ID},CHAT_GUARDRAIL_ID=${CHAT_GUARDRAIL_ID},CHAT_GUARDRAIL_VERSION=${CHAT_GUARDRAIL_VERSION}}" \
    >/dev/null
  aws lambda wait function-active --function-name "$name"
}

update_function_config() {
  local name="$1"
  aws lambda update-function-configuration \
    --function-name "$name" \
    --environment "Variables={CHAT_TABLE_NAME=${CHAT_PREVIEW_TABLE_NAME},CHAT_MODEL_ID=${CHAT_MODEL_ID},CHAT_GUARDRAIL_ID=${CHAT_GUARDRAIL_ID},CHAT_GUARDRAIL_VERSION=${CHAT_GUARDRAIL_VERSION}}" \
    >/dev/null
  aws lambda wait function-updated --function-name "$name"
}

grant_invoke() {
  local name="$1" account="$2"
  aws lambda add-permission \
    --function-name "$name" \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${AWS_REGION}:${account}:${CHAT_PREVIEW_API_ID}/*/*" \
    >/dev/null
}

ensure_stage() {
  local stage="$1"
  if aws apigatewayv2 get-stage --api-id "$CHAT_PREVIEW_API_ID" --stage-name "$stage" >/dev/null 2>&1; then
    return
  fi
  aws apigatewayv2 create-stage \
    --api-id "$CHAT_PREVIEW_API_ID" \
    --stage-name "$stage" \
    --auto-deploy \
    --stage-variables "previewId=${PREVIEW_ID}" \
    --default-route-settings "ThrottlingRateLimit=5,ThrottlingBurstLimit=10" \
    >/dev/null
}

emit_url() {
  local stage="$1"
  local url="https://${CHAT_PREVIEW_API_ID}.execute-api.${AWS_REGION}.amazonaws.com/${stage}/chat"
  echo "$url"
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "chat_api_url=${url}" >>"$GITHUB_OUTPUT"
  fi
}

main() {
  require PREVIEW_ID
  require CHAT_PREVIEW_API_ID
  require CHAT_PREVIEW_ROLE_ARN
  require CHAT_PREVIEW_TABLE_NAME
  require CHAT_MODEL_ID
  require CHAT_GUARDRAIL_ID
  require CHAT_GUARDRAIL_VERSION

  local name="${PROJECT_NAME}-chat-preview-${PREVIEW_ID}"
  local stage="${PREVIEW_ID}"
  local dist_dir="${CHAT_DIST_DIR:-apps/chat/dist}"
  local zip_path
  zip_path="$(pwd)/${PROJECT_NAME}-chat-preview-${PREVIEW_ID}.zip"

  local account
  account="$(aws sts get-caller-identity --query Account --output text)"

  build_zip "$dist_dir" "$zip_path"

  if function_exists "$name"; then
    update_function "$name" "$zip_path"
    update_function_config "$name"
  else
    create_function "$name" "$zip_path"
    grant_invoke "$name" "$account"
  fi

  ensure_stage "$stage"
  emit_url "$stage"
}

main
