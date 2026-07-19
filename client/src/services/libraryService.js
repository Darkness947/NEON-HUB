import api from './api';

const libraryService = {
  getLibrary: async (type = 'movies', status = '', page = 1) => {
    const { data } = await api.get('/api/library', {
      params: { type, status, page }
    });
    return data.data;
  },

  getLibraryIds: async () => {
    const { data } = await api.get('/api/library/ids');
    return data.data;
  },
  
  getFavorites: async () => {
    const { data } = await api.get('/api/library/favorites');
    return data.data;
  },
  
  addToLibrary: async (mediaType, mediaId, status = 'planned') => {
    const { data } = await api.post('/api/library/add', {
      media_type: mediaType,
      media_id: mediaId,
      status
    });
    return data.data;
  },
  
  updateLibraryItem: async (mediaType, mediaId, fields) => {
    const { data } = await api.put('/api/library/update', {
      media_type: mediaType,
      media_id: mediaId,
      ...fields
    });
    return data.data;
  },
  
  removeFromLibrary: async (mediaType, mediaId) => {
    const { data } = await api.delete('/api/library/remove', {
      data: { media_type: mediaType, media_id: mediaId }
    });
    return data.data;
  },

  // Ratings
  getRatings: async () => {
    const { data } = await api.get('/api/library/ratings');
    return data.data;
  },

  // Episodes
  trackEpisode: async (tmdbId, seasonNumber, episodeNumber, status = 'watched') => {
    const { data } = await api.post('/api/library/episode', {
      tmdb_id: tmdbId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      status
    });
    return data.data;
  },

  updateEpisode: async (tmdbId, seasonNumber, episodeNumber, fields) => {
    const { data } = await api.put('/api/library/episode', {
      tmdb_id: tmdbId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      ...fields
    });
    return data.data;
  },

  removeEpisode: async (tmdbId, seasonNumber, episodeNumber) => {
    const { data } = await api.delete('/api/library/episode', {
      data: {
        tmdb_id: tmdbId,
        season_number: seasonNumber,
        episode_number: episodeNumber
      }
    });
    return data.data;
  },

  getSeriesEpisodes: async (tmdbId) => {
    const { data } = await api.get(`/api/library/series/${tmdbId}/episodes`);
    return data.data;
  }
};

export default libraryService;
