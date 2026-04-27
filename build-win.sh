#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE="yt-karaoke-builder-win"
OUT_DIR="$ROOT_DIR/electron/release-win"

echo "==> [1/3] Building Docker image (this may take a while the first time)..."
docker build -f "$ROOT_DIR/Dockerfile.win" -t "$IMAGE" "$ROOT_DIR"

echo "==> [2/3] Extracting Windows release from container..."
CONTAINER=$(docker create "$IMAGE")
rm -rf "$OUT_DIR"
docker cp "$CONTAINER:/build/electron/release" "$OUT_DIR"
docker rm "$CONTAINER"

echo ""
echo "Done! Windows packages are in: $OUT_DIR"
