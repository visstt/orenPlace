#!/usr/bin/env bash
# Генерация icon/splash для Expo (нужен ImageMagick: apt install imagemagick)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS="$ROOT/mobile/assets"
mkdir -p "$ASSETS"

if ! command -v convert >/dev/null 2>&1; then
  echo "Установите ImageMagick: apt install -y imagemagick" >&2
  exit 1
fi

convert -size 1024x1024 gradient:'#8E2DE2-#4A00E0' \
  -gravity center -pointsize 420 -fill white -annotate 0 'O' \
  "$ASSETS/icon.png"

cp "$ASSETS/icon.png" "$ASSETS/adaptive-icon.png"

convert -size 1284x2778 gradient:'#8E2DE2-#4A00E0' \
  -gravity center -pointsize 520 -fill white -annotate 0 'O' \
  "$ASSETS/splash.png"

echo "OK: $ASSETS/{icon,adaptive-icon,splash}.png"
