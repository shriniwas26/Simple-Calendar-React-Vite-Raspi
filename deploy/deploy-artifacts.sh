#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"
validate_deploy_config

echo "[deploy] Ensuring application directories exist..."
ssh_cmd "$PI_HOST" "mkdir -p $REMOTE_DIR/backend/dist $REMOTE_DIR/frontend/dist && chown -R pi:pi $REMOTE_DIR"

echo "[deploy] Syncing backend dist..."
rsync_cmd -avzh --delete \
	"$ROOT_DIR/backend/dist/" "$PI_USER:$REMOTE_DIR/backend/dist/"

echo "[deploy] Syncing backend package metadata..."
rsync_cmd -avzh \
	"$ROOT_DIR/backend/package.json" "$ROOT_DIR/backend/package-lock.json" \
	"$PI_USER:$REMOTE_DIR/backend/"

if [[ -f "$ROOT_DIR/backend/.env" ]]; then
	echo "[deploy] Syncing backend .env..."
	rsync_cmd -avzh \
		"$ROOT_DIR/backend/.env" "$PI_USER:$REMOTE_DIR/backend/.env"
fi

echo "[deploy] Syncing ICS config..."
rsync_cmd -avzh \
	"$ROOT_DIR/backend/ics.json.example" "$PI_USER:$REMOTE_DIR/backend/ics.json.example"
if [[ -f "$ROOT_DIR/backend/ics.json" ]]; then
	rsync_cmd -avzh \
		"$ROOT_DIR/backend/ics.json" "$PI_USER:$REMOTE_DIR/backend/ics.json"
fi
ssh_cmd "$PI_USER" "if [ ! -f $REMOTE_DIR/backend/ics.json ]; then cp -a $REMOTE_DIR/backend/ics.json.example $REMOTE_DIR/backend/ics.json; fi"

echo "[deploy] Installing backend runtime dependencies..."
ssh_cmd "$PI_USER" "cd $REMOTE_DIR/backend && npm install --omit=dev"

echo "[deploy] Syncing frontend dist..."
rsync_cmd -avzh --delete \
	"$ROOT_DIR/frontend/dist/" "$PI_USER:$REMOTE_DIR/frontend/dist/"
