const pool = require('../config/db');

const getCachedResponse = async (requestHash) => {
  const result = await pool.query(
    `SELECT response FROM ai_cache WHERE request_hash = $1`,
    [requestHash]
  );
  return result.rows[0]?.response || null;
};

const cacheResponse = async (userId, feature, mediaType, requestHash, response) => {
  const result = await pool.query(
    `INSERT INTO ai_cache (user_id, feature, media_type, request_hash, response)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (request_hash) 
     DO UPDATE SET response = EXCLUDED.response, created_at = NOW()
     RETURNING *`,
    [userId, feature, mediaType, requestHash, JSON.stringify(response)]
  );
  return result.rows[0];
};

module.exports = {
  getCachedResponse,
  cacheResponse
};
