# Deployment

OrbitNote deploys as two units: a **Vite static frontend** (Vercel) and a **FastAPI API** (Render or Railway) backed by **Supabase PostgreSQL**. No production URLs are hardcoded — configure everything via environment variables.

## Architecture (production)

```text
Browser
   │
   ├─► Vercel (React SPA)          VITE_API_BASE → API origin
   │
   └─► Render / Railway (FastAPI)  ENVIRONMENT=production
              │
              └─► Supabase PostgreSQL (DATABASE_URL)
```

| Component | Host | Config |
| --------- | ---- | ------ |
| Frontend | [Vercel](https://vercel.com) | `frontend/` root, `frontend/vercel.json` |
| API | [Render](https://render.com) or [Railway](https://railway.app) | `render.yaml` or `railway.toml` |
| Database | [Supabase](https://supabase.com) | Connection string in `DATABASE_URL` |

## 1. Supabase (PostgreSQL)

1. Create a project in Supabase.
2. Open **Project Settings → Database** and copy the **URI** connection string (use the pooler URI for serverless hosts if offered).
3. Append SSL if required: `?sslmode=require`
4. Set on the API service:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

Migrations run automatically on API startup (`alembic upgrade head`). To run manually from your machine:

```bash
cd backend
# with DATABASE_URL in .env or exported
alembic upgrade head
```

## 2. API (Render or Railway)

### Render

1. Connect the GitHub repo.
2. Use **Blueprint** (`render.yaml`) or create a **Web Service** manually:
   - **Root directory:** `backend`
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health check path:** `/health`
3. Set environment variables (see table below).

### Railway

1. New service from repo; set **Root Directory** to `backend`.
2. Railway reads `railway.toml` for build/start commands.
3. Set the same environment variables as Render.

### Required API environment variables

| Variable | Example / notes |
| -------- | ---------------- |
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | Supabase PostgreSQL URI |
| `JWT_SECRET` | Long random string (16+ chars; validated at startup) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` (comma-separated if multiple; must be valid http(s) URLs in production) |
| `FRONTEND_ORIGIN` | `https://your-app.vercel.app` (used for share links; validated at startup in production) |
| `JWT_EXPIRE_MINUTES` | Optional (default `10080`) |
| `COOKIE_NAME` | Optional (default `orbitnote_token`) |

### Optional API variables

| Variable | Purpose |
| -------- | ------- |
| `COOKIE_SECURE` | Override auto `true` in production |
| `COOKIE_SAMESITE` | Default `none` in production (cross-origin cookies) |
| `OLLAMA_BASE_URL` | Private Ollama instance; omit for rule-based AI fallback |
| `OLLAMA_MODEL` | Model name |
| `DISABLE_MIGRATIONS` | Set `true` or `1` only for tests |
| `LOG_LEVEL` | `INFO` (default), `DEBUG`, `WARNING`, or `ERROR` |

### Health endpoints

| Path | Use |
| ---- | --- |
| `GET /health` | Liveness (always returns `status: ok`) |
| `GET /health/ready` | Readiness (checks database connectivity) |

Point Render/Railway health checks at `/health`.

## 3. Frontend (Vercel)

1. Import the repo; set **Root Directory** to `frontend`.
2. **Framework preset:** Vite (or Other — build command below).
3. **Build command:** `npm ci && npm run build`
4. **Output directory:** `dist`
5. Set environment variables for the **production** build:

| Variable | When |
| -------- | ---- |
| `VITE_API_BASE` | **Required** when API is on a different host (typical: `https://your-api.onrender.com`) |
| *(omit)* | Only if you add a host-level `/api` reverse proxy to the backend (not included in repo) |

`frontend/vercel.json` adds SPA fallback rewrites so client routes (`/app`, `/share/:token`, etc.) work.

### Cross-origin setup (Vercel + Render/Railway)

This is the default layout:

1. **Vercel:** `VITE_API_BASE=https://<your-api-host>` (no trailing slash).
2. **API:** `CORS_ORIGINS=https://<your-vercel-app>.vercel.app`
3. **API:** `FRONTEND_ORIGIN=https://<your-vercel-app>.vercel.app`
4. **API:** `ENVIRONMENT=production` (enables `Secure` cookies and `SameSite=None` for cross-site auth).

Rebuild the frontend after changing `VITE_API_BASE`.

## 4. Local production parity

```bash
# API (from repo root, with .env configured for Postgres + ENVIRONMENT=production)
npm run start:backend

# Frontend build
npm run build:frontend
cd frontend && npm run preview
```

Use `frontend/.env.production` or export `VITE_API_BASE` before `npm run build` to test against a remote API.

## 5. Security checklist

- [ ] `ENVIRONMENT=production` on the API
- [ ] Strong `JWT_SECRET` (never commit; not the `.env.example` placeholder)
- [ ] `CORS_ORIGINS` restricted to your real frontend origin(s)
- [ ] `FRONTEND_ORIGIN` matches the public site URL (share links)
- [ ] Supabase/Postgres in production (SQLite is for local dev only)
- [ ] HTTPS on both frontend and API
- [ ] `.env` not committed (see `.gitignore`)

## 6. CI

GitHub Actions (`.github/workflows/ci.yml`) runs backend pytest, Ruff, and frontend lint, test, and production build on every push.

## 7. Optional local PostgreSQL (Docker)

```bash
docker compose up -d
# DATABASE_URL=postgresql://orbitnote:orbitnote@localhost:5432/orbitnote
```

## Troubleshooting

| Symptom | Likely fix |
| ------- | ---------- |
| Login works locally, not in production | Set `ENVIRONMENT=production`, `CORS_ORIGINS`, and `VITE_API_BASE`; cookies need `SameSite=None` + HTTPS |
| CORS error in browser | Add exact Vercel URL to `CORS_ORIGINS` (no trailing slash) |
| 503 on `/health/ready` | Check `DATABASE_URL`, Supabase network access, `sslmode=require` |
| Share links point to localhost | Set `FRONTEND_ORIGIN` on the API |
| API fails at startup in production | `JWT_SECRET` too short or still the dev placeholder |
