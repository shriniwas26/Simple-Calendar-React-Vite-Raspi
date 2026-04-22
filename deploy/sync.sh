#!/usr/bin/env bash
set -euo pipefail

PI_HOST="${1:?Usage: sync.sh <PI_HOST>}"
REMOTE_DIR="/opt/calendar-kiosk"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Building frontend..."
(cd "$ROOT_DIR/frontend" && npm run build)

echo "Syncing backend to $PI_HOST..."
rsync -avz --delete \
  --exclude node_modules \
  "$ROOT_DIR/backend/" "$PI_HOST:$REMOTE_DIR/backend/"

echo "Installing backend dependencies on Pi..."
ssh "$PI_HOST" "cd $REMOTE_DIR/backend && npm install --production"

echo "Syncing frontend dist to $PI_HOST..."
rsync -avz --delete \
  "$ROOT_DIR/frontend/dist/" "$PI_HOST:$REMOTE_DIR/frontend/dist/"

echo "Restarting services..."
ssh "$PI_HOST" "sudo systemctl restart calendar-backend calendar-frontend"

echo "Done."
