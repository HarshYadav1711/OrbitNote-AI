# OrbitNote AI — System Architecture

## High-Level Flow

User → Frontend → Backend API → Database
                       ↓
                    AI Service

---

## Frontend Structure

frontend/
├── components/
├── pages/
├── hooks/
├── services/
├── layouts/
└── store/

---

## Backend Structure

backend/
├── api/
├── auth/
├── services/
├── models/
├── schemas/
├── ai/
└── db/

---

## Key Principles
- Separation of concerns
- Predictable state management
- Reusable services
- Clean API contracts
- Low coupling