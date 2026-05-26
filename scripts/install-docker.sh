#!/usr/bin/env bash
# Установка Docker + Compose на Ubuntu/Debian (VPS)
# Запуск: sudo bash scripts/install-docker.sh
set -euo pipefail

if [[ "${EUID:-}" -ne 0 ]]; then
  echo "Запустите от root: sudo bash scripts/install-docker.sh" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

log() { printf '\n▶ %s\n' "$1"; }

log "Обновление пакетов"
apt-get update -qq

log "Установка Docker"
apt-get install -y docker.io docker-compose-plugin

# На части образов полезен и классический бинарник
if ! docker compose version >/dev/null 2>&1; then
  apt-get install -y docker-compose || true
fi

log "Запуск Docker"
systemctl enable docker
systemctl start docker

if docker compose version >/dev/null 2>&1; then
  docker compose version
  echo ""
  echo "OK: используйте «docker compose»"
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose version
  echo ""
  echo "OK: используйте «docker-compose»"
else
  echo "Ошибка: Compose не найден после установки" >&2
  exit 1
fi

echo ""
echo "Дальше: cd /var/www/orenPlace && bash scripts/deploy.sh --no-apk"
