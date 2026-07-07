require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const pool = require('./config/db');

async function test() {
  try {
    const user = await pool.query('SELECT id FROM users LIMIT 1');
    if (!user.rows[0]) throw new Error("No users found");
    const userId = user.rows[0].id;
    
    // Add a dummy game for this user to test updating
    await pool.query('INSERT INTO tracked_games (user_id, rawg_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [userId, 3328, 'playing']);
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });

    const updateRes = await axios.put('http://localhost:5000/api/library/update', {
      media_type: 'game',
      media_id: '3328',
      hours_played: 2.5
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Success:', updateRes.data);
  } catch(e) {
    console.error('Error Status:', e.response?.status);
    console.error('Error Data:', e.response?.data);
    console.error(e.message);
  }
}

test().then(() => process.exit(0));
