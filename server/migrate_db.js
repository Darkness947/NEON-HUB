require('dotenv').config();
const pool = require('./config/db');

async function migrate() {
  try {
    await pool.query(`ALTER TABLE tracked_movies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`);
    await pool.query(`ALTER TABLE tracked_series ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`);
    await pool.query(`ALTER TABLE tracked_games ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`);
    
    // Update existing records to have updated_at = created_at
    await pool.query(`UPDATE tracked_movies SET updated_at = created_at WHERE updated_at IS NULL;`);
    await pool.query(`UPDATE tracked_series SET updated_at = created_at WHERE updated_at IS NULL;`);
    await pool.query(`UPDATE tracked_games SET updated_at = created_at WHERE updated_at IS NULL;`);
    
    console.log("Migration successful.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
