# Demo video guide

Record a **3–5 minute** walkthrough and save it locally under `demo/Demo Video/` (e.g. `OrbitNote.mp4`). Demo videos are **not committed to Git** (GitHub’s 100MB file limit). Upload the file to [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github) or YouTube and link it from the repo README. The recording should show the product working end-to-end, not slides alone.

## Suggested script

### 1. Introduction (30s)

- What OrbitNote is: personal notes with AI assist, sharing, and insights
- Stack in one sentence: React + FastAPI + SQLAlchemy, SQLite locally, optional Ollama

### 2. Auth and protected routes (45s)

- Open landing page → sign up or log in
- Show that `/app` redirects to login when logged out
- Open workspace after login (httpOnly cookie session)

### 3. Notes workspace (60s)

- Create a note, edit title and body
- Point out **autosave** status (Saved / Saving…)
- Add category and tags
- Use **search** and **tag/category filters**
- Archive a note and switch to Archived view

### 4. AI Assist (45s)

- Open Assist panel → generate **summary**, **action items**, **title**
- Mention provider badge (`ollama` vs `fallback`)
- Optionally show Ollama running locally, or explain fallback works offline
- Apply title or append actions to the note

### 5. Public sharing (45s)

- Enable share link → copy URL
- Open link in **incognito** (no login) → read-only public page
- Disable sharing → link returns unavailable

### 6. Dashboard (30s)

- Navigate to Dashboard
- Walk through stats, weekly activity chart, top tags, AI usage

### 7. Architecture (30s)

Brief diagram or narration:

```text
Browser (React) ──credentials──► FastAPI
                                    ├── JWT auth (cookies)
                                    ├── Notes + tags (SQLAlchemy)
                                    ├── AI service → Ollama or fallback
                                    ├── Share tokens → public GET
                                    └── Analytics aggregates
```

### 8. Close (15s)

- Local-first setup (SQLite, no cloud required)
- Where to find README, tests, and samples

## Checklist before recording

- [ ] `npm run dev` from repo root (or backend + frontend separately)
- [ ] `.env` copied from `.env.example` with `JWT_SECRET` set
- [ ] At least one note with enough text for AI demo
- [ ] Browser zoom 100%, window sized for readable UI

## Screenshots

Capture stills for `samples/screenshots/` (see that folder’s README) to document key screens for reviewers who skip video.
