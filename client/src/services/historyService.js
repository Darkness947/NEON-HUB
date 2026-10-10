import api from './api';

const historyService = {
  recordVisit: async (mediaType, mediaId) => {
    try {
      const response = await api.post('/api/history/visit', { media_type: mediaType, media_id: mediaId });
      return response.data.data;
    } catch (error) {
      console.error('Failed to record visit:', error);
      return null;
    }
  },

  getHistory: async () => {
    const response = await api.get('/api/history');
    return response.data.data;
  },

  removeHistory: async (ids) => {
    const response = await api.delete('/api/history', { data: { ids } });
    return response.data.data;
  }
};

export default historyService;
