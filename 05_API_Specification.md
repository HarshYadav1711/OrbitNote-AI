# OrbitNote AI — API Specification

## Authentication

### POST /auth/signup
Creates a new user.

### POST /auth/login
Authenticates a user.

---

## Notes

### GET /notes
Fetch all user notes.

### POST /notes
Create a note.

### PATCH /notes/:id
Update note.

### DELETE /notes/:id
Archive note.

---

## AI

### POST /notes/:id/summary
Generate note summary.

### POST /notes/:id/actions
Extract action items.

### POST /notes/:id/title
Generate suggested title.

---

## Sharing

### POST /notes/:id/share
Generate public share token.

### GET /shared/:token
Access shared note.