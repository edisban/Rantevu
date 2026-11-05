# Rantevu

[![CI/CD](https://github.com/edisban/Rantevu/actions/workflows/ci.yml/badge.svg)](https://github.com/edisban/Rantevu/actions/workflows/ci.yml)

Rantevu is a full-stack booking platform connecting clients with service providers (doctors, professionals). Clients search providers, request appointments, and receive status updates. Providers manage their profile, view incoming requests, and accept or reject appointments.

## Stack

- Frontend: React + TypeScript + Vite + Material UI
- Backend: Spring Boot 4 (Java 17) + Spring Security + JWT + WebSocket (STOMP)
- Database: PostgreSQL, schema managed by Flyway migrations (`backend/src/main/resources/db/migration`)
- Containerized with Docker Compose

## Run

```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend (local tools only): http://127.0.0.1:8082

The database port is not published; open a SQL shell with `docker exec -it rantevu-db-1 psql -U rantevu -d rantevu`.

### Configuration

The app runs without any setup, using local development defaults. To change settings, copy the template and edit it (`.env` is ignored by git):

```bash
cp .env.example .env
```

Before deploying, replace `POSTGRES_PASSWORD` and `JWT_SECRET` (32+ random characters) and, once served over HTTPS, set `COOKIE_SECURE=true`. If the frontend is hosted on another domain, set `CORS_ALLOWED_ORIGINS` and `COOKIE_SAME_SITE=None`. See `.env.example` for every setting.

For frontend development without Docker, run the backend and Postgres, then `npm run dev` in `frontend/` (Vite proxies `/api` and the `/ws` socket to `localhost:8082`).

## Features

- Registration and login with username (client or provider role)
- Search professionals by name, specialty, area, or category (doctors, dentists, therapists, lawyers, and more)
- Book with a date picker and time slots; taken slots are blocked, and a database constraint prevents double booking
- Clients can cancel; providers accept or decline
- Live chat between a client and a professional who share an appointment, with unread badges, delivered over WebSocket
- Provider dashboard with stats and pending/upcoming views, plus a live profile preview
- Server-side checks: only clients book, only the provider decides, only participants can cancel or chat
- Account page with permanent account deletion (password confirmation; removes the user's appointments, messages and profile)

## Security

- JWT in an HttpOnly, SameSite=Lax cookie (not readable by JavaScript); `Secure` flag via `COOKIE_SECURE`
- CSRF protection for every state-changing request (`XSRF-TOKEN` cookie echoed in the `X-XSRF-TOKEN` header)
- BCrypt password hashing; passwords need 8+ characters with a letter and a number
- Login rate limiting: 5 failures per username or 30 per IP in 15 minutes, then 429
- Bean Validation on every request body; one error handler returning JSON messages
- Security headers: Content-Security-Policy, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (HSTS automatically on HTTPS)
- WebSocket handshake requires the login cookie and the site's own origin
- CORS off by default (same-origin proxy); allowed origins configurable
- Database not exposed outside Docker; API port bound to localhost
- Glassmorphism UI in burgundy and beige, with animated intro, dark/light mode, and EN/GR language switcher
- Responsive on mobile and desktop

## Tests

- **Backend:** `cd backend && ./mvnw verify` — 20 integration tests run the whole app against a real PostgreSQL started by Testcontainers (Docker required): auth cookies, CSRF, password rules, login lockout, booking rules and double booking, chat access, account deletion.
- **Frontend:** `cd frontend && npm test` — Vitest unit tests for search and category matching.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

- **Every push and pull request:** backend build + integration tests, frontend lint + tests + type-check + build, and both Docker images built.
- **Every push to `main`:** the images are also published to GitHub Container Registry as `ghcr.io/edisban/rantevu-backend` and `ghcr.io/edisban/rantevu-frontend` (tags `latest` and the commit SHA).
- **Dependabot** opens weekly update pull requests for Maven, npm, GitHub Actions and Docker base images.

## License

MIT
