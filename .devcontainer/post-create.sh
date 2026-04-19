#!/usr/bin/zsh
set -e
# uo pipefail

echo "==> Installing node dependencies..."
cd /workspaces/shoebox-desktop
pnpm install

echo "==> Verifying X11 display..."
if [ -n "${DISPLAY:-}" ]; then
  echo "    DISPLAY=$DISPLAY"
else
  echo "    WARNING: DISPLAY is not set — GUI apps won't render on host"
fi

echo "==> Populating podman sidecar binary..."
bash /workspaces/shoebox-desktop/scripts/fetch-podman.sh

echo "==> Done!"
