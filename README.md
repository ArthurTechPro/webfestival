# WebFestival — Plataforma de Concursos Multimedia

Plataforma completa para la gestión de concursos multimedia online: fotografía, video, audio y cine. Conecta participantes, jurados y organizadores en un ambiente colaborativo y competitivo.

## Estado del Proyecto

- API Node.js — en producción
- App React (panel admin + participantes) — en producción
- Servidor de medios Immich — en producción

---

## Arquitectura

```
webfestival-ecosystem/
├── webfestival-api/        ← Backend REST API (Node.js + Express + Prisma)
├── webfestival-app/        ← Frontend SPA (React + Vite + TypeScript)
├── webfestival-db/         ← Docker Compose para desarrollo local (Postgres + Redis)
├── traefik/                ← Infraestructura del servidor (Traefik + Portainer)
├── docker-compose.yml      ← Stack completo de producción
└── document/               ← Documentación técnica
```

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| API | Node.js 22, Express, TypeScript, Prisma 5, PostgreSQL 16 |
| App | React 18, Vite, TypeScript, Bootstrap 5, Zustand, TanStack Query |
| Medios | Immich (fotos y videos) |
| Infraestructura | Docker, Traefik v3, Let's Encrypt, Redis 7 |
| Correo | docker-mailserver (Postfix + Dovecot) |

---

## Dominios en Producción

| Servicio | URL |
|----------|-----|
| App | `https://webfestival.art` |
| API | `https://api.webfestival.art` |
| Medios (Immich) | `https://medios.webfestival.art` |
| Correo | `mail.webfestival.art` |

### Infraestructura del Servidor (`evolucion-col`)

| Servicio | URL |
|----------|-----|
| Traefik Dashboard | `https://traefik.evolucion-col.com` |
| Portainer | `https://portainer.evolucion-col.com` |

> Traefik y Portainer son compartidos por todas las apps del servidor VPS.

---

## Desarrollo Local

Requisitos: Docker Desktop, Node.js 22+

### 1. Levantar bases de datos

```bash
cd webfestival-db
cp .env.example .env
docker compose up -d
```

Levanta PostgreSQL en `localhost:5432` y Redis en `localhost:6379`.

### 2. Configurar la API

```bash
cd webfestival-api
cp .env.example .env   # ajustar variables si es necesario
npm install
npm run db:migrate     # ejecutar migraciones
npm run dev            # http://localhost:3000
```

### 3. Configurar la App

```bash
cd webfestival-app
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

---

## Despliegue en Producción

El servidor VPS `evolucion-col` (Hostinger, Ubuntu 22.04) corre todo en Docker.

### Estructura en el VPS

```
/opt/
├── traefik/        ← Traefik + Portainer (infraestructura compartida)
├── webfestival/    ← este proyecto
├── winner-erp/     ← ERP (futuro)
└── manik-app/      ← app legada (futuro)
```

### Primer despliegue

```bash
# 1. Levantar infraestructura (una sola vez)
docker compose -f /opt/traefik/docker-compose.yml up -d

# 2. Levantar WebFestival
cd /opt/webfestival
docker compose up -d --build
docker compose exec api npx prisma migrate deploy
```

### Actualizar

```bash
cd /opt/webfestival
git pull origin main
docker compose up -d --build api app
docker compose exec api npx prisma migrate deploy
```

Ver guía completa en [document/implementacion.md](document/implementacion.md).

---

## Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `PARTICIPANT` | Sube medios y participa en concursos |
| `JURY` | Califica medios con criterios configurables |
| `ADMIN` | Gestiona concursos, usuarios y configuración |
| `CONTENT_ADMIN` | Gestiona contenido CMS y newsletter |

## Funcionalidades Principales

- Concursos multimedia (fotografía, video, audio, cine)
- Sistema de calificación dinámico con criterios ponderables por tipo de medio
- Galería pública con votación
- Panel de administración completo
- CMS para contenido estático y blog
- Newsletter y notificaciones por email
- Integración con Stripe para suscripciones
- Gestión de medios con Immich

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [document/implementacion.md](document/implementacion.md) | Guía completa de despliegue en VPS |
| [document/PRD.md](document/PRD.md) | Product Requirements Document |
| [document/project.md](document/project.md) | Documentación del proyecto |
| [webfestival-api/docs/](webfestival-api/docs/) | Documentación técnica de la API |
