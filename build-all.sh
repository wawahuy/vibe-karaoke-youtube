#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> [1/4] Building frontend..."
(cd "$ROOT_DIR/frontend" && npm run build)

echo "==> [2/4] Building backend..."
(cd "$ROOT_DIR/backend" && npm run build)

echo "==> [3/4] Compiling Electron main process..."
(cd "$ROOT_DIR/electron" && npm run build)

echo "==> [4/4] Rebuilding native modules for Electron + packaging for Linux..."
(cd "$ROOT_DIR/electron" && npm run rebuild:backend && npx electron-builder --linux)

echo ""
echo "Done! Packages are in: $ROOT_DIR/electron/release/"
