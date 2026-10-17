const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const historyModel = require('../models/historyModel');
const libraryModel = require('../models/libraryModel');
const hydrateItem = require('../utils/hydrateItem');

const recordVisit = asyncHandler(async (req, res) => {
  const { media_type, media_id } = req.body;
  const userId = req.user.id;

  if (!['movie', 'series', 'game'].includes(media_type)) {
    throw new AppError('Invalid media type', 400, 'VALIDATION_ERROR');
  }
  if (!media_id) {
    throw new AppError('Media ID is required', 400, 'VALIDATION_ERROR');
  }

  const record = await historyModel.logVisit(userId, media_type, media_id);
  
  res.status(200).json({
    success: true,
    data: record
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const history = await historyModel.getHistory(userId);

  const hydratedHistory = await Promise.all(
    history.map(async (item) => {
      // 1. Fetch library entry if it exists
      let libraryEntry = null;
      if (item.media_type === 'movie') {
        libraryEntry = await libraryModel.getMovieEntry(userId, item.media_id);
      } else if (item.media_type === 'series') {
        libraryEntry = await libraryModel.getSeriesEntry(userId, item.media_id);
      } else if (item.media_type === 'game') {
        libraryEntry = await libraryModel.getGameEntry(userId, item.media_id);
      }

      // 2. Combine history item with library entry properties (status, rating, favorite, review, etc.)
      // Note: We MUST preserve the history record's 'id' as 'history_id' and 'db_id' as the library entry's 'id'
      const combinedItem = {
        ...item,
        ...(libraryEntry ? {
          status: libraryEntry.status,
          rating: libraryEntry.rating,
          favorite: libraryEntry.favorite,
          review: libraryEntry.review,
          hours_played: libraryEntry.hours_played,
          db_id: libraryEntry.id, // ID from tracked_* table
          igdb_id: libraryEntry.igdb_id,
          rawg_id: libraryEntry.rawg_id
        } : {
          status: null // Indicates it's not in the library
        }),
        history_id: item.id // The ID in recently_viewed table
      };

      // 3. Hydrate with API data (poster, title)
      const hydrated = await hydrateItem(combinedItem, item.media_type);
      return hydrated;
    })
  );

  res.status(200).json({
    success: true,
    data: hydratedHistory
  });
});

const removeHistory = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Array of history IDs is required', 400, 'VALIDATION_ERROR');
  }

  const removed = await historyModel.removeHistory(userId, ids);

  res.status(200).json({
    success: true,
    data: removed
  });
});

const getHistoryCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const count = await historyModel.getHistoryCount(userId);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

module.exports = {
  recordVisit,
  getHistory,
  getHistoryCount,
  removeHistory
};
