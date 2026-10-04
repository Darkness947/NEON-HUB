const pool = require('../config/db');

const getUserReviews = async (userId) => {
  const result = await pool.query(
    `SELECT id as db_id, user_id, tmdb_id as media_id, NULL::integer as igdb_id, NULL::integer as rawg_id, 'movie' as media_type, status, rating, review, updated_at as created_at, watched_at 
     FROM tracked_movies 
     WHERE user_id = $1 AND review IS NOT NULL
     UNION ALL
     SELECT id as db_id, user_id, tmdb_id as media_id, NULL::integer as igdb_id, NULL::integer as rawg_id, 'series' as media_type, status, rating, review, updated_at as created_at, NULL as watched_at 
     FROM tracked_series 
     WHERE user_id = $1 AND review IS NOT NULL
     UNION ALL
     SELECT id as db_id, user_id, COALESCE(igdb_id, rawg_id) as media_id, igdb_id, rawg_id, 'game' as media_type, status, rating, review, updated_at as created_at, NULL as watched_at 
     FROM tracked_games 
     WHERE user_id = $1 AND review IS NOT NULL
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getMediaReviews = async (mediaType, mediaId) => {
  const tableMap = {
    'movie': 'tracked_movies',
    'series': 'tracked_series',
    'game': 'tracked_games'
  };
  
  const tableName = tableMap[mediaType];
  if (!tableName) throw new Error('Invalid media type');

  let whereClause = '';
  if (mediaType === 'game') {
    whereClause = `t.igdb_id = $1 OR t.rawg_id = $1`;
  } else {
    whereClause = `t.tmdb_id = $1`;
  }

  const result = await pool.query(
    `SELECT t.rating, t.review, t.updated_at as created_at, u.username, u.avatar_url, u.id as user_id
     FROM ${tableName} t
     JOIN users u ON t.user_id = u.id
     WHERE (${whereClause}) AND t.review IS NOT NULL
     ORDER BY t.updated_at DESC`,
    [mediaId]
  );
  return result.rows;
};

module.exports = {
  getUserReviews,
  getMediaReviews,
};
