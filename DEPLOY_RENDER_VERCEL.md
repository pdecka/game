## Deploy backend (Render) + frontend (Vercel) + view DB tables

This guide is for this repo layout:
- `backend/` = NestJS API (served under `/api`)
- `frontend/` = Next.js app (served at `/`)
- `shared/` = shared library used by both

Goal:
- Frontend live at something like `https://game.vercel.app`
- Backend live on Render
- Persistent database so users/admin/bank details are not lost
- Ability to view user details and bank/payment details in "table" form
  - recommended: use the existing admin UI pages
  - optional: use a DB table viewer (Adminer/pgAdmin) connected to the same Postgres DB

Note: This does NOT modify auth, DB, or API code. It only configures hosting and environment variables.

--------------------------------------------
## 0) Prerequisites

1. Accounts:
   - Render
   - Vercel
   - (optional) GitHub if you deploy from Git
2. Decide DB strategy (recommended: Postgres on Render)
   - Backend uses SQLite by default when `DATABASE_URL` is NOT set
   - When `DATABASE_URL` IS set, backend uses Postgres

Backend key env vars (from code):
- `PORT` (default 3001)
- `CORS_ORIGIN` (comma-separated list of allowed origins)
- `DATABASE_URL` (if set => Postgres)
- `NODE_ENV` (important for TypeORM `synchronize` behavior)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (only needed if you use INR Razorpay flow)
- `OTP_EXPIRES_IN`
- `WITHDRAW_MIN_INR`, `WITHDRAW_MAX_INR` (optional; has defaults in code)
- `CRYPTO_NETWORK` (optional; defaults to TRC20)

Frontend env vars (from code):
- `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001/api` if not set)
  - IMPORTANT: include `/api` in this value

--------------------------------------------
## 1) Prepare your code for deployment

1. Make sure your repo works locally:
   - run backend + frontend
   - login as a user and check `/`
   - login as an admin and check `/admin/*`
2. Ensure you can build:
   - `cd backend && npm run build`
   - `cd frontend && npm run build`
3. Prefer deploying from Git:
   - Commit any UI-only changes you made to the frontend
   - Push to GitHub

--------------------------------------------
## 2) Deploy database (Render Postgres recommended)

Option A (recommended): Render Postgres
1. In Render: create a Postgres database
2. Copy the connection string (this is what you will set as `DATABASE_URL`)
   - It should look like: `postgres://user:pass@host:port/dbname`
3. Ensure the DB is persistent (Render handles persistence for Postgres)

Option B: SQLite on Render (not recommended)
1. SQLite with Render containers requires persistent storage for `dev.sqlite`
2. Without persistence, database resets when the service restarts
3. If you still want it, you must configure Render storage/persistence and ensure the backend keeps the same `dev.sqlite` file

--------------------------------------------
## 3) Deploy backend on Render

1. In Render: create a new Web Service
2. Set:
   - Name: `gaming-platform-backend` (any name)
   - Runtime: Node
   - Region: choose one close to you
3. Set your build/start commands.

Because the repo uses local `file:../shared` dependency, you must ensure `shared` is built before backend build.

Use these settings (recommended):
1. Working directory: repository root (the folder that contains `backend/`, `frontend/`, `shared/`)
2. Build command:
   - `npm run install:all && npm run build:shared && npm --prefix backend run build`
3. Start command:
   - `npm --prefix backend run start:prod`

If Render UI asks separately for "Install command", "Build command", "Start command":
1. Install command:
   - `npm run install:all`
2. Build command:
   - `npm run build:shared && npm --prefix backend run build`
3. Start command:
   - `npm --prefix backend run start:prod`

4. Environment variables in Render (Backend service):
   - `NODE_ENV=development` (important for first deployment so TypeORM can create tables via `synchronize`)
   - `PORT=3001` (or whatever Render tells you; keep consistent with internal)
   - `DATABASE_URL=<render-postgres-connection-string>`
   - `CORS_ORIGIN=https://game.vercel.app`
     - You can also add your local origin if needed:
       - `CORS_ORIGIN=http://localhost:3000,https://game.vercel.app`
   - `JWT_SECRET=<set a strong secret>`
   - `JWT_EXPIRES_IN=7d` (or any value you prefer)
   - (optional) `OTP_EXPIRES_IN=300`
   - (optional) `WITHDRAW_MIN_INR=100`
   - (optional) `WITHDRAW_MAX_INR=500000`
   - (optional) `RAZORPAY_KEY_ID=...`
   - (optional) `RAZORPAY_KEY_SECRET=...`

Important:
- If you set `NODE_ENV=production`, TypeORM `synchronize` becomes false, and tables might not be created automatically.

5. Click "Create Web Service" and wait for it to deploy.

6. Backend base URL:
   - Your API is served under `/api`
   - Example: `https://<backend-service>.onrender.com/api`

--------------------------------------------
## 4) Deploy frontend on Vercel

1. In Vercel: "New Project"
2. Connect your Git repo
3. Configure project root:
   - Recommended: set Vercel "Root Directory" to repository root (not `frontend/`)
     - so we can build `shared` first

4. Vercel Build settings:
   - Install Command:
     - `npm run install:all`
   - Build Command:
     - `npm run build:shared && npm run build:frontend`
   - Output: Next.js handles this automatically for `next build`

5. Vercel Environment variables:
   - `NEXT_PUBLIC_API_URL=https://<backend-service>.onrender.com/api`

6. Deploy and wait for it to finish.

7. Confirm frontend works:
   - open `https://game.vercel.app`
   - login as a user
   - verify API calls work (no CORS errors)

--------------------------------------------
## 5) Verify CORS + API connectivity

1. If the browser shows CORS errors:
   - update backend `CORS_ORIGIN` to include your Vercel domain
2. If authentication fails:
   - ensure backend `JWT_SECRET` matches what was used previously (if you rely on existing tokens)
   - verify you did not reset the DB unintentionally (Postgres persistence should prevent this)

--------------------------------------------
## 6) View database content in "table format"

Primary method (recommended): Use the existing admin UI
1. Go to:
   - `https://game.vercel.app/admin/login`
2. Login as an admin user.
3. Use these admin pages to view data:
   - Users: `/admin/users`
   - Bank/payment accounts: `/admin/bank-accounts`
   - Deposits: `/admin/deposits`
   - Withdrawals: `/admin/withdrawals`
   - Financial reports: `/admin/reports/financial`
4. Those pages query backend APIs and render lists/tables in the UI.

Optional method: Use a DB viewer (Adminer/pgAdmin) connected to Postgres
1. Since backend uses Postgres when `DATABASE_URL` is set, you can connect an external viewer.
2. Options:
   - Adminer container/service (simple web UI)
   - pgAdmin (full-featured)
   - Render's Postgres dashboard (if available)
3. Connection:
   - host/user/password come from `DATABASE_URL`
4. In the viewer, select tables and browse rows for users and bank/payment-related entities.

SQLite note:
- If you stay on SQLite (no `DATABASE_URL`), the data lives in `dev.sqlite`.
- To view it in a table viewer, you generally need access to the `dev.sqlite` file (harder on hosted containers).

--------------------------------------------
## 7) Common issues checklist

1. "CORS blocked origin"
   - Fix: set `CORS_ORIGIN` on Render to your Vercel domain
2. Backend starts but app actions fail
   - Fix: ensure `NEXT_PUBLIC_API_URL` in Vercel points to `.../api`
3. Tables missing / no data in DB
   - Fix for first deploy: set `NODE_ENV=development` so TypeORM `synchronize` can create tables
4. Existing data (admin/user) missing
   - Fix: verify you are using persistent Postgres and the correct `DATABASE_URL`

--------------------------------------------
## 8) After first successful deploy (optional improvements)

1. Switch `NODE_ENV` to `production` once you have migrations or confirmed stable schema handling.
2. Add monitoring (Render + Vercel logs).
3. Add a basic DB backup routine (Postgres).

