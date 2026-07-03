const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validationResult } = require('express-validator');
const libraryModel = require('../models/libraryModel');
const activityModel = require('../models/activityModel');
const tmdbService = require('../services/tmdbService');
const rawgService = require('../services/rawgService');

const hydrateItem = require('../utils/hydrateItem');

const addToLibrary = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR');
  }

  const { media_type, media_id, status } = req.body;
  const userId = req.user.id;

  let entry;
  try {
    if (media_type === 'movie') {
      entry = await libraryModel.addMovie(userId, media_id, status);
    } else if (media_type === 'series') {
      entry = await libraryModel.addSeries(userId, media_id, status);
    } else if (media_type === 'game') {
      entry = await libraryModel.addGame(userId, media_id, status);
    }
  } catch (err) {
    if (err.code === '23505') { // Postgres unique violation
      throw new AppError('Already in your library', 409, 'DUPLICATE_ENTRY');
    }
    throw err;
  }

  await activityModel.logActivity(userId, `added_${media_type}`, media_type, media_id);

  const hydrated = await hydrateItem(entry, media_type);

  res.status(201).json({
    success: true,
    data: hydrated
  });
});

const updateLibrary = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR');
  }

  const { media_type, media_id, ...fields } = req.body;
  const userId = req.user.id;

  let currentEntry;
  if (media_type === 'movie') currentEntry = await libraryModel.getMovieEntry(userId, media_id);
  else if (media_type === 'series') currentEntry = await libraryModel.getSeriesEntry(userId, media_id);
  else if (media_type === 'game') currentEntry = await libraryModel.getGameEntry(userId, media_id);

  if (!currentEntry) {
    throw new AppError('Item not found in library', 404, 'NOT_FOUND');
  }

  if (media_type === 'movie' && fields.status === 'completed' && currentEntry.status !== 'completed') {
    fields.watched_at = new Date();
  }

  let updatedEntry;
  if (media_type === 'movie') updatedEntry = await libraryModel.updateMovie(userId, media_id, fields);
  else if (media_type === 'series') updatedEntry = await libraryModel.updateSeries(userId, media_id, fields);
  else if (media_type === 'game') updatedEntry = await libraryModel.updateGame(userId, media_id, fields);

  if (updatedEntry) {
    await activityModel.logActivity(userId, `updated_${media_type}`, media_type, media_id, fields);
  }

  const hydrated = await hydrateItem(updatedEntry || currentEntry, media_type);

  res.status(200).json({
    success: true,
    data: hydrated
  });
});

const removeFromLibrary = asyncHandler(async (req, res) => {
  const { media_type, media_id } = req.body;
  if (!media_type || !media_id) {
    throw new AppError('media_type and media_id are required', 400, 'VALIDATION_ERROR');
  }

  const userId = req.user.id;
  let removed;
  if (media_type === 'movie') removed = await libraryModel.removeMovie(userId, media_id);
  else if (media_type === 'series') removed = await libraryModel.removeSeries(userId, media_id);
  else if (media_type === 'game') removed = await libraryModel.removeGame(userId, media_id);

  if (!removed) {
    throw new AppError('Item not found in library', 404, 'NOT_FOUND');
  }

  await activityModel.logActivity(userId, `removed_${media_type}`, media_type, media_id);

  res.status(200).json({
    success: true,
    data: { message: 'Removed successfully' }
  });
});

const getLibrary = asyncHandler(async (req, res) => {
  const { type, status, page = 1 } = req.query;
  const userId = req.user.id;
  let result = { items: [], total: 0, page: 1, hasMore: false };

  if (type === 'movies') result = await libraryModel.getUserMovies(userId, status, parseInt(page));
  else if (type === 'series') result = await libraryModel.getUserSeries(userId, status, parseInt(page));
  else if (type === 'games') result = await libraryModel.getUserGames(userId, status, parseInt(page));
  else throw new AppError('type must be movies, series, or games', 400, 'VALIDATION_ERROR');

  const hydratedItems = await Promise.all(result.items.map(item => hydrateItem(item, type)));

  res.status(200).json({
    success: true,
    data: { ...result, items: hydratedItems }
  });
});

const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const favorites = await libraryModel.getFavorites(userId);

  const hydratedFavorites = await Promise.all(
    favorites.map(item => hydrateItem(item, item.media_type))
  );

  res.status(200).json({
    success: true,
    data: hydratedFavorites
  });
});

module.exports = {
  addToLibrary,
  updateLibrary,
  removeFromLibrary,
  getLibrary,
  getFavorites
};
