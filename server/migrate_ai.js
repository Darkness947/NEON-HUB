require('dotenv').config();
const pool = require('./config/db');

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_cache (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
        feature      VARCHAR(50) NOT NULL,
        media_type   VARCHAR(10) NOT NULL,
        request_hash TEXT UNIQUE NOT NULL,
        response     JSONB NOT NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_cache(request_hash);
    `);
    
    console.log("Migration successful.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
