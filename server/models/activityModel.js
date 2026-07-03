const pool = require('../config/db');

const logActivity = async (userId, action, mediaType, mediaId, meta = null) => {
  const result = await pool.query(
    `INSERT INTO activity_log (user_id, action, media_type, media_id, meta)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, action, mediaType, mediaId, meta]
  );
  return result.rows[0];
};

const getRecentActivity = async (userId, limit = 20) => {
  const result = await pool.query(
    `SELECT * FROM activity_log
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

module.exports = {
  logActivity,
  getRecentActivity,
};
