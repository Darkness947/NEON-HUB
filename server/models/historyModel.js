const pool = require('../config/db');

const logVisit = async (userId, mediaType, mediaId) => {
  const result = await pool.query(
    `INSERT INTO recently_viewed (user_id, media_type, media_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, media_type, media_id)
     DO UPDATE SET last_viewed_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, mediaType, mediaId]
  );
  return result.rows[0];
};

const getHistory = async (userId, limit = 50) => {
  const result = await pool.query(
    `SELECT * FROM recently_viewed
     WHERE user_id = $1
     ORDER BY last_viewed_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

const removeHistory = async (userId, ids) => {
  const result = await pool.query(
    `DELETE FROM recently_viewed
     WHERE user_id = $1 AND id = ANY($2::int[])
     RETURNING *`,
    [userId, ids]
  );
  return result.rows;
};

const getHistoryCount = async (userId) => {
  const result = await pool.query(
    'SELECT COUNT(*)::int as count FROM recently_viewed WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.count ? parseInt(result.rows[0].count, 10) : 0;
};

module.exports = {
  logVisit,
  getHistory,
  getHistoryCount,
  removeHistory
};
