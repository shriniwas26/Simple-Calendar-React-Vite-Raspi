#!/usr/bin/env bash
set -euo pipefail

PI_HOST="pi@192.168.1.3"
REMOTE_DIR="/opt/calendar-kiosk"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Building backend..."
(cd "$ROOT_DIR/backend" && npm run build)

echo "Building frontend..."
(cd "$ROOT_DIR/frontend" && npm run build)

echo "Ensuring remote directories exist..."
ssh "$PI_HOST" "mkdir -p $REMOTE_DIR/backend/dist $REMOTE_DIR/frontend/dist"

echo "Syncing backend dist + package files to $PI_HOST..."
rsync -avz --delete \
  "$ROOT_DIR/backend/dist/" "$PI_HOST:$REMOTE_DIR/backend/dist/"
rsync -avz \
  "$ROOT_DIR/backend/package.json" "$ROOT_DIR/backend/package-lock.json" \
  "$PI_HOST:$REMOTE_DIR/backend/"

echo "Installing backend production dependencies on Pi..."
ssh "$PI_HOST" "cd $REMOTE_DIR/backend && npm install --omit=dev"

echo "Syncing frontend dist to $PI_HOST..."
rsync -avz --delete \
  "$ROOT_DIR/frontend/dist/" "$PI_HOST:$REMOTE_DIR/frontend/dist/"

echo "Restarting services (if active)..."
ssh "$PI_HOST" "sudo systemctl try-restart calendar-backend calendar-kiosk"

echo "Done."
