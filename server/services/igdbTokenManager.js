const axios = require('axios');
const NodeCache = require('node-cache');

// Dedicated cache instance for the token (separate from trending cache)
const tokenCache = new NodeCache();
const TOKEN_CACHE_KEY = 'igdb_bearer_token';

const getIgdbToken = async () => {
  // 1. Check cache first
  const cached = tokenCache.get(TOKEN_CACHE_KEY);
  if (cached) {
    // Log remaining TTL for debugging
    const ttl = tokenCache.getTtl(TOKEN_CACHE_KEY);
    const remainingHours = Math.floor((ttl - Date.now()) / 3600000);
    console.log(`IGDB: Using cached Bearer token (~${remainingHours}h remaining)`);
    return cached;
  }

  // 2. Fetch new token from Twitch
  console.log('IGDB: Fetching new Bearer token from Twitch...');
  
  try {
    const params = new URLSearchParams({
      client_id:     process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type:    'client_credentials',
    });

    const { data } = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // 3. Cache with safety buffer (expires_in is in seconds)
    const ttlSeconds = data.expires_in - 3600; // 1h buffer
    tokenCache.set(TOKEN_CACHE_KEY, data.access_token, ttlSeconds);
    console.log(`IGDB: Bearer token cached for ${Math.floor(ttlSeconds / 86400)} days`);

    return data.access_token;
  } catch (error) {
    const reason = error.response?.data?.message || error.message || 'Unknown error';
    console.error('❌ IGDB token fetch failed:', reason);
    throw new Error(`IGDB authentication failed: ${reason}`);
  }
};

module.exports = { getIgdbToken };
