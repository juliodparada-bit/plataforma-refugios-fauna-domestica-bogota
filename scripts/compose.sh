#!/bin/sh
set -eu
raiz="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$raiz"

sock="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/podman/podman.sock"
if command -v systemctl >/dev/null 2>&1 && [ ! -S "$sock" ]; then
  systemctl --user start podman.socket >/dev/null 2>&1 || true
fi
if [ -S "$sock" ] && [ -z "${DOCKER_HOST:-}" ]; then
  export DOCKER_HOST="unix://$sock"
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  exec docker compose "$@"
fi

if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
  exec podman compose "$@"
fi

if command -v podman-compose >/dev/null 2>&1; then
  exec podman-compose "$@"
fi

echo "No hay Compose en este computador." >&2
echo "Fedora / RHEL:  sudo dnf install podman-compose" >&2
echo "Windows / macOS: Docker Desktop (incluye docker compose)." >&2
exit 1
