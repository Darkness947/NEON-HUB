const axios = require('axios');
const cache = require('../config/cache');

const RAWG_BASE_URL = process.env.RAWG_BASE_URL || 'https://api.rawg.io/api';
const RAWG_API_KEY = process.env.RAWG_API_KEY;

const rawgApi = axios.create({
  baseURL: RAWG_BASE_URL,
  timeout: 20000,
  params: {
    key: RAWG_API_KEY,
  },
});

// Cleaners
const cleanGame = (g) => ({
  id: g.id,
  rawg_id: g.id,
  title: g.name,
  poster_url: g.background_image,
  release_date: g.released,
  vote_average: g.rating,
  platforms: g.platforms?.map((p) => p.platform.name) || [],
  genres: g.genres?.map((genre) => genre.name) || [],
  media_type: 'game',
});

const cleanGameDetail = (g, screenshots = []) => ({
  ...cleanGame(g),
  description: g.description_raw || g.description || '',
  genres: g.genres?.map((genre) => genre.name) || [],
  developers: g.developers?.map((dev) => dev.name) || [],
  publishers: g.publishers?.map((pub) => pub.name) || [],
  screenshots: screenshots,
});

const rawgService = {
  getTrendingGames: async (page = 1) => {
    const cacheKey = `trending_games_page_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await rawgApi.get('/games', {
      params: {
        ordering: '-rating',
        page_size: 20,
        page,
      },
    });

    const cleaned = data.results.map(cleanGame);
    cache.set(cacheKey, cleaned, 600); // Cache for 10 minutes
    return cleaned;
  },

  searchGames: async (query, page = 1) => {
    const { data } = await rawgApi.get('/games', {
      params: {
        search: query,
        page_size: 20,
        page,
      },
    });

    return data.results.map(cleanGame);
  },

  getGameById: async (id) => {
    // Fetch game details and screenshots in parallel
    const [gameRes, screensRes] = await Promise.all([
      rawgApi.get(`/games/${id}`),
      rawgApi.get(`/games/${id}/screenshots`).catch(() => ({ data: { results: [] } })),
    ]);

    const screenshots = screensRes.data.results.map((s) => s.image);

    return cleanGameDetail(gameRes.data, screenshots);
  },
  
  // Gets related games from the game series (same franchise)
  getSimilarGames: async (id) => {
    try {
      const { data } = await rawgApi.get(`/games/${id}/game-series`);
      return data.results.map(cleanGame).slice(0, 6);
    } catch (error) {
      // If endpoint fails, return empty array
      return [];
    }
  },
  
  getGameBasic: async (id) => {
    const { data } = await rawgApi.get(`/games/${id}`);
    return cleanGame(data);
  }
};

module.exports = rawgService;
