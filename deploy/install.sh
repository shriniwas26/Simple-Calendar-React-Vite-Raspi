#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"
validate_deploy_config

echo "=== Calendar Kiosk Pi Deploy ==="
echo "Using host=$PI_HOST user=$PI_USER remote_dir=$REMOTE_DIR"
echo "Set DEPLOY_ENV_FILE to override env file path (default: deploy/.env)."
echo "Set DRY_RUN=1 to preview rsync/ssh/scp commands."

if [[ "$ENABLE_PROVISIONING" == "1" ]]; then
	echo "[1/4] Running provisioning..."
	"$SCRIPT_DIR/provision.sh"
else
	echo "[1/4] Skipping provisioning (set ENABLE_PROVISIONING=1 to enable)."
fi

echo "[2/4] Building artifacts..."
"$SCRIPT_DIR/build-artifacts.sh"

echo "[3/4] Deploying artifacts..."
"$SCRIPT_DIR/deploy-artifacts.sh"

echo "[4/4] Restarting services..."
"$SCRIPT_DIR/restart-services.sh"
