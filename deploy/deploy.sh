#!/usr/bin/env bash
# ============================================================
#  Epic Moments — build & deploy script (run on the Oracle VM)
#  Assumes the repo is cloned at /var/www/epicmoments-src and
#  Nginx serves builds from /var/www/epicmoments/{frontend,admin}
#
#  Usage:  bash deploy/deploy.sh
# ============================================================
set -e

REPO_DIR="/var/www/epicmoments-src"
WEB_DIR="/var/www/epicmoments"

echo "==> Pulling latest code..."
cd "$REPO_DIR"
git pull origin main

echo "==> Installing & building backend deps..."
cd "$REPO_DIR/backend"
npm install --omit=dev

echo "==> Building frontend..."
cd "$REPO_DIR/frontend"
npm install
npm run build
rm -rf "$WEB_DIR/frontend"
mkdir -p "$WEB_DIR/frontend"
cp -r dist/* "$WEB_DIR/frontend/"

echo "==> Building admin..."
cd "$REPO_DIR/admin"
npm install
npm run build
rm -rf "$WEB_DIR/admin"
mkdir -p "$WEB_DIR/admin"
cp -r dist/* "$WEB_DIR/admin/"

echo "==> Restarting backend (PM2)..."
cd "$REPO_DIR"
pm2 startOrReload deploy/ecosystem.config.cjs
pm2 save

echo "==> Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deploy complete."
