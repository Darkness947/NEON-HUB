const tmdbService = require('../services/tmdbService');
const rawgService = require('../services/rawgService');
const { getGamesProvider } = require('../services/gamesProviderFactory');

const hydrateItem = async (item, type) => {
  let cleanedType = type;
  if (type === 'movies') cleanedType = 'movie';
  else if (type === 'games') cleanedType = 'game';

  try {
    let mediaData;
    const tId = item.tmdb_id || item.media_id;
    
    if (type === 'movies' || type === 'movie') {
      mediaData = await tmdbService.getMovieBasic(tId);
    } else if (type === 'series') {
      mediaData = await tmdbService.getSeriesBasic(tId);
    } else if (type === 'games' || type === 'game') {
      // Intelligent provider routing for games
      if (item.igdb_id) {
        const igdbService = require('../services/igdbService');
        mediaData = await igdbService.getGameBasic ? await igdbService.getGameBasic(item.igdb_id) : await igdbService.getGameById(item.igdb_id);
      } else if (item.rawg_id) {
        if (process.env.GAMES_PROVIDER === 'igdb') {
          throw new Error('RAWG API is disabled');
        }
        mediaData = await rawgService.getGameBasic(item.rawg_id);
      } else {
        // Fallback to active provider if we only have generic media_id
        const activeProvider = getGamesProvider();
        mediaData = await activeProvider.getGameBasic ? await activeProvider.getGameBasic(item.media_id) : await activeProvider.getGameById(item.media_id);
      }
    } else if (type === 'episode') {
      mediaData = await tmdbService.getEpisodeBasic(tId, item.season_number, item.episode_number);
    }
    
    const actualDbId = item.db_id || item.id;
    const { id, db_id, ...itemProps } = item;
    const finalId = tId || item.igdb_id || item.rawg_id || item.media_id;
    const hydrated = { ...mediaData, ...itemProps, db_id: actualDbId, id: finalId, media_type: cleanedType };
    if (cleanedType === 'game') hydrated.rawg_id = finalId;
    return hydrated;
  } catch (error) {
    // If external API fails, return the base item so UI doesn't crash completely
    console.error(`Hydration failed for ${type} ${item.tmdb_id || item.igdb_id || item.rawg_id || item.media_id}:`, error.message);
    const actualDbId = item.db_id || item.id;
    const { id, db_id, ...itemProps } = item;
    const finalId = item.tmdb_id || item.igdb_id || item.rawg_id || item.media_id;
    const hydrated = { ...itemProps, db_id: actualDbId, id: finalId, media_type: cleanedType };
    if (cleanedType === 'game') hydrated.rawg_id = finalId;
    return hydrated;
  }
};

module.exports = hydrateItem;
