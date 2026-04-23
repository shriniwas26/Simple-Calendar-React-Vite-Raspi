#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"
validate_deploy_config

echo "[provision] Updating package list..."
ssh_cmd "$PI_HOST" "apt-get update -qq"

echo "[provision] Ensuring Node.js 24 is installed..."
ssh_cmd "$PI_HOST" 'command -v node &>/dev/null || (curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y nodejs)'

echo "[provision] Ensuring Chromium and dependencies are installed..."
ssh_cmd "$PI_HOST" "apt-get install -y --no-install-recommends chromium fontconfig fonts-dejavu xdotool unclutter"
ssh_cmd "$PI_USER" "fc-cache -fv"

echo "[provision] Disabling screen blanking..."
ssh_cmd "$PI_HOST" "mkdir -p /etc/X11/xorg.conf.d"
ssh_cmd "$PI_HOST" 'cat > /etc/X11/xorg.conf.d/10-no-blanking.conf << EOF
Section "ServerFlags"
    Option "BlankTime"  "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime"     "0"
EndSection
EOF'
