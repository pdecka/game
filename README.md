# Lucky Games Platform

Casino + sports betting platform (Next.js frontend, NestJS API, PostgreSQL).

## Live

| Layer | URL |
|-------|-----|
| Frontend | https://lucky-games-777.vercel.app |
| Backend API | https://lucky-games.onrender.com/api |
| Database | Supabase Postgres |

## Repo layout

```
frontend/   Next.js 14
backend/    NestJS + Prisma
shared/     Shared TypeScript types
```

## Local dev

```bash
npm run install:all
cp backend/.env.example backend/.env   # set DATABASE_URL + JWT secrets
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:3001/api

**Default admin credentials (local):**
- Email: admin@games.com
- Password: 12345678  

## Production env

**Render (backend)**

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Supabase **session pooler** URI |
| `JWT_SECRET` | random string |
| `JWT_REFRESH_SECRET` | random string |
| `CORS_ORIGIN` | `https://lucky-games-777.vercel.app` |
| `NODE_ENV` | `production` |

**Vercel (frontend)**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://lucky-games.onrender.com/api` |

**Seed:** runs automatically on every Render deploy (`migrate` → `seed` → `start`).

Set `SUPERADMIN_PASSWORD` on Render **before the first deploy** so you know the admin password. After first deploy, check Render logs for `SUPERADMIN_PASSWORD=` if you did not set it.

## Build (Render)

```bash
npm run install:all && npm run build:shared && npm --prefix backend run build
npm --prefix backend run start:prod
```
