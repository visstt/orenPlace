# Деплой OrenPlace

Инструкция для выкладки на VPS (Linux) с Docker: **лендинг**, **API**, **PostgreSQL**, **админка**.

## Что поднимается

| Сервис   | Назначение                          |
|----------|-------------------------------------|
| nginx    | Лендинг (`/`), прокси API (`/api`)  |
| backend  | NestJS API + админка (`/admin`)     |
| postgres | База данных                         |

После деплоя:
- Сайт: `http://ВАШ_IP/`
- API: `http://ВАШ_IP/api`
- Swagger: `http://ВАШ_IP/api/docs`
- Админка: `http://ВАШ_IP/admin/`
- Скачивание APK: `http://ВАШ_IP/downloads/orenplace.apk`

---

## 1. Подготовка сервера

- Ubuntu 22.04+ / Debian (VPS)
- Docker + Compose (если ещё нет):

```bash
cd /var/www/orenPlace
bash scripts/install-docker.sh
```

Проверка: `docker compose version` или `docker-compose version`

```bash
git clone <ваш-репозиторий> orenplace
cd orenplace
```

---

## 2. Переменные окружения

```bash
cp .env.production.example .env.production
```

Отредактируйте `.env.production`:
- `POSTGRES_PASSWORD` — надёжный пароль
- `JWT_SECRET` и `JWT_REFRESH_SECRET` — длинные случайные строки (не оставляйте dev-значения)

---

## 3. Сборка админ-панели

Перед Docker-сборкой backend нужен собранный фронт админки:

```bash
cd admin
npm ci
npm run build
cd ..
```

Папка `backend/admin-static` появится автоматически (см. `admin/vite.config.ts`).

---

## 4. APK для лендинга

На VPS **без Java/Android SDK** APK на сервере не соберётся — скрипт пропустит этот шаг и поднимет Docker.

**Вариант A — собрать на сервере** (нужны Java 17 + Android SDK):

```bash
apt install -y openjdk-17-jdk imagemagick
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
./scripts/deploy.sh
```

**Вариант B — собрать локально и загрузить:**

```bash
scp landing/public/downloads/orenplace.apk root@89.108.98.72:/var/www/orenPlace/landing/public/downloads/
```

**Вариант C — EAS (облако):**

1. В `mobile/eas.json` уже указан `http://89.108.98.72/api`.
2. **Важно:** `mobile/node_modules` не должен быть в git (иначе Gradle на EAS падает). После `git pull` выполните `cd mobile && npm ci`.
3. Соберите APK:

```bash
cd mobile
npm install -g eas-cli
eas login
eas init
eas build -p android --profile production
```

3. Скачайте `.apk` с expo.dev, переименуйте в `orenplace.apk`.
4. Положите файл в `landing/public/downloads/orenplace.apk` и пересоберите лендинг: `cd landing && npm run build`.

Кнопка «Скачать APK» на лендинге отдаёт этот файл.

---

## 5. Автоматический деплой (рекомендуется)

На сервере (Linux), из корня репозитория:

```bash
chmod +x scripts/deploy.sh   # если Permission denied
./scripts/deploy.sh
# или без chmod:
bash scripts/deploy.sh
```

Скрипт:
- копирует `.env` из примеров (если файлов ещё нет);
- генерирует секреты в `.env.production`;
- прописывает API `http://89.108.98.72/api` в mobile;
- собирает админку и APK;
- собирает лендинг и копирует APK в `landing/public/downloads/orenplace.apk`;
- поднимает Docker.

Опции: `./scripts/deploy.sh --no-apk` (без сборки APK), `FORCE_APK_REBUILD=1 ./scripts/deploy.sh` (пересобрать APK).

Если `docker compose` не работает, установите плагин: `apt install docker-compose-plugin`  
или скрипт сам попробует `docker-compose`.

Иконки приложения: `mobile/assets/` (в репозитории). Если пусто — `scripts/generate-mobile-assets.sh`.

На Windows: `.\scripts\deploy.ps1` (нужны Docker Desktop, Java, Android SDK для APK).

IP настраивается в `scripts/deploy.config`.

---

## 5.1. Ручной запуск в production

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
curl -s http://localhost/api/categories | head
```

При первом запуске Prisma применит миграции (`prisma migrate deploy` в Dockerfile).

Тестовые данные и афиша на лето (июнь–сентябрь 2026):

```bash
docker compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

Пересоздаёт категории, ~30 событий и тестовых пользователей.

Проверка API с телефона/ПК: http://89.108.98.72/api/health

Тестовый вход: `test@orenplace.ru` / `password123`

---

## 6. Локальная разработка (без prod)

```bash
# БД
docker compose up -d postgres

# Backend
cd backend && cp .env.example .env && npm install
npx prisma migrate dev
npm run start:dev

# Mobile
cd mobile && npx expo start
```

Лендинг локально: откройте `landing/index.html` в браузере или:

```bash
npx serve landing -p 8080
```

---

## 7. Обновление релиза

```bash
git pull
cd admin && npm ci && npm run build && cd ..
# при необходимости — новый APK в landing/public/downloads/
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## Чеклист перед публикацией

- [ ] Сменены секреты в `.env.production`
- [ ] `EXPO_PUBLIC_API_URL` указывает на прод API
- [ ] APK лежит в `landing/public/downloads/orenplace.apk`
- [ ] Собрана админка (`backend/admin-static`)
- [ ] Открывается лендинг и скачивается APK
- [ ] Приложение на телефоне подключается к API
