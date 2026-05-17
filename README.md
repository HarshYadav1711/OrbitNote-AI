# OrbitNote

Monorepo foundation for a notes workspace: authentication, core data models, and a minimal app shell.

## Repository layout

```text
orbitnote/
├── backend/          FastAPI + SQLAlchemy + Alembic
├── frontend/         React + TypeScript + Vite + Tailwind
├── .env.example      Environment template (copy to .env)
├── docker-compose.yml  Optional PostgreSQL for local dev
└── package.json      Root scripts (dev, lint, test)
```

## Stack

| Layer    | Choices                                      |
| -------- | -------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, TanStack Query   |
| Backend  | FastAPI, Pydantic v2, SQLAlchemy 2           |
| Database | SQLite by default; PostgreSQL optional       |
| Auth     | JWT in httpOnly cookies, bcrypt passwords    |

## Prerequisites

- Node.js 20+
- Python 3.11+

Docker is **optional** (only if you prefer PostgreSQL over SQLite).

## Quick start

### 1. Environment

```bash
cp .env.example .env
# Edit JWT_SECRET to a long random string
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Migrations run automatically on API startup. To run them manually:

```bash
npm run db:migrate
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Run both (from repo root)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Optional PostgreSQL

```bash
docker compose up -d
```

Set in `.env`:

```env
DATABASE_URL=postgresql://orbitnote:orbitnote@localhost:5432/orbitnote
```

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `npm run dev`        | Backend + frontend together    |
| `npm run lint`       | Ruff + ESLint + TypeScript     |
| `npm run format`     | Ruff + Prettier                |
| `npm test`           | Backend pytest suite           |
| `npm run db:migrate` | Alembic upgrade head           |

## API surface (foundation)

- `GET /health` — liveness
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /notes`, `POST /notes`, `GET /notes/{id}`, `PATCH /notes/{id}`

## Data model

- **users** — account identity
- **notes** — title, content, category, archive flag
- **tags** / **note_tags** — many-to-many tagging

## What is intentionally out of scope

This scaffold does **not** include AI features, public sharing, dashboards, or real-time collaboration. Those belong in later feature branches.

## License

TBD
