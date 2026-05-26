#!/usr/bin/env bash
# SSL (Let's Encrypt) для OrenPlace
# Требуется домен, указывающий на IP сервера (A-запись).
#
# 1. Задайте в scripts/deploy.config:
#    DOMAIN=orenplace.ru
#    SSL_EMAIL=you@example.com
# 2. sudo bash scripts/setup-ssl.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=/dev/null
source "$ROOT/scripts/deploy.config"

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }
ok() { printf '\033[1;32m✓ %s\033[0m\n' "$1"; }
die() { printf '\033[1;31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

if [[ "${EUID:-}" -ne 0 ]]; then
  die "Запустите от root: sudo bash scripts/setup-ssl.sh"
fi

DOMAIN="${DOMAIN:-}"
SSL_EMAIL="${SSL_EMAIL:-}"

if [[ -z "$DOMAIN" ]]; then
  die "Укажите DOMAIN в scripts/deploy.config (например DOMAIN=orenplace.ru)"
fi

if [[ -z "$SSL_EMAIL" ]]; then
  die "Укажите SSL_EMAIL в scripts/deploy.config (для Let's Encrypt)"
fi

docker_compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    die "Установите Docker Compose: bash scripts/install-docker.sh"
  fi
}

log "Проверка DNS: $DOMAIN → $SERVER_IP"
resolved="$(getent ahosts "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
if [[ -n "$resolved" && "$resolved" != "$SERVER_IP" ]]; then
  warn_dns="DNS $DOMAIN → $resolved (ожидался $SERVER_IP). Продолжаем, но certbot может упасть."
  printf '\033[1;33m⚠ %s\033[0m\n' "$warn_dns"
fi

log "Установка certbot"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y certbot

mkdir -p "$ROOT/certbot/www/.well-known/acme-challenge"

log "Подготовка nginx для ACME-challenge"
# HTTP-конфиг с webroot (без редиректа на HTTPS)
export HTTP_PORT
docker_compose -f docker-compose.prod.yml --env-file .env.production up -d nginx 2>/dev/null || \
  docker_compose -f docker-compose.prod.yml --env-file .env.production up -d

sleep 2

log "Получение сертификата Let's Encrypt"
certbot certonly --webroot \
  -w "$ROOT/certbot/www" \
  -d "$DOMAIN" \
  --email "$SSL_EMAIL" \
  --agree-tos \
  --non-interactive \
  --keep-until-expiring

log "Конфиг nginx с SSL"
sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$ROOT/nginx/default.ssl.conf" > "$ROOT/nginx/default.ssl.active.conf"

# docker-compose.ssl использует active-конфиг
if ! grep -q 'default.ssl.active.conf' "$ROOT/docker-compose.ssl.yml" 2>/dev/null; then
  :
fi

# Патчим ssl compose на active conf
cat > "$ROOT/docker-compose.ssl.yml" <<EOF
# Сгенерировано setup-ssl.sh — не редактировать вручную
services:
  nginx:
    ports:
      - '\${HTTP_PORT:-80}:80'
      - '443:443'
    volumes:
      - ./landing:/usr/share/nginx/html/landing:ro
      - ./nginx/default.ssl.active.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot/www:/var/www/certbot:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
EOF

log "Перезапуск nginx с HTTPS"
docker_compose -f docker-compose.prod.yml -f docker-compose.ssl.yml --env-file .env.production up -d nginx

log "Автопродление (cron)"
renew_hook="docker compose -f ${ROOT}/docker-compose.prod.yml -f ${ROOT}/docker-compose.ssl.yml --env-file ${ROOT}/.env.production restart nginx"
if command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
  renew_hook="docker-compose -f ${ROOT}/docker-compose.prod.yml -f ${ROOT}/docker-compose.ssl.yml --env-file ${ROOT}/.env.production restart nginx"
fi

if ! grep -q 'orenplace-certbot-renew' /etc/cron.d/orenplace 2>/dev/null; then
  cat > /etc/cron.d/orenplace <<CRON
0 3 * * * root certbot renew --quiet --deploy-hook "${renew_hook}"
CRON
fi

# Обновить URL в mobile env (опционально)
HTTPS_URL="https://${DOMAIN}"
if [[ -f "$ROOT/mobile/.env.production" ]]; then
  sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=${HTTPS_URL}/api|" "$ROOT/mobile/.env.production" || true
  sed -i "s|EXPO_PUBLIC_API_ORIGIN=.*|EXPO_PUBLIC_API_ORIGIN=${HTTPS_URL}|" "$ROOT/mobile/.env.production" || true
fi

if [[ -f "$ROOT/mobile/eas.json" ]]; then
  sed -i "s|http://${SERVER_IP}/api|${HTTPS_URL}/api|g" "$ROOT/mobile/eas.json" || true
  sed -i "s|https://${SERVER_IP}/api|${HTTPS_URL}/api|g" "$ROOT/mobile/eas.json" || true
fi

ok "SSL настроен"
cat <<EOF

  Сайт:    https://${DOMAIN}/
  API:     https://${DOMAIN}/api
  Админка: https://${DOMAIN}/admin/

  Пересоберите APK с новым API URL (https).
EOF
