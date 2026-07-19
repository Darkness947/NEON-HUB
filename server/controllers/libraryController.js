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

// --- EPISODES ---
const trackEpisode = asyncHandler(async (req, res) => {
  const { tmdb_id, season_number, episode_number, status } = req.body;
  if (!tmdb_id || season_number === undefined || episode_number === undefined || !status) {
    throw new AppError('Missing required episode fields', 400, 'VALIDATION_ERROR');
  }

  const userId = req.user.id;
  let entry;
  try {
    entry = await libraryModel.addEpisode(userId, tmdb_id, season_number, episode_number, status);
  } catch (err) {
    if (err.code === '23505') throw new AppError('Episode already tracked', 409, 'DUPLICATE_ENTRY');
    throw err;
  }

  await activityModel.logActivity(userId, 'tracked_episode', 'episode', tmdb_id, { season_number, episode_number });

  const hydrated = await hydrateItem(entry, 'episode');
  res.status(201).json({ success: true, data: hydrated });
});

const updateEpisode = asyncHandler(async (req, res) => {
  const { tmdb_id, season_number, episode_number, ...fields } = req.body;
  const userId = req.user.id;

  let currentEntry = await libraryModel.getEpisodeEntry(userId, tmdb_id, season_number, episode_number);
  if (!currentEntry) {
    // Auto-track as watched if user tries to rate/review an untracked episode
    currentEntry = await libraryModel.addEpisode(userId, tmdb_id, season_number, episode_number, 'watched');
  }

  const updatedEntry = await libraryModel.updateEpisode(userId, tmdb_id, season_number, episode_number, fields);
  
  if (updatedEntry) {
    await activityModel.logActivity(userId, 'updated_episode', 'episode', tmdb_id, { season_number, episode_number, ...fields });
  }

  const hydrated = await hydrateItem(updatedEntry || currentEntry, 'episode');
  res.status(200).json({ success: true, data: hydrated });
});

const deleteEpisode = asyncHandler(async (req, res) => {
  const { tmdb_id, season_number, episode_number } = req.body;
  const userId = req.user.id;

  const removed = await libraryModel.removeEpisode(userId, tmdb_id, season_number, episode_number);
  if (!removed) throw new AppError('Episode not tracked', 404, 'NOT_FOUND');

  await activityModel.logActivity(userId, 'removed_episode', 'episode', tmdb_id, { season_number, episode_number });

  res.status(200).json({ success: true, data: { message: 'Episode removed' } });
});

const getSeriesEpisodes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const episodes = await libraryModel.getSeriesEpisodes(userId, id);
  res.status(200).json({ success: true, data: episodes });
});

// --- RATINGS ---
const getRatings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const ratings = await libraryModel.getUserRatings(userId);

  const hydratedRatings = await Promise.all(
    ratings.map(item => hydrateItem(item, item.media_type))
  );

  res.status(200).json({
    success: true,
    data: hydratedRatings
  });
});

// --- ALL IDS (lightweight) ---
const getLibraryIds = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const ids = await libraryModel.getAllUserIds(userId);

  res.status(200).json({
    success: true,
    data: ids
  });
});

module.exports = {
  addToLibrary,
  updateLibrary,
  removeFromLibrary,
  getLibrary,
  getFavorites,
  trackEpisode,
  updateEpisode,
  deleteEpisode,
  getSeriesEpisodes,
  getRatings,
  getLibraryIds
};
