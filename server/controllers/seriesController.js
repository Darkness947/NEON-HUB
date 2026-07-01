const asyncHandler = require('../utils/asyncHandler');
const tmdbService = require('../services/tmdbService');

const getTrending = asyncHandler(async (req, res) => {
  const data = await tmdbService.getTrendingSeries();
  res.status(200).json({ success: true, data });
});

const search = asyncHandler(async (req, res) => {
  const query = req.query.q;
  const page = req.query.page || 1;
  if (!query) {
    return res.status(200).json({ success: true, data: { results: [], page: 1, total_pages: 0, total_results: 0 } });
  }
  const data = await tmdbService.searchSeries(query, page);
  res.status(200).json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await tmdbService.getSeriesById(req.params.id);
  res.status(200).json({ success: true, data });
});

const getSeason = asyncHandler(async (req, res) => {
  const { id, n } = req.params;
  const data = await tmdbService.getSeriesSeason(id, n);
  res.status(200).json({ success: true, data });
});

module.exports = {
  getTrending,
  search,
  getById,
  getSeason,
};
