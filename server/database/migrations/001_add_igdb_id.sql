-- Migration 001: Add igdb_id column to tracked_games
-- Safe to run multiple times (IF NOT EXISTS guard)
-- rawg_id is preserved. Both columns coexist.
-- Purpose: Support IGDB as primary games provider while keeping RAWG data.

ALTER TABLE tracked_games
ADD COLUMN IF NOT EXISTS igdb_id INTEGER;

-- Add index on igdb_id for fast user library lookups
CREATE INDEX IF NOT EXISTS idx_tracked_games_igdb
ON tracked_games(user_id, igdb_id)
WHERE igdb_id IS NOT NULL;

-- Update the unique constraint to handle both provider IDs
-- Strategy: unique per user per igdb_id (when igdb_id is set)
-- The existing UNIQUE(user_id, rawg_id) constraint remains untouched.
-- A new partial unique index covers igdb entries:
CREATE UNIQUE INDEX IF NOT EXISTS uq_tracked_games_igdb
ON tracked_games(user_id, igdb_id)
WHERE igdb_id IS NOT NULL;

-- Verification query (run after migration to confirm):
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'tracked_games'
-- ORDER BY ordinal_position;
