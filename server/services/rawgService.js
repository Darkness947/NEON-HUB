const axios = require('axios');
const cache = require('../config/cache');

const RAWG_BASE_URL = process.env.RAWG_BASE_URL || 'https://api.rawg.io/api';
const RAWG_API_KEY = process.env.RAWG_API_KEY;

const rawgApi = axios.create({
  baseURL: RAWG_BASE_URL,
  timeout: 3000, // Reduced to fail fast since the API is down
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

const AppError = require('../utils/AppError');

const fallbackGames = [
  { id: 3498, rawg_id: 3498, title: 'Grand Theft Auto V', poster_url: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg', release_date: '2013-09-17', vote_average: 4.47, platforms: ['PC', 'PlayStation', 'Xbox'], genres: ['Action', 'Adventure'], media_type: 'game' },
  { id: 3328, rawg_id: 3328, title: 'The Witcher 3: Wild Hunt', poster_url: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', release_date: '2015-05-18', vote_average: 4.66, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], genres: ['Action', 'Adventure', 'RPG'], media_type: 'game' },
  { id: 4200, rawg_id: 4200, title: 'Portal 2', poster_url: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg', release_date: '2011-04-18', vote_average: 4.61, platforms: ['PC', 'PlayStation', 'Xbox', 'macOS', 'Linux'], genres: ['Shooter', 'Puzzle'], media_type: 'game' },
  { id: 5286, rawg_id: 5286, title: 'Tomb Raider (2013)', poster_url: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eff6324653.jpg', release_date: '2013-03-05', vote_average: 4.05, platforms: ['PC', 'PlayStation', 'Xbox', 'macOS'], genres: ['Action', 'Adventure'], media_type: 'game' },
  { id: 41494, rawg_id: 41494, title: 'Cyberpunk 2077', poster_url: 'https://media.rawg.io/media/games/26d/26d440e0abf48a192131920cd49f6eb7.jpg', release_date: '2020-12-10', vote_average: 4.12, platforms: ['PC', 'PlayStation', 'Xbox'], genres: ['Action', 'RPG'], media_type: 'game' }
];

const rawgService = {
  getTrendingGames: async (page = 1) => {
    const cacheKey = `trending_games_page_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await rawgApi.get('/games', {
        params: {
          ordering: '-added',
          page_size: 20,
          page,
        },
      });

      const cleaned = data.results.map(cleanGame);
      cache.set(cacheKey, cleaned, 600); // Cache for 10 minutes
      return cleaned;
    } catch (err) {
      console.warn('RAWG API is down, returning fallback data for trending games');
      return fallbackGames;
    }
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
