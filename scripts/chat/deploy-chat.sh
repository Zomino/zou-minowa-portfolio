#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-zou-minowa-portfolio}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"

main() {
  local name="${PROJECT_NAME}-chat"
  local dist_dir="${CHAT_DIST_DIR:-apps/chat/dist}"
  local zip_path
  zip_path="$(pwd)/${PROJECT_NAME}-chat.zip"

  build_zip "$dist_dir" "$zip_path"
  update_function "$name" "$zip_path"
}

main
