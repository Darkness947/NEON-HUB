const pool = require('../config/db');

// --- MOVIES ---

const addMovie = async (userId, tmdbId, status) => {
  const result = await pool.query(
    `INSERT INTO tracked_movies (user_id, tmdb_id, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tmdbId, status]
  );
  return result.rows[0];
};

const updateMovie = async (userId, tmdbId, fields) => {
  const allowed = ['status', 'rating', 'review', 'favorite', 'watched_at'];
  const updates = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${i}`);
      values.push(fields[key]);
      i++;
    }
  }

  if (updates.length === 0) return null;

  values.push(userId, tmdbId);
  const result = await pool.query(
    `UPDATE tracked_movies
     SET ${updates.join(', ')}
     WHERE user_id = $${i} AND tmdb_id = $${i + 1}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const removeMovie = async (userId, tmdbId) => {
  const result = await pool.query(
    `DELETE FROM tracked_movies
     WHERE user_id = $1 AND tmdb_id = $2
     RETURNING *`,
    [userId, tmdbId]
  );
  return result.rows[0] || null;
};

const getMovieEntry = async (userId, tmdbId) => {
  const result = await pool.query(
    `SELECT * FROM tracked_movies
     WHERE user_id = $1 AND tmdb_id = $2`,
    [userId, tmdbId]
  );
  return result.rows[0] || null;
};

const getUserMovies = async (userId, status = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const values = [userId];
  let i = 2;

  if (status) {
    conditions.push(`status = $${i}`);
    values.push(status);
    i++;
  }

  values.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM tracked_movies
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      values
    ),
    pool.query(
      `SELECT COUNT(*) FROM tracked_movies WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2)
    ),
  ]);

  return {
    items: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    hasMore: offset + limit < parseInt(countResult.rows[0].count),
  };
};

// --- SERIES ---

const addSeries = async (userId, tmdbId, status) => {
  const result = await pool.query(
    `INSERT INTO tracked_series (user_id, tmdb_id, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tmdbId, status]
  );
  return result.rows[0];
};

const updateSeries = async (userId, tmdbId, fields) => {
  const allowed = ['status', 'rating', 'review', 'favorite', 'episodes_watched'];
  const updates = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${i}`);
      values.push(fields[key]);
      i++;
    }
  }

  if (updates.length === 0) return null;

  values.push(userId, tmdbId);
  const result = await pool.query(
    `UPDATE tracked_series
     SET ${updates.join(', ')}
     WHERE user_id = $${i} AND tmdb_id = $${i + 1}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const removeSeries = async (userId, tmdbId) => {
  const result = await pool.query(
    `DELETE FROM tracked_series
     WHERE user_id = $1 AND tmdb_id = $2
     RETURNING *`,
    [userId, tmdbId]
  );
  return result.rows[0] || null;
};

const getSeriesEntry = async (userId, tmdbId) => {
  const result = await pool.query(
    `SELECT * FROM tracked_series
     WHERE user_id = $1 AND tmdb_id = $2`,
    [userId, tmdbId]
  );
  return result.rows[0] || null;
};

const getUserSeries = async (userId, status = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const values = [userId];
  let i = 2;

  if (status) {
    conditions.push(`status = $${i}`);
    values.push(status);
    i++;
  }

  values.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM tracked_series
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      values
    ),
    pool.query(
      `SELECT COUNT(*) FROM tracked_series WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2)
    ),
  ]);

  return {
    items: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    hasMore: offset + limit < parseInt(countResult.rows[0].count),
  };
};

// --- GAMES ---

const addGame = async (userId, rawgId, status) => {
  const result = await pool.query(
    `INSERT INTO tracked_games (user_id, rawg_id, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, rawgId, status]
  );
  return result.rows[0];
};

const updateGame = async (userId, rawgId, fields) => {
  const allowed = ['status', 'rating', 'review', 'favorite', 'hours_played'];
  const updates = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${i}`);
      values.push(fields[key]);
      i++;
    }
  }

  if (updates.length === 0) return null;

  values.push(userId, rawgId);
  const result = await pool.query(
    `UPDATE tracked_games
     SET ${updates.join(', ')}
     WHERE user_id = $${i} AND rawg_id = $${i + 1}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const removeGame = async (userId, rawgId) => {
  const result = await pool.query(
    `DELETE FROM tracked_games
     WHERE user_id = $1 AND rawg_id = $2
     RETURNING *`,
    [userId, rawgId]
  );
  return result.rows[0] || null;
};

const getGameEntry = async (userId, rawgId) => {
  const result = await pool.query(
    `SELECT * FROM tracked_games
     WHERE user_id = $1 AND rawg_id = $2`,
    [userId, rawgId]
  );
  return result.rows[0] || null;
};

const getUserGames = async (userId, status = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const values = [userId];
  let i = 2;

  if (status) {
    conditions.push(`status = $${i}`);
    values.push(status);
    i++;
  }

  values.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM tracked_games
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      values
    ),
    pool.query(
      `SELECT COUNT(*) FROM tracked_games WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2)
    ),
  ]);

  return {
    items: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    hasMore: offset + limit < parseInt(countResult.rows[0].count),
  };
};


// --- FAVORITES ---
const getFavorites = async (userId) => {
  const result = await pool.query(
    `SELECT id, tmdb_id as media_id, status, rating, 'movie' as media_type, created_at 
     FROM tracked_movies WHERE user_id = $1 AND favorite = true
     UNION ALL
     SELECT id, tmdb_id as media_id, status, rating, 'series' as media_type, created_at 
     FROM tracked_series WHERE user_id = $1 AND favorite = true
     UNION ALL
     SELECT id, rawg_id as media_id, status, rating, 'game' as media_type, created_at 
     FROM tracked_games WHERE user_id = $1 AND favorite = true
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  addMovie, updateMovie, removeMovie, getMovieEntry, getUserMovies,
  addSeries, updateSeries, removeSeries, getSeriesEntry, getUserSeries,
  addGame, updateGame, removeGame, getGameEntry, getUserGames,
  getFavorites
};
