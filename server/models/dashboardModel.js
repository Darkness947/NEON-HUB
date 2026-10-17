const pool = require('../config/db');

const getStats = async (userId) => {
  const result = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM tracked_movies WHERE user_id = $1) as total_movies,
      (SELECT COUNT(*) FROM tracked_movies WHERE user_id = $1 AND status = 'completed') as movies_completed,
      (SELECT COUNT(*) FROM tracked_series WHERE user_id = $1) as total_series,
      (SELECT COUNT(*) FROM tracked_series WHERE user_id = $1 AND status = 'completed') as series_completed,
      (SELECT COUNT(*) FROM tracked_games WHERE user_id = $1) as total_games,
      (SELECT COUNT(*) FROM tracked_games WHERE user_id = $1 AND status = 'completed') as games_completed,
      (SELECT SUM(hours_played) FROM tracked_games WHERE user_id = $1) as total_hours_played,
      (
        SELECT AVG(rating) FROM (
          SELECT rating FROM tracked_movies WHERE user_id = $1 AND rating IS NOT NULL
          UNION ALL
          SELECT rating FROM tracked_series WHERE user_id = $1 AND rating IS NOT NULL
          UNION ALL
          SELECT rating FROM tracked_games WHERE user_id = $1 AND rating IS NOT NULL
          UNION ALL
          SELECT rating FROM tracked_episodes WHERE user_id = $1 AND rating IS NOT NULL
        ) AS all_ratings
      ) as avg_rating`
    ,
    [userId]
  );
  
  return result.rows[0];
};

const getRecentTrackedItems = async (userId, limit = 50) => {
  const result = await pool.query(
    `SELECT * FROM (
      SELECT id as db_id, user_id, tmdb_id as media_id, NULL::integer as igdb_id, NULL::integer as rawg_id, 'movie' as media_type, status, rating, favorite, created_at FROM tracked_movies WHERE user_id = $1
      UNION ALL
      SELECT id as db_id, user_id, tmdb_id as media_id, NULL::integer as igdb_id, NULL::integer as rawg_id, 'series' as media_type, status, rating, favorite, created_at FROM tracked_series WHERE user_id = $1
      UNION ALL
      SELECT id as db_id, user_id, COALESCE(igdb_id, rawg_id) as media_id, igdb_id, rawg_id, 'game' as media_type, status, rating, favorite, created_at FROM tracked_games WHERE user_id = $1
    ) AS combined
    ORDER BY created_at DESC
    LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

const getRatingDistribution = async (userId) => {
  const result = await pool.query(
    `SELECT rating, COUNT(*) as count FROM (
      SELECT rating FROM tracked_movies WHERE user_id = $1 AND rating IS NOT NULL
      UNION ALL
      SELECT rating FROM tracked_series WHERE user_id = $1 AND rating IS NOT NULL
      UNION ALL
      SELECT rating FROM tracked_games WHERE user_id = $1 AND rating IS NOT NULL
      UNION ALL
      SELECT rating FROM tracked_episodes WHERE user_id = $1 AND rating IS NOT NULL
    ) AS all_ratings
    GROUP BY rating
    ORDER BY rating ASC`,
    [userId]
  );
  return result.rows;
};

// Library counts for the Profile page (matches what the Library tabs show —
// legacy RAWG-only games are excluded, same as getUserGames).
const getProfileCounts = async (userId) => {
  const result = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM tracked_movies WHERE user_id = $1) AS movies,
      (SELECT COUNT(*) FROM tracked_series WHERE user_id = $1) AS series,
      (SELECT COUNT(*) FROM tracked_games  WHERE user_id = $1 AND igdb_id IS NOT NULL) AS games`,
    [userId]
  );
  return result.rows[0];
};

// Most recent items the user rated OR reviewed, newest first. Each tracked row
// is one media item, so no client-side de-duplication is needed.
const getRecentRatedOrReviewed = async (userId, limit = 5) => {
  const result = await pool.query(
    `SELECT * FROM (
      SELECT id AS db_id, tmdb_id AS media_id, NULL::integer AS igdb_id, NULL::integer AS rawg_id,
             NULL::integer AS season_number, NULL::integer AS episode_number,
             'movie' AS media_type, status, rating, review, updated_at AS created_at
        FROM tracked_movies
       WHERE user_id = $1 AND (rating IS NOT NULL OR review IS NOT NULL)
      UNION ALL
      SELECT id, tmdb_id, NULL::integer, NULL::integer, NULL::integer, NULL::integer,
             'series', status, rating, review, updated_at
        FROM tracked_series
       WHERE user_id = $1 AND (rating IS NOT NULL OR review IS NOT NULL)
      UNION ALL
      SELECT id, igdb_id, igdb_id, rawg_id, NULL::integer, NULL::integer,
             'game', status, rating, review, updated_at
        FROM tracked_games
       WHERE user_id = $1 AND igdb_id IS NOT NULL AND (rating IS NOT NULL OR review IS NOT NULL)
      UNION ALL
      SELECT id, tmdb_id, NULL::integer, NULL::integer, season_number, episode_number,
             'episode', status, rating, review, created_at
        FROM tracked_episodes
       WHERE user_id = $1 AND (rating IS NOT NULL OR review IS NOT NULL)
    ) AS activity
    ORDER BY created_at DESC
    LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

module.exports = {
  getStats,
  getRecentTrackedItems,
  getRatingDistribution,
  getProfileCounts,
  getRecentRatedOrReviewed,
};
