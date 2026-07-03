const tmdbService = require('../services/tmdbService');
const rawgService = require('../services/rawgService');

const hydrateItem = async (item, type) => {
  let cleanedType = type;
  if (type === 'movies') cleanedType = 'movie';
  else if (type === 'games') cleanedType = 'game';

  try {
    let mediaData;
    const tId = item.tmdb_id || item.media_id;
    const rId = item.rawg_id || item.media_id;
    
    if (type === 'movies' || type === 'movie') {
      mediaData = await tmdbService.getMovieBasic(tId);
    } else if (type === 'series') {
      mediaData = await tmdbService.getSeriesBasic(tId);
    } else if (type === 'games' || type === 'game') {
      mediaData = await rawgService.getGameBasic(rId);
    }
    
    const { id: dbId, ...itemProps } = item;
    return { ...mediaData, ...itemProps, db_id: dbId, id: tId || rId, media_type: cleanedType };
  } catch (error) {
    // If external API fails, return the base item so UI doesn't crash completely
    console.error(`Hydration failed for ${type} ${item.tmdb_id || item.rawg_id || item.media_id}:`, error.message);
    const { id: dbId, ...itemProps } = item;
    return { ...itemProps, db_id: dbId, id: item.tmdb_id || item.rawg_id || item.media_id, media_type: cleanedType };
  }
};

module.exports = hydrateItem;
