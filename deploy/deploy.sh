#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="/var/www/epicmoments"

echo "==> Pulling latest code"
cd "$REPO_DIR"
git pull origin main

echo "==> Installing backend dependencies"
cd "$REPO_DIR/backend"
npm install --omit=dev

for APP in frontend admin; do
  echo "==> Building $APP"
  cd "$REPO_DIR/$APP"
  npm install
  npm run build
  rm -rf "$WEB_DIR/$APP"
  mkdir -p "$WEB_DIR/$APP"
  cp -r dist/* "$WEB_DIR/$APP/"
done

echo "==> Restarting backend"
cd "$REPO_DIR"
pm2 startOrReload deploy/ecosystem.config.cjs
pm2 save

echo "==> Reloading Nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "Deploy complete"
