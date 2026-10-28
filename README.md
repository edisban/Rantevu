# Rantevu

Rantevu is a full-stack booking platform connecting clients with service providers (doctors, professionals). Clients search providers, request appointments, and receive status updates. Providers manage their profile, view incoming requests, and accept or reject appointments.

## Stack

- Frontend: React + TypeScript + Vite + Material UI
- Backend: Spring Boot 4 (Java 17) + Spring Security + JWT
- Database: PostgreSQL
- Containerized with Docker Compose

## Run

```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8080

## Features

- Registration and login with username (client or provider role)
- Role-based dashboards
- Provider profile management
- Appointment request, accept, reject
- Dark/light mode and EN/GR language switcher
- Responsive MUI UI

## License

MIT
