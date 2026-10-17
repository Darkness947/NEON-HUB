const axios = require('axios');
const cache = require('../config/cache');
const { getIgdbToken } = require('./igdbTokenManager');
const AppError = require('../utils/AppError');

const GAME_FIELDS = `
  fields id,name,cover.image_id,rating,rating_count,summary,
         first_release_date,platforms.name,genres.name,
         screenshots.image_id,
         involved_companies.company.name,
         involved_companies.developer,
         involved_companies.publisher;
`;

const _igdbRequest = async (endpoint, apicalypseBody) => {
  try {
    const token = await getIgdbToken();
    const { data } = await axios.post(
      `${process.env.IGDB_BASE_URL}${endpoint}`,
      apicalypseBody,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        timeout: 8000
      }
    );
    return data;
  } catch (error) {
    console.error('❌ IGDB API Error:', error.response?.data || error.message);
    throw new AppError('Games service is temporarily unavailable', 503, 'EXT_API_UNAVAILABLE');
  }
};

const _buildIgdbImageUrl = (imageId, size) => {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
};

const _igdbDateToString = (unixTimestamp) => {
  if (!unixTimestamp) return null;
  const date = new Date(unixTimestamp * 1000);
  return date.toISOString().split('T')[0];
};

const _cleanGame = (rawGame) => ({
  id:               rawGame.id,
  rawg_id:          rawGame.id, // Aliased for frontend compatibility
  igdb_id:          rawGame.id,
  title:            rawGame.name,
  poster_url:       _buildIgdbImageUrl(rawGame.cover?.image_id, 'cover_big'),
  cover_url:        _buildIgdbImageUrl(rawGame.cover?.image_id, 'cover_big'),
  cover_url_hd:     _buildIgdbImageUrl(rawGame.cover?.image_id, 'cover_big_2x'),
  backdrop_url:     rawGame.screenshots?.length > 0 
                      ? _buildIgdbImageUrl(rawGame.screenshots[0].image_id, 'screenshot_huge')
                      : _buildIgdbImageUrl(rawGame.cover?.image_id, '1080p'),
  vote_average:     rawGame.rating ? Math.round(rawGame.rating) / 10 : null,
  rating:           rawGame.rating ? Math.round(rawGame.rating) / 10 : null,
  rating_count:     rawGame.rating_count || 0,
  description:      rawGame.summary || null,
  summary:          rawGame.summary || null,
  overview:         rawGame.summary || null,
  release_date:     _igdbDateToString(rawGame.first_release_date),
  platforms:        rawGame.platforms?.map(p => p.name) || [],
  genres:           rawGame.genres?.map(g => g.name) || [],
  screenshots:      rawGame.screenshots?.map(s => ({
                      thumbnail: _buildIgdbImageUrl(s.image_id, 'screenshot_big'),
                      full:      _buildIgdbImageUrl(s.image_id, 'screenshot_huge'),
                    })) || [],
  publishers:       rawGame.involved_companies
                      ?.filter(ic => ic.publisher)
                      .map(ic => ic.company?.name)
                      .filter(Boolean) || [],
  developers:       rawGame.involved_companies
                      ?.filter(ic => ic.developer)
                      .map(ic => ic.company?.name)
                      .filter(Boolean) || [],
  media_type:       'game',
  provider:         'igdb',
});

// ─── Cache Settings ─────────────────────────────────────────────────────────────
// Game metadata (title, cover, genres) almost never changes — cache for 24h.
const GAME_TTL = 60 * 60 * 24;
// Trending pool: one IGDB request backs Home + Discover pages 1..POOL_PAGES.
const POOL_PAGE_SIZE = 20;
const POOL_PAGES = 10;
const POOL_TTL = 60 * 30;
const POOL_CACHE_KEY = 'igdb_trending_pool';

const _gameCacheKey = (id) => `igdb_game_${id}`;

let batchQueue = [];
let batchTimer = null;

const dispatchBatch = async () => {
  const currentBatch = batchQueue;
  batchQueue = [];
  batchTimer = null;
  
  if (currentBatch.length === 0) return;

  const ids = currentBatch.map(b => b.id);
  const uniqueIds = [...new Set(ids)].filter(id => id != null);
  
  if (uniqueIds.length === 0) {
    currentBatch.forEach(b => b.reject(new AppError('Game not found', 404, 'NOT_FOUND')));
    return;
  }

  try {
    const apicalypse = `
      ${GAME_FIELDS}
      where id = (${uniqueIds.join(',')});
      limit 500;
    `;
    const data = await _igdbRequest('/games', apicalypse);
    const mapped = data.map(_cleanGame);
    const gameMap = {};
    mapped.forEach(g => {
      gameMap[g.igdb_id] = g;
      cache.set(_gameCacheKey(g.igdb_id), g, GAME_TTL);
    });
    
    currentBatch.forEach(b => {
      if (gameMap[b.id]) {
        b.resolve(gameMap[b.id]);
      } else {
        b.reject(new AppError('Game not found', 404, 'NOT_FOUND'));
      }
    });
  } catch (error) {
    currentBatch.forEach(b => b.reject(error));
  }
};

// Single request for the top trending games; cached and shared by all callers.
// Concurrent callers during a cold cache share one in-flight request.
let poolInFlight = null;

const _getTrendingPool = async () => {
  const cached = cache.get(POOL_CACHE_KEY);
  if (cached) return cached;
  if (poolInFlight) return poolInFlight;

  poolInFlight = (async () => {
    try {
      const apicalypse = `
        ${GAME_FIELDS}
        where rating > 75 & rating_count > 10 & cover != null;
        sort rating_count desc;
        limit ${POOL_PAGE_SIZE * POOL_PAGES};
      `;
      const data = await _igdbRequest('/games', apicalypse);
      const cleaned = data.map(_cleanGame);
      cleaned.forEach(g => cache.set(_gameCacheKey(g.igdb_id), g, GAME_TTL));
      cache.set(POOL_CACHE_KEY, cleaned, POOL_TTL);
      return cleaned;
    } finally {
      poolInFlight = null;
    }
  })();

  return poolInFlight;
};

const igdbService = {
  getTrendingGames: async (page = 1) => {
    // Pages covered by the pool are served from memory (one shared IGDB call)
    if (page >= 1 && page <= POOL_PAGES) {
      const pool = await _getTrendingPool();
      const start = (page - 1) * POOL_PAGE_SIZE;
      return pool.slice(start, start + POOL_PAGE_SIZE);
    }

    const cacheKey = `igdb_trending_games_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * POOL_PAGE_SIZE;
    const apicalypse = `
      ${GAME_FIELDS}
      where rating > 75 & rating_count > 10 & cover != null;
      sort rating_count desc;
      limit ${POOL_PAGE_SIZE};
      offset ${offset};
    `;

    const data = await _igdbRequest('/games', apicalypse);
    const cleaned = data.map(_cleanGame);
    
    cache.set(cacheKey, cleaned, 600);
    return cleaned;
  },

  // Random selection from the popular pool — changes on every reload, always cached
  getRandomTrendingGames: async (count = POOL_PAGE_SIZE) => {
    const pool = await _getTrendingPool();
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  },

  warmTrendingPool: () => _getTrendingPool(),

  searchGames: async (query, page = 1) => {
    if (!query) return { items: [], page: 1, hasMore: false };
    
    const sanitizedQuery = query.replace(/"/g, '\\"');
    const limit = 20;
    const offset = (page - 1) * limit;

    const apicalypse = `
      ${GAME_FIELDS}
      search "${sanitizedQuery}";
      limit ${limit};
      offset ${offset};
    `;

    const data = await _igdbRequest('/games', apicalypse);
    const cleaned = data.map(_cleanGame);

    return cleaned;
  },

  getGameById: (igdbId) => {
    const cached = cache.get(_gameCacheKey(igdbId));
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve, reject) => {
      batchQueue.push({ id: igdbId, resolve, reject });
      if (!batchTimer) {
        batchTimer = setTimeout(dispatchBatch, 50); // 50ms batching window
      }
    });
  }
};

igdbService.getGameBasic = igdbService.getGameById;

module.exports = igdbService;
