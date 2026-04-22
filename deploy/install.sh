#!/usr/bin/env bash
set -euo pipefail

PI_HOST="root@192.168.1.3"
REMOTE_DIR="/opt/calendar-kiosk"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Calendar Kiosk Pi Setup ==="

# --- System packages ---

echo "Updating package list..."
ssh "$PI_HOST" "apt-get update -qq"

echo "Ensuring Node.js 24 is installed..."
ssh "$PI_HOST" 'command -v node &>/dev/null || (curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y nodejs)'

echo "Ensuring Chromium and dependencies are installed..."
ssh "$PI_HOST" "apt-get install -y --no-install-recommends chromium fontconfig fonts-dejavu xdotool unclutter"

# --- Disable screen blanking / power management ---

echo "Disabling screen blanking..."
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

echo "Ensuring application directories exist..."
ssh "$PI_HOST" "mkdir -p $REMOTE_DIR/backend/dist $REMOTE_DIR/frontend/dist && chown -R pi:pi $REMOTE_DIR"

# --- .env ---

if ssh "$PI_HOST" "test ! -f $REMOTE_DIR/backend/.env"; then
  echo "Creating .env from template..."
  scp "$SCRIPT_DIR/../backend/.env.example" "$PI_HOST:$REMOTE_DIR/backend/.env"
  ssh "$PI_HOST" "chown pi:pi $REMOTE_DIR/backend/.env"
  echo ""
  echo "  >>> IMPORTANT: Edit $REMOTE_DIR/backend/.env on the Pi with your ICS URLs <<<"
  echo ""
else
  echo ".env already exists, skipping."
  if ! ssh "$PI_HOST" "grep -q STATIC_DIR $REMOTE_DIR/backend/.env"; then
    echo "Adding STATIC_DIR to existing .env..."
    ssh "$PI_HOST" "echo 'STATIC_DIR=$REMOTE_DIR/frontend/dist' >> $REMOTE_DIR/backend/.env"
  fi
fi

# --- Clean up stale services ---

echo "Removing stale calendar-frontend.service (if present)..."
ssh "$PI_HOST" "systemctl disable --now calendar-frontend.service 2>/dev/null || true"
ssh "$PI_HOST" "rm -f /etc/systemd/system/calendar-frontend.service"

# --- Systemd units ---

echo "Copying systemd units..."
scp "$SCRIPT_DIR/calendar-backend.service" "$PI_HOST:/etc/systemd/system/"
scp "$SCRIPT_DIR/calendar-kiosk.service" "$PI_HOST:/etc/systemd/system/"

echo "Reloading and enabling services..."
ssh "$PI_HOST" "systemctl daemon-reload && systemctl enable calendar-backend calendar-kiosk"

# --- Initial deploy (build locally, push to Pi) ---

echo "Running initial sync..."
"$SCRIPT_DIR/sync.sh"

# --- Start services ---

echo "Restarting services..."
ssh "$PI_HOST" "systemctl restart calendar-backend calendar-kiosk || systemctl start calendar-backend calendar-kiosk"

echo ""
echo "=== Setup complete ==="
echo "Backend + Frontend: http://192.168.1.3:4000"
echo "API:                http://192.168.1.3:4000/api/events"
echo "Kiosk:              Chromium on :0 -> http://localhost:4000"
echo ""
echo "Remember to edit $REMOTE_DIR/backend/.env on the Pi with your calendar URLs."
