#!/usr/bin/env bash
#
# Incremental deploy for a DigitalOcean Droplet setup (Nginx + PM2).
# Applies Prisma schema changes to the production SQLite DB and refreshes backend/frontend.
#
# Usage (on VPS):
#   cd /root/multbot
#   chmod +x vps-update.sh
#   ./vps-update.sh
#

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: run as root (expected /root/multbot)."
  exit 1
fi

cd "$ROOT_DIR"

echo "[1/7] Git pull"
git pull

echo "[2/7] Install deps"
pnpm install

echo "[3/7] Backend: Prisma push + build"
cd "$ROOT_DIR/packages/backend"
export DATABASE_URL="file:/var/multbot/data/prod.db"
pnpm prisma db push
pnpm prisma generate
pnpm build

echo "[4/7] Restart backend (PM2)"
pm2 restart multbot-backend

echo "[5/7] Frontend: build"
cd "$ROOT_DIR/packages/frontend"
VITE_API_URL=/api pnpm build

echo "[6/7] Publish frontend"
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

echo "[7/7] Reload nginx"
systemctl reload nginx

echo "OK"

