const pool = require('./config/db');
const hydrateItem = require('./utils/hydrateItem');

async function run() {
  require('dotenv').config({path: './.env'});
  const userRes = await pool.query('SELECT id FROM users LIMIT 1');
  if (userRes.rows.length === 0) {
    console.log("No users.");
    process.exit(0);
  }
  const userId = userRes.rows[0].id;
  const historyRes = await pool.query('SELECT * FROM recently_viewed WHERE user_id = $1 LIMIT 5', [userId]);
  let items = historyRes.rows;
  if (items.length === 0) {
    items = [{ media_type: 'movie', media_id: '157336', id: 1 }];
  }
  
  const hydrated = await Promise.all(items.map(async item => {
    return await hydrateItem({ ...item, status: null }, item.media_type);
  }));
  console.log(JSON.stringify(hydrated, null, 2));
  process.exit(0);
}
run();
