# OrbitNote

A focused notes workspace: write and organize notes, get optional AI help, share read-only links, and see lightweight productivity insights. Built as a small full-stack product you can run locally without paid services.

![Stack](https://img.shields.io/badge/React-18-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688) ![SQLite](https://img.shields.io/badge/SQLite-default-003B57)

## Product overview

OrbitNote is for people who want a **fast editor**, **simple organization** (categories and tags), and **occasional AI assistance** without adopting a heavy suite. Core flows:

- **Workspace** — sidebar list with search/filters; editor with autosave
- **Assist** — summaries, action items, and title suggestions (Ollama when available, deterministic fallback otherwise)
- **Sharing** — secure public read-only links (`/share/:token`)
- **Dashboard** — note counts, weekly activity, tag trends, AI usage

Authentication uses **httpOnly JWT cookies**; protected routes require a valid session.

## Demo video

End-to-end product walkthrough (~3–5 min): **[OrbitNote.mp4 on Google Drive](https://drive.google.com/drive/folders/1HESjosIFW9aj76Y47DUcGihZYV47w481?usp=drive_link)**.

Screenshots and script notes live in [`demo/`](demo/) (see [`demo/DEMO.md`](demo/DEMO.md)). The `.mp4` is excluded from Git due to GitHub’s file size limit.

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  React SPA (Vite, TanStack Query, React Router, Tailwind)   │
│  /app workspace · /app/dashboard · /share/:token public     │
└───────────────────────────┬─────────────────────────────────┘
                            │ /api (proxy in dev)
┌───────────────────────────▼─────────────────────────────────┐
│  FastAPI                                                     │
│  auth · notes · ai · public · analytics                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  SQLAlchemy + Alembic  →  SQLite (dev) or PostgreSQL       │
└─────────────────────────────────────────────────────────────┘
         Optional: Ollama HTTP API for AI generation
```

| Layer | Responsibility |
| ----- | -------------- |
| `frontend/src/api/client.ts` | Typed fetch wrapper, cookie credentials |
| `frontend/src/lib/errors.ts` | Shared API error types and user-facing copy |
| `backend/app/api/*` | HTTP routers |
| `backend/app/services/*` | Business logic (notes, share, AI, analytics) |
| `backend/app/models/*` | ORM entities |
| `backend/alembic/versions/*` | Schema migrations |

## Stack

| Area | Technology |
| ---- | ---------- |
| Frontend | React 18, TypeScript, Vite 6, TanStack Query, Zustand, Tailwind CSS |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, Alembic |
| Auth | bcrypt, JWT in httpOnly cookies |
| AI | Ollama (`/api/generate`) with JSON output; rule-based fallback |
| Database | SQLite by default; PostgreSQL via Docker Compose |
| CI | GitHub Actions (pytest, Ruff, ESLint, production build) |

## Repository layout

```text
orbitnote/
├── backend/           FastAPI application
├── frontend/          React SPA
├── samples/           Example API/AI JSON, SQL schema, screenshot placeholders
├── demo/              Demo video guidance
├── .env.example       Environment template
├── DEPLOYMENT.md      Production deployment notes
└── package.json       Root scripts (dev, lint, test)
```

## Setup

### Prerequisites

- **Node.js 20+**
- **Python 3.11+**
- Docker is optional (PostgreSQL only)

### 1. Clone and configure

```bash
git clone <repo-url> orbitnote && cd orbitnote
cp .env.example .env
# Edit JWT_SECRET to a long random string
```

### 2. Install and run (recommended)

From the **repository root** (`OrbitNote AI/`):

```powershell
# Root dependencies (runs backend + frontend together)
npm install

# Frontend
cd frontend
npm install
cd ..

# Backend virtualenv + packages
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..

# Start both servers
npm run dev
```

> **Path tip:** If your terminal is already inside `backend/`, use `requirements.txt` (not `backend\requirements.txt`).  
> Paths with spaces (e.g. `OrbitNote AI`) must be quoted in PowerShell: `& "D:\Fun\OrbitNote AI\backend\.venv\Scripts\python.exe"`.

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:8000`.

Migrations run automatically on API startup. Manual run: `npm run db:migrate`.

### Optional: PostgreSQL

```bash
docker compose up -d
```

Set in `.env`:

```env
DATABASE_URL=postgresql://orbitnote:orbitnote@localhost:5432/orbitnote
```

### Optional: Ollama (AI)

```bash
ollama pull llama3.2
```

On Windows, Ollama usually runs in the background after install (system tray). **Do not run `ollama serve` if you see** `bind: Only one usage of each socket address` — that means it is already listening on port `11434`.

Check: `ollama list` should show `llama3.2` (matches `OLLAMA_MODEL` in `.env`).

If Ollama is not running, Assist still works via the built-in fallback.

## Environment variables

### Backend (`.env` at repo root)

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `ENVIRONMENT` | `development` | Set `production` for deploy (secure cookies, JWT validation) |
| `DATABASE_URL` | `sqlite:///./data/orbitnote.db` | SQLAlchemy URL; use Supabase Postgres in production |
| `JWT_SECRET` | *(dev placeholder)* | **Required** in production (16+ characters) |
| `JWT_EXPIRE_MINUTES` | `10080` | Token lifetime |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed browser origins |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Base URL for share links |
| `COOKIE_SECURE` / `COOKIE_SAMESITE` | Auto in production | Override cookie flags if needed |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server |
| `OLLAMA_MODEL` | `llama3.2` | Model name |
| `DISABLE_MIGRATIONS` | `false` | Set `true` or `1` in tests to skip Alembic on startup |
| `LOG_LEVEL` | `INFO` | Backend log verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |

See `.env.example` for the full backend list.

### Frontend (`frontend/.env.example`)

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `VITE_API_BASE` | `/api` | API origin; set to your Render/Railway URL on Vercel |
| `VITE_DEV_API_PROXY` | `http://localhost:8000` | Vite dev proxy target only |

## Deployment

Production hosting is documented in **[DEPLOYMENT.md](DEPLOYMENT.md)**:

- **Frontend:** Vercel (`frontend/`, `npm run build`)
- **API:** Render or Railway (`backend/`, `uvicorn` on `$PORT`)
- **Database:** Supabase PostgreSQL

Quick start after configuring Supabase and env vars:

```bash
# API (Render/Railway uses the same start command)
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Or from repo root with a local venv
npm run start:backend

# Frontend static build
npm run build:frontend
```

Set `ENVIRONMENT=production`, `CORS_ORIGINS`, `FRONTEND_ORIGIN`, and `JWT_SECRET` on the API. Set `VITE_API_BASE` on Vercel to your API URL when frontend and API are on different hosts.

## Testing

```bash
# Backend + frontend tests (auth, notes, AI, share, analytics, edge cases)
npm test

# Lint
npm run lint

# Frontend production build
cd frontend && npm run build
```

Tests use in-memory SQLite with `DISABLE_MIGRATIONS=1`. CI runs the same suite on push.

## AI workflow

1. User triggers **summary**, **actions**, or **title** from the Assist panel (or API).
2. `ai/service.py` loads note content (or optional draft from request body).
3. **Ollama path:** health check → `POST /api/generate` with `format: "json"` → parse structured result.
4. **Fallback path:** heuristic summary, regex action extraction, first-line title (`ai/fallback.py`).
5. Result stored in `ai_history` with `provider`, `status`, and `result_json`.
6. Response returned to the client with `history_id` for audit.

Example payloads: `samples/ai-outputs.json` and `samples/api-responses.json`.

## Database model

```text
users ──< notes ──< ai_history
          │
          └── note_tags >── tags
```

| Table | Purpose |
| ----- | ------- |
| `users` | Account (email unique, bcrypt hash) |
| `notes` | Title, content, category, archive, `is_public`, `share_token` |
| `tags` / `note_tags` | Many-to-many; tag names normalized to lowercase |
| `ai_history` | Per-request AI audit trail |

Reference SQL: `samples/schema.sql`. Migrations: `backend/alembic/versions/`.

## Public sharing flow

1. Owner calls `POST /notes/{id}/share` → sets `is_public=true`, generates `share_token`, returns `share_url`.
2. Visitors open `GET /public/notes/{token}` (no auth) → read-only title, content, category, tags.
3. `DELETE /notes/{id}/share` clears the token; old links return 404.
4. Archived notes are hidden from the public endpoint even if flags remain set.

Frontend route: `/share/:token` → `PublicNotePage`.

## Keyboard shortcuts

In the workspace (intentionally minimal):

| Shortcut | Action |
| -------- | ------ |
| `Ctrl/Cmd + S` | Save now |
| `Ctrl/Cmd + N` | New note |

## UX details

- **Loading / empty / error** states on workspace, editor, dashboard, and public pages
- **Dark mode** with system preference + persisted toggle (localStorage)
- **Mobile:** slide-out note list, bottom nav for Notes/Dashboard
- **Accessibility:** form labels, `aria-live` on save status and copy feedback, screen-reader labels on search

## API reference (summary)

| Method | Path | Auth |
| ------ | ---- | ---- |
| `GET` | `/health`, `/health/ready` | No |
| `POST` | `/auth/signup`, `/login`, `/logout` | No |
| `GET` | `/auth/me` | Cookie |
| `GET/POST` | `/notes` | Cookie |
| `GET/PATCH/DELETE` | `/notes/{id}` | Cookie |
| `POST/DELETE` | `/notes/{id}/share` | Cookie |
| `POST` | `/notes/{id}/ai/summary`, `/actions`, `/title` | Cookie |
| `GET` | `/notes/{id}/ai/history` | Cookie |
| `GET` | `/public/notes/{token}` | No |
| `GET` | `/analytics/dashboard` | Cookie |

Interactive docs: `http://localhost:8000/docs` when the API is running.

## Future improvements

- ~~Note deletion~~ and version history
- Per-user tag namespaces (tags are currently global by name)
- Rate limiting on public and AI endpoints
- Bearer token auth for API clients
- Real-time collaboration
- Export (Markdown/PDF)

## License

TBD
