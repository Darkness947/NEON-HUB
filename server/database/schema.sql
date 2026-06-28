-- ═══════════════════════════════════════════════════════════════
-- NEON HUB — Database Schema
-- Run this entire file in the Neon DB SQL Editor to create
-- all tables, constraints, and indexes.
-- ═══════════════════════════════════════════════════════════════

-- TABLE 1: users
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  username         VARCHAR(50)  UNIQUE NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password         TEXT NOT NULL,
  avatar_url       TEXT DEFAULT '/images/default-avatar.png',
  email_verified   BOOLEAN DEFAULT FALSE,
  reset_token      TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: tracked_movies
CREATE TABLE IF NOT EXISTS tracked_movies (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tmdb_id    INTEGER NOT NULL,
  status     VARCHAR(20) CHECK (status IN ('watching','completed','planned','paused','dropped')),
  rating     SMALLINT CHECK (rating BETWEEN 1 AND 10),
  review     TEXT,
  favorite   BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- TABLE 4: tracked_series
CREATE TABLE IF NOT EXISTS tracked_series (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tmdb_id          INTEGER NOT NULL,
  status           VARCHAR(20) CHECK (status IN ('watching','completed','planned','paused','dropped')),
  rating           SMALLINT CHECK (rating BETWEEN 1 AND 10),
  review           TEXT,
  favorite         BOOLEAN DEFAULT FALSE,
  episodes_watched INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- TABLE 5: tracked_games
CREATE TABLE IF NOT EXISTS tracked_games (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rawg_id      INTEGER NOT NULL,
  status       VARCHAR(20) CHECK (status IN ('playing','completed','backlog','paused','dropped')),
  rating       SMALLINT CHECK (rating BETWEEN 1 AND 10),
  review       TEXT,
  favorite     BOOLEAN DEFAULT FALSE,
  hours_played NUMERIC(6,1) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rawg_id)
);

-- TABLE 6: custom_lists
CREATE TABLE IF NOT EXISTS custom_lists (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 7: list_items
CREATE TABLE IF NOT EXISTS list_items (
  id         SERIAL PRIMARY KEY,
  list_id    INTEGER REFERENCES custom_lists(id) ON DELETE CASCADE,
  media_type VARCHAR(10) CHECK (media_type IN ('movie','series','game')),
  media_id   INTEGER NOT NULL,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, media_type, media_id)
);

-- TABLE 8: activity_log
CREATE TABLE IF NOT EXISTS activity_log (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action     VARCHAR(50) NOT NULL,
  media_type VARCHAR(10) NOT NULL,
  media_id   INTEGER NOT NULL,
  meta       JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_tracked_movies_user   ON tracked_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_series_user   ON tracked_series(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_games_user    ON tracked_games(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user     ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user   ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list       ON list_items(list_id);
