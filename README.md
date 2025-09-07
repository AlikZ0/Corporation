# Корпоративное приложение: React+TS (Vite) + Express+TS (JWT)

Полноценный пример аутентификации: регистрация, логин, JWT, защищённый маршрут и страница ЛК.

## Структура монорепозитория
- `client` — React + TypeScript (Vite), роутинг, контекст авторизации, UI.
- `server` — Express + TypeScript, bcrypt, JWT, in-memory хранилище пользователей.
- Корневой `package.json` — workspaces и общие скрипты.

## Требования
- Node.js >= 18 (рекомендовано 20), npm >= 8
- Docker и Docker Compose (для контейнерного запуска)

## Установка
1. В корне проекта:
   - `npm install`
   - `npm install -w client`
   - `npm install -w server`
2. Файл окружения (опционально) `server/.env`:
   - `JWT_SECRET=your_secret`
   - `PORT=4000`
3. Клиент в dev-режиме проксирует `/api` на `http://localhost:4000` (настроено в `client/vite.config.ts`).

## Локальный запуск (разработка)
- Запуск в двух терминалах:
  - Сервер: `npm run dev -w server` → http://localhost:4000
  - Клиент: `npm run dev -w client` → http://localhost:5173
- Одновременный запуск из корня: `npm run dev`

Подсказки по вотчерам:
- Если увидите ошибку ENOSPC (лимит inotify), можно временно увеличить лимиты:
  - `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

## Предпросмотр без вотчеров (похоже на прод)
- Из корня: `npm run preview`
- Команда сделает сборку и поднимет:
  - сервер: `node server/dist/index.js` → http://localhost:4000
  - клиент: `vite preview` → http://localhost:4173

## Запуск через Docker (одна команда)
Сборка образов и запуск:
- `docker compose build`
- `docker compose up -d`

Доступ:
- API: http://localhost:4000
- Клиент: откройте порт из вывода `docker compose ps` (столбец `PORTS`, например `0.0.0.0:32768->80/tcp` → http://localhost:32768)

Полезные команды Docker:
- Состояние и порты: `docker compose ps`
- Логи: `docker compose logs -f server` / `docker compose logs -f client`
- Остановка: `docker compose down`

## API
- `POST /api/auth/register` — тело: `{ "email": string, "password": string }` → `{ token }`
- `POST /api/auth/login` — тело: `{ "email": string, "password": string }` → `{ token }`
- `GET /api/me` — заголовок `Authorization: Bearer <token>` → `{ id, email }`

Примеры:
```bash
curl -s -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"pass1234"}' \
  http://localhost:4000/api/auth/register

curl -H "Authorization: Bearer <TOKEN>" http://localhost:4000/api/me
```

## Конфигурация окружения
- Сервер (`server/.env`): `JWT_SECRET`, `PORT`
- Клиент:
  - Dev: использует прокси `/api` (см. `vite.config.ts`)
  - Build/Docker: `VITE_API_URL` (передаётся при сборке и в compose)

## Архитектура (кратко)
- Server:
  - `POST /auth/register` — создаёт пользователя (hash пароля bcrypt), возвращает JWT
  - `POST /auth/login` — проверяет пароль, возвращает JWT
  - `GET /me` — проверяет JWT, возвращает профиль
- Client:
  - `AuthContext` хранит токен в `localStorage`, делает запросы к API, защищает роут `/`
  - Роуты: `/login`, `/register`, `/` (личный кабинет)

## Скрипты
- Корень:
  - `npm run dev` — сервер+клиент (watch)
  - `npm run build` — сборка server+client
  - `npm run start` — запуск только сервера (из dist)
  - `npm run preview` — сборка и предпросмотр (сервер + клиент)
- Воркспейсы:
  - `npm run dev -w server` / `npm run dev -w client`
  - `npm run build -w server` / `npm run build -w client`

## Масштабирование
- БД (PostgreSQL + Prisma) вместо памяти
- Рефреш‑токены, роли/права, централизованная валидация (zod), логирование