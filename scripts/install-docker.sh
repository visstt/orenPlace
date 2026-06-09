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

install_compose_plugin_binary() {
  local arch
  arch="$(uname -m)"
  case "$arch" in
    x86_64) arch="x86_64" ;;
    aarch64|arm64) arch="aarch64" ;;
    *)
      echo "Неподдерживаемая архитектура: $arch" >&2
      return 1
      ;;
  esac

  log "Установка Compose v2 (бинарник с GitHub)"
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL \
    "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-${arch}" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
}

add_docker_official_repo() {
  log "Добавление официального репозитория Docker"
  apt-get install -y ca-certificates curl gnupg

  install -m 0755 -d /etc/apt/keyrings
  rm -f /etc/apt/keyrings/docker.gpg

  local distro codename
  if [[ -f /etc/os-release ]]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    distro="${ID:-ubuntu}"
    codename="${VERSION_CODENAME:-}"
    if [[ -z "$codename" && -f /etc/debian_version ]]; then
      codename="$(lsb_release -cs 2>/dev/null || true)"
    fi
  else
    distro="ubuntu"
    codename="jammy"
  fi

  case "$distro" in
    ubuntu|debian|raspbian) ;;
    *)
      warn_distro="$distro"
      distro="ubuntu"
      codename="${codename:-jammy}"
      log "Дистрибутив ${warn_distro:-unknown} — пробуем репозиторий Ubuntu ${codename}"
      ;;
  esac

  curl -fsSL "https://download.docker.com/linux/${distro}/gpg" \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${distro} ${codename} stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
}

log "Обновление пакетов"
apt-get update -qq

if ! command -v docker >/dev/null 2>&1; then
  log "Установка Docker"
  if apt-cache show docker-compose-plugin >/dev/null 2>&1; then
    apt-get install -y docker.io docker-compose-plugin
  else
    log "docker-compose-plugin нет в репозиториях — подключаем Docker CE"
    add_docker_official_repo
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  fi
else
  log "Docker уже установлен"
  if ! docker compose version >/dev/null 2>&1; then
    if apt-cache show docker-compose-plugin >/dev/null 2>&1; then
      apt-get install -y docker-compose-plugin
    else
      add_docker_official_repo
      apt-get install -y docker-compose-plugin || install_compose_plugin_binary
    fi
  fi
fi

if ! docker compose version >/dev/null 2>&1; then
  install_compose_plugin_binary
fi

# Классический docker-compose 1.x — только если v2 недоступен
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
  echo "OK: используйте «docker-compose» (legacy, возможны баги — лучше docker compose v2)"
else
  echo "Ошибка: Compose не найден после установки" >&2
  exit 1
fi

echo ""
echo "Дальше: cd /var/www/orenPlace && bash scripts/deploy.sh --no-apk"
