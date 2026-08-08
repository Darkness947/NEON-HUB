-- Migration 002: Drop NOT NULL constraint on rawg_id
-- We now support games coming from IGDB, which won't have a rawg_id

ALTER TABLE tracked_games ALTER COLUMN rawg_id DROP NOT NULL;
