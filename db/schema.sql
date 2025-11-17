CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  year TEXT,
  rating INTEGER,
  review TEXT,
  imdb_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
