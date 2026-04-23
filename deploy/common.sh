#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-$SCRIPT_DIR/.env}"

if [[ -f "$DEPLOY_ENV_FILE" ]]; then
	# shellcheck disable=SC1090
	source "$DEPLOY_ENV_FILE"
fi

PI_HOST="${PI_HOST:-root@192.168.1.3}"
PI_USER="${PI_USER:-pi@192.168.1.3}"
REMOTE_DIR="${REMOTE_DIR:-/opt/calendar-kiosk}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://192.168.1.3:4000}"
ENABLE_PROVISIONING="${ENABLE_PROVISIONING:-0}"
DRY_RUN="${DRY_RUN:-0}"

require_var() {
	local key="$1"
	local value="${!key:-}"
	if [[ -z "$value" ]]; then
		echo "Missing required variable: $key" >&2
		exit 1
	fi
}

validate_deploy_config() {
	require_var PI_HOST
	require_var PI_USER
	require_var REMOTE_DIR
	require_var PUBLIC_BASE_URL
}

rsync_cmd() {
	if [[ "$DRY_RUN" == "1" ]]; then
		rsync -n "$@"
	else
		rsync "$@"
	fi
}

ssh_cmd() {
	if [[ "$DRY_RUN" == "1" ]]; then
		echo "[DRY_RUN] ssh $*"
	else
		ssh "$@"
	fi
}

scp_cmd() {
	if [[ "$DRY_RUN" == "1" ]]; then
		echo "[DRY_RUN] scp $*"
	else
		scp "$@"
	fi
}
