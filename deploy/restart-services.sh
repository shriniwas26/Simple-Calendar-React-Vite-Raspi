#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"
validate_deploy_config

echo "[services] Cleaning stale units..."
ssh_cmd "$PI_HOST" "systemctl disable --now calendar-frontend.service 2>/dev/null || true"
ssh_cmd "$PI_HOST" "rm -f /etc/systemd/system/calendar-frontend.service"

echo "[services] Installing systemd units..."
scp_cmd "$SCRIPT_DIR/calendar-backend.service" "$PI_HOST:/etc/systemd/system/"
scp_cmd "$SCRIPT_DIR/calendar-kiosk.service" "$PI_HOST:/etc/systemd/system/"
ssh_cmd "$PI_HOST" "systemctl daemon-reload && systemctl enable calendar-backend calendar-kiosk"

echo "[services] Restarting services..."
ssh_cmd "$PI_HOST" "systemctl restart calendar-backend calendar-kiosk || systemctl start calendar-backend calendar-kiosk"

echo ""
echo "=== Deploy complete ==="
echo "Backend + Frontend: $PUBLIC_BASE_URL"
echo "API:                $PUBLIC_BASE_URL/api/events"
echo "Kiosk:              Chromium on :0 -> http://localhost:${PUBLIC_BASE_URL##*:}"
