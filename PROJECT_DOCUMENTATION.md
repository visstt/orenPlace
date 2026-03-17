# OrenPlace — Полная техническая документация проекта

## 1. Назначение проекта
OrenPlace ("Куда сходить в Оренбурге") — мобильное приложение для поиска городских мероприятий и покупки билетов.

Ключевые пользовательские сценарии:
- регистрация и вход в аккаунт;
- просмотр списка мероприятий с фильтрами и поиском;
- просмотр популярных событий;
- добавление/удаление мероприятий в избранное;
- покупка билета и просмотр своих билетов;
- редактирование профиля пользователя.

Проект реализован как fullstack-монорепозиторий:
- `backend` — REST API на NestJS + Prisma + PostgreSQL;
- `mobile` — клиент на React Native (Expo).

## 2. Технологический стек

### 2.1 Backend
- Node.js + TypeScript
- NestJS 10
- Prisma ORM 5
- PostgreSQL 16
- JWT (access + refresh токены)
- Passport + passport-jwt
- class-validator / class-transformer
- Swagger (`/api/docs`)
- Multer (загрузка аватара)
- Docker (контейнеризация backend + postgres)

### 2.2 Mobile
- React Native 0.73 + Expo SDK 50
- TypeScript
- React Navigation (native-stack + bottom-tabs)
- TanStack React Query
- Axios
- Zustand
- AsyncStorage
- Expo Linear Gradient
- Expo Vector Icons / Ionicons

### 2.3 Инфраструктура
- `docker-compose.yml` поднимает:
  - `postgres:16-alpine`
  - `backend` (сборка из `backend/Dockerfile`)

## 3. Структура репозитория

```text
OrenPlace/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── events/
│   │   ├── categories/
│   │   ├── tickets/
│   │   ├── favorites/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── Dockerfile
├── mobile/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── App.tsx
│   └── app.json
├── docker-compose.yml
└── README.md
```

## 4. Архитектура решения (high-level)

```text
[Mobile App (React Native)]
       |
       | HTTP (Bearer JWT)
       v
[Backend API (NestJS, /api/*)]
       |
       | Prisma ORM
       v
[PostgreSQL]
```

Отдельно:
- файлы аватаров пишутся в `backend/uploads/avatars`;
- backend раздает статику из `/uploads` через `ServeStaticModule`.

## 5. Backend: архитектура и модули

### 5.1 Инициализация приложения
- `backend/src/main.ts`:
  - включает CORS;
  - подключает `ValidationPipe` с `whitelist`, `forbidNonWhitelisted`, `transform`;
  - устанавливает global prefix: `/api`;
  - поднимает Swagger на `/api/docs`.

- `backend/src/app.module.ts`:
  - `ConfigModule` (global),
  - `ServeStaticModule` для `uploads`,
  - бизнес-модули: `Auth`, `Users`, `Events`, `Categories`, `Tickets`, `Favorites`,
  - `PrismaModule` как глобальный доступ к БД.

### 5.2 Prisma / Data Layer
- `PrismaService` (`backend/src/prisma/prisma.service.ts`) расширяет `PrismaClient` и управляет connect/disconnect через lifecycle hooks.
- Модель данных описана в `backend/prisma/schema.prisma`.

### 5.3 Модель данных (PostgreSQL)

#### `users`
- `id`, `name`, `surname`, `email (unique)`, `phone`, `city`, `password`, `avatar`, `createdAt`, `updatedAt`.

#### `categories`
- `id`, `name (unique)`, `color`, `icon`.

#### `events`
- `id`, `title`, `description`, `date`, `time`, `price`, `address`, `isPopular`, `images[]`, `categoryId`, `createdAt`, `updatedAt`.

#### `favorites`
- `id`, `userId`, `eventId`, `createdAt`.
- уникальный составной индекс: `(userId, eventId)`.

#### `tickets`
- `id`, `qrCode (unique)`, `purchaseDate`, `userId`, `eventId`.

Связи:
- `events -> categories` (many-to-one),
- `favorites -> users/events` (many-to-one, cascade delete),
- `tickets -> users/events` (many-to-one, cascade delete).

### 5.4 Модули и ответственность

#### Auth (`backend/src/auth`)
- Эндпоинты: регистрация, логин, refresh, logout.
- Пароль хэшируется через `bcrypt`.
- Генерируются `accessToken` и `refreshToken`.
- Валидация JWT через `JwtStrategy` + `JwtAuthGuard`.
- `@CurrentUser()` декоратор извлекает payload пользователя из request.

#### Users (`backend/src/users`)
- Получение своего профиля.
- Обновление профиля (`PATCH /users/update`).
- Загрузка аватара (`PATCH /users/avatar`) с ограничениями:
  - MIME только картинки (`jpg/jpeg/png/gif/webp`),
  - размер до 5MB,
  - имя файла — `uuid + ext`.

#### Events (`backend/src/events`)
- Получение списка с фильтрами:
  - `search`, `categoryId`, `dateFrom`, `dateTo`, сортировка, пагинация.
- Популярные события.
- Поиск.
- CRUD событий (create/update/delete защищены JWT).

#### Categories (`backend/src/categories`)
- Получение списка категорий + `eventsCount`.
- Получение категории по id.
- Получение событий категории.

#### Favorites (`backend/src/favorites`)
- Получение избранных событий пользователя.
- Добавление/удаление события из избранного.
- Проверка признака избранного.

#### Tickets (`backend/src/tickets`)
- Покупка билета (`buy/:eventId`).
- Списки билетов:
  - все,
  - на сегодня,
  - предстоящие.
- Получение конкретного билета.
- Генерация QR-кода как строки `OREN-...`.

## 6. Backend API (фактические маршруты)
Все маршруты ниже доступны с префиксом `/api`.

### 6.1 Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### 6.2 Users (JWT)
- `GET /users/me`
- `PATCH /users/update`
- `PATCH /users/avatar`

### 6.3 Events
- `GET /events`
- `GET /events/popular`
- `GET /events/search?q=...`
- `GET /events/:id`
- `POST /events` (JWT)
- `PUT /events/:id` (JWT)
- `DELETE /events/:id` (JWT)

### 6.4 Categories
- `GET /categories`
- `GET /categories/:id`
- `GET /categories/:id/events`

### 6.5 Favorites (JWT)
- `GET /favorites`
- `POST /favorites/:eventId`
- `DELETE /favorites/:eventId`
- `GET /favorites/check/:eventId`

### 6.6 Tickets (JWT)
- `POST /tickets/buy/:eventId`
- `GET /tickets/my`
- `GET /tickets/today`
- `GET /tickets/upcoming`
- `GET /tickets/:id`

## 7. Mobile: архитектура и слои

### 7.1 Composition Root
`mobile/App.tsx`:
- `GestureHandlerRootView`
- `SafeAreaProvider`
- `QueryClientProvider`
- `NavigationContainer`
- `RootNavigator`

React Query конфиг:
- `retry: 2`
- `staleTime: 5 минут`

### 7.2 Навигация

#### `RootNavigator`
- если пользователь не авторизован: `Login`, `Register`;
- если авторизован: основной таб-навигатор + stack-экраны деталей (`EventDetail`, `PurchaseTicket`, `EditProfile`, `CategoryEvents`, `About`).

#### `BottomTabNavigator`
Табы:
- Home
- Categories
- MyEvents
- Favorites
- Profile

### 7.3 Data access (`mobile/src/api`)
- единый axios-клиент в `client.ts`;
- request interceptor добавляет `Authorization: Bearer <accessToken>`;
- response interceptor при `401` пытается refresh токена через `/auth/refresh`, сохраняет новые токены и ретраит запрос;
- при провале refresh токены удаляются из `AsyncStorage`.

API-модули:
- `authApi`, `usersApi`, `eventsApi`, `categoriesApi`, `favoritesApi`, `ticketsApi`.

### 7.4 State management

#### Zustand: `authStore`
- состояние: `user`, `isAuthenticated`, `isLoading`;
- операции: `login`, `register`, `logout`, `checkAuth`, `loadUser`, `updateUser`;
- токены хранятся в `AsyncStorage`.

#### Zustand: `favoritesStore`
- состояние: `favorites`, `favoriteIds`, `isLoading`;
- операции: `loadFavorites`, `toggleFavorite`, `isFavorite`.

### 7.5 React Query usage
- экраны получают данные через `useQuery`.
- кэш и инвалидация используются в сценариях покупки билета/обновления данных.

### 7.6 UI-система
- константы в `mobile/src/utils/constants.ts`:
  - цвета, размеры, тени;
  - `API_URL` зависит от платформы (`10.0.2.2` для Android-эмулятора).

## 8. Основные пользовательские потоки

### 8.1 Онбординг и авторизация
1. Пользователь открывает приложение.
2. `checkAuth()` проверяет access token.
3. Если токен есть и валиден, грузится профиль (`/users/me`) и открывается основной интерфейс.
4. Иначе показываются `Login/Register`.

### 8.2 Просмотр мероприятий
1. Home загружает:
   - `/events` (с фильтрами),
   - `/events/popular`,
   - `/categories`.
2. Поиск и фильтр категории обновляют query key и рефетчат список.

### 8.3 Избранное
1. Пользователь жмет иконку сердца.
2. `favoritesStore.toggleFavorite` вызывает `POST`/`DELETE /favorites/:eventId`.
3. Локальный state синхронизируется (или догружается заново).

### 8.4 Покупка билета
1. На `EventDetail` нажимается "Купить билет".
2. На `PurchaseTicketScreen` заполняются mock-платежные данные.
3. После клиентской проверки вызывается `POST /tickets/buy/:eventId`.
4. Билет появляется в `MyEvents` (`today`/`upcoming`).

### 8.5 Профиль
1. `Profile` показывает текущего пользователя.
2. `EditProfile` обновляет данные через `PATCH /users/update`.
3. (Backend поддерживает и загрузку аватара `PATCH /users/avatar`.)

## 9. Конфигурация и окружение

### 9.1 Backend env (используются в коде/compose)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRATION` (по умолчанию `15m`)
- `JWT_REFRESH_EXPIRATION` (по умолчанию `7d`)
- `PORT`

### 9.2 Docker
- `docker-compose up -d postgres` — поднимает БД.
- сервис `backend` может стартовать в контейнере и применяет `prisma migrate deploy` при запуске.

## 10. Локальный запуск

### 10.1 Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

### 10.2 Mobile
```bash
cd mobile
npm install
npx expo start
```

## 11. Seed-данные
`backend/prisma/seed.ts` создает:
- 8 категорий (концерты, театр, выставки и т.д.),
- тестового пользователя,
- набор тестовых мероприятий.

Тестовый аккаунт:
- email: `test@orenplace.ru`
- password: `password123`

## 12. Сильные стороны текущей реализации
- Четкое разделение слоев (API/store/navigation/screens).
- Полноценный JWT-поток с refresh.
- Валидация DTO на backend.
- Swagger-документация API из коробки.
- Prisma + миграции + seed упрощают воспроизводимость окружения.
- Поддержка избранного, билетов и профиля реализована end-to-end.

## 13. Технические риски и ограничения (по текущему коду)
- В репозитории присутствуют `node_modules` и `backend/dist` — это утяжеляет проект и усложняет ревью.
- Секреты JWT захардкожены в `docker-compose.yml` (подходит для dev, но небезопасно для prod).
- На backend нет роли/проверки прав для `POST/PUT/DELETE /events` (любой авторизованный пользователь может менять афишу).
- На mobile `PurchaseTicketScreen` содержит mock-оплату и debug-логи; реального платежного провайдера нет.
- Поток logout опирается на удаление токенов на клиенте; серверной инвалидации refresh-токенов в БД нет.
- Нет автоматических тестов (unit/e2e) в текущем репозитории.

## 14. Рекомендации по развитию
1. Вынести секреты в `.env` и секрет-хранилище CI/CD.
2. Добавить RBAC (admin/editor/user) для операций создания/редактирования событий.
3. Реализовать хранение refresh-токенов (или их hash) в БД с ревокацией.
4. Добавить тесты:
   - backend: unit + e2e (Jest + supertest),
   - mobile: smoke/UI тесты.
5. Убрать артефакты из git (`node_modules`, `dist`) и расширить `.gitignore`.
6. Выделить API-контракты (OpenAPI-first / shared typed client).

## 15. Резюме
Проект уже представляет рабочий вертикальный срез продукта: мобильный клиент + backend + БД + авторизация + ключевые бизнес-фичи афиши/билетов. Архитектура достаточно чистая для MVP и готова к дальнейшему масштабированию после усиления безопасности, прав доступа и тестового покрытия.
