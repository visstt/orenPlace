# 📱 Куда сходить в Оренбурге

Мобильное приложение для просмотра мероприятий в городе Оренбург.

## 🧱 Стек технологий

### Frontend (Mobile)
- React Native (Expo) + TypeScript
- React Navigation (Stack + Bottom Tabs)
- Axios + React Query (TanStack)
- Zustand (стейт-менеджмент)
- Expo Linear Gradient
- React Hook Form + Yup

### Backend
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication (Access + Refresh tokens)
- Swagger (API-документация)
- Multer (загрузка файлов)
- Class-validator

---

## 🚀 Быстрый старт

### 1. Запуск базы данных (Docker)

```bash
docker-compose up -d postgres
```

### 2. Запуск Backend

```bash
cd backend

# Установка зависимостей
npm install

# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev --name init

# Заполнение тестовыми данными
npm run prisma:seed

# Запуск в dev-режиме
npm run start:dev
```

Сервер запустится на `http://localhost:3000`  
Swagger API: `http://localhost:3000/api/docs`

### 3. Запуск Frontend (Mobile)

```bash
cd mobile

# Установка зависимостей
npm install

# Запуск
npx expo start
```

---

## 📂 Структура проекта

```
OrenPlace/
├── backend/                    # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Модели БД
│   │   └── seed.ts             # Тестовые данные
│   ├── src/
│   │   ├── auth/               # Авторизация (JWT)
│   │   ├── users/              # Пользователи
│   │   ├── events/             # Мероприятия
│   │   ├── categories/         # Категории
│   │   ├── tickets/            # Билеты
│   │   ├── favorites/          # Избранное
│   │   ├── prisma/             # Prisma сервис
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── mobile/                     # React Native (Expo)
│   ├── src/
│   │   ├── api/                # API слой (Axios)
│   │   ├── components/         # UI компоненты
│   │   ├── hooks/              # Custom hooks
│   │   ├── navigation/         # React Navigation
│   │   ├── screens/            # Экраны приложения
│   │   ├── store/              # Zustand stores
│   │   ├── types/              # TypeScript типы
│   │   └── utils/              # Константы, утилиты
│   ├── App.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 📡 API Endpoints

### Авторизация
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/refresh` | Обновление токенов |
| POST | `/api/auth/logout` | Выход |

### Мероприятия
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/events` | Список мероприятий (с фильтрами) |
| GET | `/api/events/popular` | Популярные мероприятия |
| GET | `/api/events/search?q=` | Поиск |
| GET | `/api/events/:id` | Детали мероприятия |
| POST | `/api/events` | Создать мероприятие 🔒 |

### Категории
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/categories` | Все категории |
| GET | `/api/categories/:id/events` | Мероприятия по категории |

### Билеты
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/tickets/buy/:eventId` | Купить билет 🔒 |
| GET | `/api/tickets/my` | Мои билеты 🔒 |
| GET | `/api/tickets/today` | Билеты на сегодня 🔒 |
| GET | `/api/tickets/upcoming` | Предстоящие 🔒 |

### Избранное
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/favorites` | Список избранного 🔒 |
| POST | `/api/favorites/:eventId` | Добавить в избранное 🔒 |
| DELETE | `/api/favorites/:eventId` | Удалить из избранного 🔒 |

### Профиль
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/users/me` | Мой профиль 🔒 |
| PATCH | `/api/users/update` | Обновить профиль 🔒 |
| PATCH | `/api/users/avatar` | Загрузить аватар 🔒 |

🔒 — требуется авторизация (Bearer token)

---

## 🎨 Дизайн

- Основной цвет: `#8E2DE2` → `#4A00E0` (градиент)
- Акцент: `#B4F000`
- Фон: `#F4F1FF`
- Минималистичный UI с карточками
- Скругления 16-20px, мягкие тени

---

## 📱 Экраны

1. **Главный** — лента событий, поиск, категории, популярное
2. **Категории** — список категорий с количеством событий
3. **Детали события** — галерея, описание, покупка билета
4. **Избранное** — сохранённые мероприятия
5. **Мои события** — билеты (сегодня / предстоящие)
6. **Профиль** — информация о пользователе
7. **Редактирование профиля** — изменение данных

---

## 🔐 Тестовый аккаунт

После запуска seed:
- **Email:** test@orenplace.ru
- **Пароль:** password123
