#!/usr/bin/env bash
set -euo pipefail

REMOTE_DIR="/opt/calendar-kiosk"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Calendar Kiosk Pi Setup ==="

if ! command -v node &> /dev/null; then
  echo "Installing Node.js 18 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Installing serve globally..."
sudo npm install -g serve

echo "Creating application directory..."
sudo mkdir -p "$REMOTE_DIR/backend" "$REMOTE_DIR/frontend/dist"
sudo chown -R "$(whoami):$(whoami)" "$REMOTE_DIR"

if [ ! -f "$REMOTE_DIR/backend/.env" ]; then
  echo "Creating .env from template..."
  cp "$SCRIPT_DIR/../backend/.env.example" "$REMOTE_DIR/backend/.env"
  echo "IMPORTANT: Edit $REMOTE_DIR/backend/.env with your ICS URLs"
fi

echo "Installing systemd units..."
sudo cp "$SCRIPT_DIR/calendar-backend.service" /etc/systemd/system/
sudo cp "$SCRIPT_DIR/calendar-frontend.service" /etc/systemd/system/
sudo cp "$SCRIPT_DIR/calendar-kiosk.service" /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable calendar-backend calendar-frontend calendar-kiosk

echo "Starting services..."
sudo systemctl start calendar-backend calendar-frontend calendar-kiosk

echo ""
echo "=== Setup complete ==="
echo "Backend:  http://localhost:4000/api/events"
echo "Frontend: http://localhost:3000"
echo ""
echo "Remember to edit $REMOTE_DIR/backend/.env with your calendar URLs."
