# OrbitNote AI — Database Design

## Users
- id
- name
- email
- password_hash
- created_at

## Notes
- id
- user_id
- title
- content
- is_archived
- is_public
- share_token
- created_at
- updated_at

## Tags
- id
- name

## NoteTags
- note_id
- tag_id

## AIHistory
- id
- note_id
- type
- response
- created_at

---

## Design Goals
- Normalized relationships
- Simple queries
- Future extensibility
- Clear ownership boundaries