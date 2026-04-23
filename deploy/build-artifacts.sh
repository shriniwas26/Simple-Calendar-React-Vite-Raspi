#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

echo "[build] Building backend and frontend..."
(cd "$ROOT_DIR/backend" && npm run build)
(cd "$ROOT_DIR/frontend" && npm run build)
