require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const run = async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '003_create_recently_viewed.sql'), 'utf8');
  await pool.query(sql);
  console.log('Migration successful');
  process.exit(0);
};

run().catch(console.error);
