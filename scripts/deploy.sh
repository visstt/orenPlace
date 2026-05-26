#!/usr/bin/env bash
# Полный деплой OrenPlace на сервере (Linux)
# Использование: ./scripts/deploy.sh [--no-apk] [--no-docker]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=/dev/null
source "$ROOT/scripts/deploy.config"

SERVER_URL="http://${SERVER_IP}"
API_URL="${SERVER_URL}/api"
APK_DEST="$ROOT/landing/downloads/orenplace.apk"

SKIP_APK=false
SKIP_DOCKER=false
for arg in "$@"; do
  case "$arg" in
    --no-apk) SKIP_APK=true ;;
    --no-docker) SKIP_DOCKER=true ;;
  esac
done

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }
ok() { printf '\033[1;32m✓ %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m⚠ %s\033[0m\n' "$1"; }
die() { printf '\033[1;31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

docker_compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    die "Нужен Docker Compose v2 (docker compose) или docker-compose"
  fi
}

rand_hex() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "$1"
  else
    head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'
  fi
}

copy_env_if_missing() {
  local example="$1"
  local target="$2"
  if [[ ! -f "$target" ]]; then
    cp "$example" "$target"
    ok "Создан $target из $(basename "$example")"
  else
    ok "Уже есть $(basename "$target")"
  fi
}

ensure_prod_secrets() {
  local env_file="$ROOT/.env.production"
  if grep -q 'change-me-strong-password' "$env_file" 2>/dev/null; then
    local pg_pass jwt jwt_refresh
    pg_pass="$(rand_hex 16)"
    jwt="$(rand_hex 32)"
    jwt_refresh="$(rand_hex 32)"
    sed -i "s/change-me-strong-password/${pg_pass}/" "$env_file"
    sed -i "s/change-me-long-random-string/${jwt}/" "$env_file"
    sed -i "s/change-me-another-long-random-string/${jwt_refresh}/" "$env_file"
    ok "Сгенерированы секреты в .env.production"
  fi
}

write_mobile_env() {
  local f="$ROOT/mobile/.env.production"
  cat > "$f" <<EOF
# Сгенерировано scripts/deploy.sh
EXPO_PUBLIC_API_URL=${API_URL}
EXPO_PUBLIC_API_ORIGIN=${SERVER_URL}
EOF
  ok "mobile/.env.production → ${API_URL}"
}

write_backend_env() {
  local prod="$ROOT/.env.production"
  local backend_env="$ROOT/backend/.env"
  # DATABASE_URL для локального prisma (хост postgres на 5432 с docker-compose)
  {
    echo "# Сгенерировано scripts/deploy.sh"
    grep -E '^(JWT_|PORT=)' "$prod" || true
    echo "DATABASE_URL=postgresql://$(grep POSTGRES_USER "$prod" | cut -d= -f2):$(grep POSTGRES_PASSWORD "$prod" | cut -d= -f2)@localhost:5432/$(grep POSTGRES_DB "$prod" | cut -d= -f2)?schema=public"
  } > "$backend_env"
  ok "backend/.env синхронизирован"
}

patch_eas_json() {
  local eas="$ROOT/mobile/eas.json"
  if [[ -f "$eas" ]]; then
    sed -i "s|https://YOUR_DOMAIN/api|${API_URL}|g" "$eas"
    sed -i "s|http://YOUR_DOMAIN/api|${API_URL}|g" "$eas"
    ok "mobile/eas.json → ${API_URL}"
  fi
}

build_admin() {
  log "Сборка админ-панели"
  cd "$ROOT/admin"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
  npm run build
  cd "$ROOT"
  ok "admin → backend/admin-static"
}

ensure_mobile_assets() {
  local assets="$ROOT/mobile/assets"
  local defaults="$ROOT/mobile/assets-default"
  mkdir -p "$assets"

  local missing=0
  for f in icon.png adaptive-icon.png splash.png; do
    if [[ ! -f "$assets/$f" ]]; then
      missing=1
      break
    fi
  done

  if [[ $missing -eq 0 ]]; then
    ok "mobile/assets на месте"
    return 0
  fi

  if [[ -d "$defaults" ]]; then
    cp -n "$defaults"/* "$assets/" 2>/dev/null || cp "$defaults"/* "$assets/"
    ok "Скопированы assets из mobile/assets-default/"
    return 0
  fi

  if [[ -x "$ROOT/scripts/generate-mobile-assets.sh" ]]; then
    "$ROOT/scripts/generate-mobile-assets.sh"
    return 0
  fi

  die "Нет mobile/assets (icon.png, splash.png, adaptive-icon.png). Выполните git pull или scripts/generate-mobile-assets.sh"
}

has_java() {
  command -v java >/dev/null 2>&1 && [[ -n "${JAVA_HOME:-}" || -n "$(command -v java)" ]]
}

build_apk() {
  if $SKIP_APK; then
    warn "Пропуск сборки APK (--no-apk)"
    return 0
  fi

  ensure_mobile_assets

  if ! has_java; then
    warn "Java не найдена (JAVA_HOME). APK на сервере не собирается."
    warn "Соберите APK локально: cd mobile && eas build -p android --profile production"
    warn "Затем: scp orenplace.apk root@${SERVER_IP}:/var/www/orenPlace/landing/downloads/"
    return 1
  fi

  log "Сборка Android APK (Expo prebuild + Gradle)"
  cd "$ROOT/mobile"

  export CI=1
  export EXPO_PUBLIC_API_URL="$API_URL"
  export EXPO_PUBLIC_API_ORIGIN="$SERVER_URL"

  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi

  npx expo prebuild --platform android

  cd android
  chmod +x gradlew

  local apk_src=""
  if ./gradlew assembleRelease -x lint --no-daemon; then
    apk_src="app/build/outputs/apk/release/app-release.apk"
  else
    warn "Release не собрался, пробуем debug APK"
    ./gradlew assembleDebug -x lint --no-daemon
    apk_src="app/build/outputs/apk/debug/app-debug.apk"
  fi

  cd "$ROOT"
  if [[ ! -f "$ROOT/mobile/android/$apk_src" ]]; then
    die "APK не найден после сборки: mobile/android/$apk_src"
  fi

  mkdir -p "$(dirname "$APK_DEST")"
  cp "$ROOT/mobile/android/$apk_src" "$APK_DEST"
  ok "APK → landing/downloads/orenplace.apk"
  return 0
}

start_docker() {
  if $SKIP_DOCKER; then
    warn "Пропуск Docker (--no-docker)"
    return
  fi

  log "Запуск Docker-контейнеров"
  if ! command -v docker >/dev/null 2>&1; then
    die "Docker не установлен"
  fi

  export HTTP_PORT
  docker_compose -f docker-compose.prod.yml --env-file .env.production up -d --build
  ok "Контейнеры запущены"
}

print_summary() {
  cat <<EOF

════════════════════════════════════════
  OrenPlace задеплоен
════════════════════════════════════════
  Лендинг:  ${SERVER_URL}/
  API:      ${API_URL}
  Swagger:  ${API_URL%/api}/api/docs
  Админка:  ${SERVER_URL}/admin/
  APK:      ${SERVER_URL}/downloads/orenplace.apk
════════════════════════════════════════
EOF
}

main() {
  log "OrenPlace deploy → ${SERVER_IP}"

  copy_env_if_missing ".env.production.example" ".env.production"
  copy_env_if_missing "backend/.env.example" "backend/.env"
  copy_env_if_missing "mobile/.env.production.example" "mobile/.env.production"

  ensure_prod_secrets
  write_mobile_env
  write_backend_env
  patch_eas_json

  build_admin

  if $SKIP_APK; then
    :
  elif [[ -f "$APK_DEST" ]] && [[ "${FORCE_APK_REBUILD:-0}" != "1" ]]; then
    ok "APK уже есть: landing/downloads/orenplace.apk (FORCE_APK_REBUILD=1 для пересборки)"
  else
    if ! build_apk; then
      warn "APK не собран — лендинг будет без файла до ручной загрузки в landing/downloads/"
    fi
  fi

  start_docker || die "Docker не запустился. Попробуйте: apt install docker-compose-plugin  ИЛИ  docker-compose"
  print_summary
}

main "$@"
