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

// ─── Refresh Token Functions (Selector:Secret Pattern) ────────────────────────

// Creates a new refresh token row and returns the full row (including UUID id as selector)
const createRefreshToken = async (userId, secretHash, expiresAt, absoluteExpiresAt) => {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, secret_hash, expires_at, absolute_expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, expires_at, absolute_expires_at`,
    [userId, secretHash, expiresAt, absoluteExpiresAt]
  );
  return result.rows[0];
};

// O(1) lookup by selector (UUID primary key) — no scanning
const findRefreshTokenById = async (selector) => {
  const result = await pool.query(
    `SELECT id, user_id, secret_hash, expires_at, absolute_expires_at, rotated_at
     FROM refresh_tokens WHERE id = $1`,
    [selector]
  );
  return result.rows[0] || null;
};

// Grace period: mark as rotated instead of deleting
const markRefreshTokenRotated = async (selector) => {
  await pool.query(
    'UPDATE refresh_tokens SET rotated_at = NOW() WHERE id = $1',
    [selector]
  );
};

// Direct delete by selector (for logout)
const deleteRefreshToken = async (id) => {
  await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [id]);
};

const deleteAllRefreshTokensForUser = async (userId) => {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

// ─── User Profile Functions ───────────────────────────────────────────────────

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

// Cleanup: remove expired tokens and rotated tokens older than 30 seconds
const cleanupStaleTokens = async () => {
  await pool.query(
    `DELETE FROM refresh_tokens
     WHERE expires_at < NOW()
        OR absolute_expires_at < NOW()
        OR (rotated_at IS NOT NULL AND rotated_at < NOW() - INTERVAL '30 seconds')`
  );
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
  findRefreshTokenById,
  markRefreshTokenRotated,
  deleteRefreshToken,
  deleteAllRefreshTokensForUser,
  cleanupStaleTokens,
};
