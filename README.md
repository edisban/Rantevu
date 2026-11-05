# Rantevu

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
Backend: http://localhost:8082

Set `JWT_SECRET` (32+ characters) in your environment before deploying; the default is for local development only.

For frontend development without Docker, run the backend and Postgres, then `npm run dev` in `frontend/` (Vite proxies `/api` and the `/ws` socket to `localhost:8082`).

## Features

- Registration and login with username (client or provider role)
- Search professionals by name, specialty, area, or category (doctors, dentists, therapists, lawyers, and more)
- Book with a date picker and time slots; taken slots are blocked, and a database constraint prevents double booking
- Clients can cancel; providers accept or decline
- Live chat between a client and a professional who share an appointment, with unread badges, delivered over WebSocket
- Provider dashboard with stats and pending/upcoming views, plus a live profile preview
- Server-side checks: only clients book, only the provider decides, only participants can cancel or chat
- Glassmorphism UI in burgundy and beige, with animated intro, dark/light mode, and EN/GR language switcher
- Responsive on mobile and desktop

## License

MIT
