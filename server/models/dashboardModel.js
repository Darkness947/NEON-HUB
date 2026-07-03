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
      SELECT id as db_id, user_id, tmdb_id as media_id, 'movie' as media_type, status, rating, favorite, created_at FROM tracked_movies WHERE user_id = $1
      UNION ALL
      SELECT id as db_id, user_id, tmdb_id as media_id, 'series' as media_type, status, rating, favorite, created_at FROM tracked_series WHERE user_id = $1
      UNION ALL
      SELECT id as db_id, user_id, rawg_id as media_id, 'game' as media_type, status, rating, favorite, created_at FROM tracked_games WHERE user_id = $1
    ) AS combined
    ORDER BY created_at DESC
    LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

module.exports = {
  getStats,
  getRecentTrackedItems
};
