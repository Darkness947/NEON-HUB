import api from './api';

const aiService = {
  getRecommendations: async (mediaType) => {
    const { data } = await api.get(`/api/ai/recommendations/${mediaType}`);
    return data.data;
  },
  
  getComparison: async (mediaType, mediaId1, mediaId2) => {
    const { data } = await api.get(`/api/ai/compare/${mediaType}/${mediaId1}/${mediaId2}`);
    return data.data;
  }
};

export default aiService;
