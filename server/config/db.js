const { Pool } = require('pg');

const rawUrl = (process.env.DATABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');

const pool = new Pool({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  // Reuse warm TLS connections across bursts of navigation (each new Neon
  // connection costs a TLS handshake). Kept well under Neon's 5-minute
  // auto-suspend window so idle connections never keep the compute awake long.
  idleTimeoutMillis: 120000,
  // Neon may need a moment to resume from scale-to-zero
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

// When Neon suspends it terminates idle connections. Without this listener,
// pg would emit an unhandled 'error' event and crash the process.
pool.on('error', (err) => {
  console.error('⚠️  Idle database client error (will reconnect on next query):', err.message);
});

// Startup connection test — exits if DB is unreachable
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected to Neon DB at', result.rows[0].now);
  }
});

module.exports = pool;
