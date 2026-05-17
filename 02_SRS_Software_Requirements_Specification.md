# OrbitNote AI — Software Requirements Specification (SRS)

## System Overview

OrbitNote AI is a full-stack web application enabling users to create, manage, organize, summarize, and share notes using integrated AI workflows.

---

## Functional Requirements

### FR-1 Authentication
- Users shall be able to register.
- Users shall be able to log in securely.
- The system shall maintain authenticated sessions.
- Protected routes shall reject unauthorized access.

### FR-2 Notes Management
- Users shall create notes.
- Users shall edit notes.
- Users shall archive notes.
- Notes shall autosave automatically.
- Users shall organize notes using tags and categories.

### FR-3 AI Features
- Users shall generate summaries.
- Users shall extract action items.
- Users shall generate suggested titles.
- AI outputs shall be stored for analytics.

### FR-4 Search
- Users shall search notes by keyword.
- Users shall filter notes by tag.
- Users shall sort notes by updated time.

### FR-5 Sharing
- Users shall generate public share links.
- Shared notes shall be accessible without authentication.
- Shared notes shall be read-only.

### FR-6 Dashboard
- Users shall view productivity metrics.
- Users shall view AI usage statistics.
- Users shall view recent activity.

---

## Non-Functional Requirements

### Performance
- Autosave latency should remain low.
- Search interactions should feel immediate.

### Security
- Passwords must be hashed.
- Secrets must not be committed.
- Protected APIs must validate ownership.

### Reliability
- API responses must be predictable.
- AI failures must be handled gracefully.

### Maintainability
- Codebase must remain modular.
- APIs must remain consistent.

---

## Constraints
- Only free/open-source tools
- No paid APIs required
- No deprecated libraries
- Must run locally from clean clone