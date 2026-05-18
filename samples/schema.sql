-- OrbitNote AI core schema (PostgreSQL)
-- Matches Alembic migrations 001–003

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  category VARCHAR(80),
  is_archived BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE note_tags (
  note_id INT REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE ai_history (
  id SERIAL PRIMARY KEY,
  note_id INT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  provider VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL,
  result_json TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ix_ai_history_note_id ON ai_history (note_id);
