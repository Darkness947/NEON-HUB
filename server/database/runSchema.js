require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = fs.readFileSync('./database/schema.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('✅ All tables and indexes created successfully');
    return pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
  })
  .then((result) => {
    console.log('📋 Tables in database:');
    result.rows.forEach((row) => console.log('   •', row.table_name));
    console.log(`\n   Total: ${result.rows.length} tables`);
    pool.end();
  })
  .catch((err) => {
    console.error('❌ Error running schema:', err.message);
    pool.end();
    process.exit(1);
  });
