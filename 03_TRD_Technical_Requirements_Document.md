# OrbitNote AI — Technical Requirements Document (TRD)

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- React Query
- Zustand

### Backend
- FastAPI
- SQLAlchemy
- Pydantic v2
- JWT Authentication

### Database
- PostgreSQL

### AI
- Gemini API or local fallback

---

## System Architecture

### Frontend Responsibilities
- Routing
- Authentication state
- Note editor
- Dashboard rendering
- Search/filtering
- Optimistic UI updates

### Backend Responsibilities
- Authentication
- Authorization
- CRUD operations
- AI orchestration
- Public sharing logic

---

## API Design

### Auth
- POST /auth/signup
- POST /auth/login

### Notes
- GET /notes
- POST /notes
- PATCH /notes/:id

### AI
- POST /notes/:id/summary
- POST /notes/:id/actions
- POST /notes/:id/title

### Sharing
- GET /shared/:token

---

## Security Design
- bcrypt hashing
- httpOnly cookies
- JWT validation
- Protected APIs
- Input validation

---

## Scalability Strategy
- Modular services
- Async processing
- Structured schemas
- Normalized database design

---

## Testing Strategy
- Backend API tests
- Authentication tests
- Component tests
- AI workflow validation