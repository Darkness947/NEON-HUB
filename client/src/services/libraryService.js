import api from './api';

const libraryService = {
  getLibrary: async (type = 'movies', status = '', page = 1) => {
    const { data } = await api.get('/api/library', {
      params: { type, status, page }
    });
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
  }
};

export default libraryService;
