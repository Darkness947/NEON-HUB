require('dotenv').config({ path: '../.env' });
const pool = require('../config/db');

const test = async () => {
  const result = await pool.query('SELECT * FROM recently_viewed');
  console.log(result.rows);
  process.exit(0);
};

test();
