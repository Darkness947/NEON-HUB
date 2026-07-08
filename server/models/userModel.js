const pool = require('../config/db');

// ─── User Functions ───────────────────────────────────────────────────────────

const createUser = async (username, email, hashedPassword) => {
  const result = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, avatar_url, bio, created_at`,
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, username, email, password, avatar_url, bio, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

const updateAvatar = async (userId, avatarUrl) => {
  const result = await pool.query(
    'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, email, avatar_url, created_at',
    [avatarUrl, userId]
  );
  return result.rows[0] || null;
};

const updatePassword = async (userId, hashedPassword) => {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
    [hashedPassword, userId]
  );
  return result.rows[0] || null;
};

// ─── Refresh Token Functions ──────────────────────────────────────────────────

const createRefreshToken = async (userId, tokenHash, expiresAt) => {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
};

const findRefreshTokensByUser = async (userId) => {
  const result = await pool.query(
    'SELECT id, token_hash, expires_at FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()',
    [userId]
  );
  return result.rows;
};

const deleteRefreshToken = async (id) => {
  await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [id]);
};

const deleteAllRefreshTokensForUser = async (userId) => {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

const updateBio = async (userId, bio) => {
  const result = await pool.query(
    'UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, username, email, avatar_url, bio, created_at',
    [bio, userId]
  );
  return result.rows[0] || null;
};

const deleteUser = async (userId) => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateAvatar,
  updateBio,
  updatePassword,
  deleteUser,
  createRefreshToken,
  findRefreshTokensByUser,
  deleteRefreshToken,
  deleteAllRefreshTokensForUser,
};
