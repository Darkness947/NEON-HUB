const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/db');

const runMigration = async () => {
  try {
    const sqlPath = path.join(__dirname, 'migrations', '002_drop_rawg_id_not_null.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration...');
    await pool.query(sql);
    console.log('✅ Migration 002_drop_rawg_id_not_null.sql completed successfully.');
    
    console.log('\nVerifying column nullable status...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tracked_games' AND column_name = 'rawg_id';
    `);
    
    const rawgCol = result.rows[0];
    if (rawgCol && rawgCol.is_nullable === 'YES') {
      console.log('✅ rawg_id is now nullable:');
      console.log(rawgCol);
    } else {
      console.log('❌ Failed: rawg_id is NOT nullable or not found.');
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
  } finally {
    process.exit(0);
  }
};

runMigration();
