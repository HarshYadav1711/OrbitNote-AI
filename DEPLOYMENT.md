# Deployment

OrbitNote ships as two deployable units: a **FastAPI API** and a **Vite static frontend**. The API must be reachable from the browser with credentials (cookies) enabled.

## Recommended layout

| Component | Suggested host | Notes |
| --------- | -------------- | ----- |
| Frontend | Vercel, Netlify, or Azure Static Web Apps | Build `frontend/` with `npm run build`; serve `dist/` |
| API | Railway, Render, Fly.io, or Azure Container Apps | Run `uvicorn app.main:app --host 0.0.0.0 --port 8000` from `backend/` |
| Database | Supabase, Neon, or Railway PostgreSQL | Set `DATABASE_URL` to a Postgres connection string |

## Environment variables (production)

Set these on the **API** service (see `.env.example`):

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random secret (never commit) |
| `CORS_ORIGINS` | Comma-separated frontend origin(s), e.g. `https://app.example.com` |
| `FRONTEND_ORIGIN` | Used to build public share URLs |
| `OLLAMA_BASE_URL` | Optional; omit or point to a private Ollama instance |

The **frontend** build only needs the API proxied or served under the same site:

- **Option A (same origin):** Reverse-proxy `/api` → backend (see `frontend/vite.config.ts` dev proxy as reference).
- **Option B:** Configure production proxy rules on your static host so `/api/*` forwards to the API URL.

## Build commands

```bash
# API
cd backend && pip install -r requirements.txt
# Migrations run on startup; or: alembic upgrade head

# Frontend
cd frontend && npm ci && npm run build
```

## Security checklist

- [ ] Set a strong `JWT_SECRET` in production
- [ ] Use HTTPS everywhere (set cookie `secure=True` in `backend/app/api/auth.py` when behind TLS)
- [ ] Restrict `CORS_ORIGINS` to your real frontend domain
- [ ] Do not commit `.env` (listed in `.gitignore`)
- [ ] Run PostgreSQL in production (SQLite is for local dev only)

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs backend pytest, Ruff, and frontend lint + build on every push.

## Optional: Docker Compose database

```bash
docker compose up -d
# DATABASE_URL=postgresql://orbitnote:orbitnote@localhost:5432/orbitnote
```
