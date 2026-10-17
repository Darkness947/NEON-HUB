const asyncHandler = require('../utils/asyncHandler');
const { getGamesProvider } = require('../services/gamesProviderFactory');
const gamesService = getGamesProvider();

const getTrendingGames = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const wantsRandom = req.query.random === '1' || req.query.random === 'true';

  let games;
  if (wantsRandom && typeof gamesService.getRandomTrendingGames === 'function') {
    games = await gamesService.getRandomTrendingGames(20);
  } else if (wantsRandom) {
    games = await gamesService.getTrendingGames(Math.floor(Math.random() * 10) + 1);
  } else {
    games = await gamesService.getTrendingGames(page);
  }
  
  res.status(200).json({
    success: true,
    data: games,
  });
});

const searchGames = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  
  if (!q) {
    return res.status(200).json({ success: true, data: [] });
  }

  const games = await gamesService.searchGames(q, page);
  
  res.status(200).json({
    success: true,
    data: games,
  });
});

const getGameById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const game = await gamesService.getGameById(id);
  // Optional: similar games if the provider supports it, otherwise undefined
  const similar = await gamesService.getSimilarGames ? await gamesService.getSimilarGames(id) : [];
  
  res.status(200).json({
    success: true,
    data: {
      ...game,
      similar,
    },
  });
});

module.exports = {
  getTrendingGames,
  searchGames,
  getGameById,
};
