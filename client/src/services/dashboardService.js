import api from './api';

const dashboardService = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data.data;
  },

  getActivity: async () => {
    const response = await api.get('/api/dashboard/activity');
    return response.data.data;
  },

  getGenres: async () => {
    const response = await api.get('/api/dashboard/genres');
    return response.data.data;
  },

  getInsights: async () => {
    const response = await api.get('/api/dashboard/insights');
    return response.data.data;
  },
};

export default dashboardService;
