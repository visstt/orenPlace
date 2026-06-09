#!/usr/bin/env bash
# Compose v2 без apt (когда docker-compose-plugin недоступен)
# Запуск: sudo bash scripts/install-compose-v2.sh
set -euo pipefail

if [[ "${EUID:-}" -ne 0 ]]; then
  echo "Запустите от root: sudo bash scripts/install-compose-v2.sh" >&2
  exit 1
fi

arch="$(uname -m)"
case "$arch" in
  x86_64) arch="x86_64" ;;
  aarch64|arm64) arch="aarch64" ;;
  *)
    echo "Неподдерживаемая архитектура: $arch" >&2
    exit 1
    ;;
esac

if ! command -v curl >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y curl
fi

mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL \
  "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-${arch}" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo ""
docker compose version
echo ""
echo "OK. Дальше:"
echo "  cd /home/egor/var/www/orenPlace"
echo "  export HTTP_PORT=29"
echo "  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build"
