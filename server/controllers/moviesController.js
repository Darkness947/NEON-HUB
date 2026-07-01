const asyncHandler = require('../utils/asyncHandler');
const tmdbService = require('../services/tmdbService');

const getTrending = asyncHandler(async (req, res) => {
  const data = await tmdbService.getTrendingMovies();
  res.status(200).json({ success: true, data });
});

const getPopular = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const data = await tmdbService.getPopularMovies(page);
  res.status(200).json({ success: true, data });
});

const getUpcoming = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const data = await tmdbService.getUpcomingMovies(page);
  res.status(200).json({ success: true, data });
});

const search = asyncHandler(async (req, res) => {
  const query = req.query.q;
  const page = req.query.page || 1;
  if (!query) {
    return res.status(200).json({ success: true, data: { results: [], page: 1, total_pages: 0, total_results: 0 } });
  }
  const data = await tmdbService.searchMovies(query, page);
  res.status(200).json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await tmdbService.getMovieById(req.params.id);
  res.status(200).json({ success: true, data });
});

module.exports = {
  getTrending,
  getPopular,
  getUpcoming,
  search,
  getById,
};
