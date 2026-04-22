#!/usr/bin/env bash
set -euo pipefail

PI_HOST="root@192.168.1.3"
PI_USER="pi@192.168.1.3"
REMOTE_DIR="/opt/calendar-kiosk"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Calendar Kiosk Pi Deploy ==="

# --- System packages ---

# echo "[1/9] Updating package list..."
# ssh "$PI_HOST" "apt-get update -qq"

# echo "[2/9] Ensuring Node.js 24 is installed..."
# ssh "$PI_HOST" 'command -v node &>/dev/null || (curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y nodejs)'

# echo "[3/9] Ensuring Chromium and dependencies are installed..."
# ssh "$PI_HOST" "apt-get install -y --no-install-recommends chromium fontconfig fonts-dejavu xdotool unclutter"
# ssh "$PI_USER" "fc-cache -fv"

# --- Disable screen blanking ---

echo "[4/9] Disabling screen blanking..."
ssh "$PI_HOST" "mkdir -p /etc/X11/xorg.conf.d"
ssh "$PI_HOST" 'cat > /etc/X11/xorg.conf.d/10-no-blanking.conf << EOF
Section "ServerFlags"
    Option "BlankTime"  "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime"     "0"
EndSection
EOF'

# --- Application directories ---

echo "[5/9] Ensuring application directories exist..."
ssh "$PI_HOST" "mkdir -p $REMOTE_DIR/backend/dist $REMOTE_DIR/frontend/dist && chown -R pi:pi $REMOTE_DIR"

# --- Build locally ---

echo "[6/9] Building backend and frontend..."
(cd "$ROOT_DIR/backend" && npm run build)
(cd "$ROOT_DIR/frontend" && npm run build)

# --- Deploy to Pi ---

echo "[7/9] Deploying to Pi..."

rsync -avz --delete \
  "$ROOT_DIR/backend/dist/" "$PI_USER:$REMOTE_DIR/backend/dist/"

rsync -avz \
  "$ROOT_DIR/backend/package.json" "$ROOT_DIR/backend/package-lock.json" \
  "$PI_USER:$REMOTE_DIR/backend/"

rsync -avz \
  "$ROOT_DIR/backend/.env" "$PI_USER:$REMOTE_DIR/backend/.env"

# ICS feed list (config loads ics.json from WorkingDirectory; must exist on the Pi)
rsync -avz \
  "$ROOT_DIR/backend/ics.json.example" "$PI_USER:$REMOTE_DIR/backend/ics.json.example"
if [[ -f "$ROOT_DIR/backend/ics.json" ]]; then
  rsync -avz \
    "$ROOT_DIR/backend/ics.json" "$PI_USER:$REMOTE_DIR/backend/ics.json"
fi
ssh "$PI_USER" "if [ ! -f $REMOTE_DIR/backend/ics.json ]; then cp -a $REMOTE_DIR/backend/ics.json.example $REMOTE_DIR/backend/ics.json; fi"

ssh "$PI_USER" "cd $REMOTE_DIR/backend && npm install --omit=dev"

rsync -avz --delete \
  "$ROOT_DIR/frontend/dist/" "$PI_USER:$REMOTE_DIR/frontend/dist/"

# --- Clean up stale services ---

ssh "$PI_HOST" "systemctl disable --now calendar-frontend.service 2>/dev/null || true"
ssh "$PI_HOST" "rm -f /etc/systemd/system/calendar-frontend.service"

# --- Systemd units ---

echo "[8/9] Installing systemd units..."
scp "$SCRIPT_DIR/calendar-backend.service" "$PI_HOST:/etc/systemd/system/"
scp "$SCRIPT_DIR/calendar-kiosk.service" "$PI_HOST:/etc/systemd/system/"

ssh "$PI_HOST" "systemctl daemon-reload && systemctl enable calendar-backend calendar-kiosk"

# --- Start ---

echo "[9/9] Restarting services..."
ssh "$PI_HOST" "systemctl restart calendar-backend calendar-kiosk || systemctl start calendar-backend calendar-kiosk"

echo ""
echo "=== Deploy complete ==="
echo "Backend + Frontend: http://192.168.1.3:4000"
echo "API:                http://192.168.1.3:4000/api/events"
echo "Kiosk:              Chromium on :0 -> http://localhost:4000"
