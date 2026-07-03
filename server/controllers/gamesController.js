const asyncHandler = require('../utils/asyncHandler');
const rawgService = require('../services/rawgService');

const getTrendingGames = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const games = await rawgService.getTrendingGames(page);
  
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

  const games = await rawgService.searchGames(q, page);
  
  res.status(200).json({
    success: true,
    data: games,
  });
});

const getGameById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const game = await rawgService.getGameById(id);
  const similar = await rawgService.getSimilarGames(id);
  
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
