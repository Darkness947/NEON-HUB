import api from './api';

const mediaService = {
  // ─── Movies ────────────────────────────────────────────────────────────────
  fetchTrendingMovies: async () => {
    const { data } = await api.get('/api/movies/trending');
    return data.data;
  },
  
  fetchPopularMovies: async (page = 1) => {
    const { data } = await api.get('/api/movies/popular', { params: { page } });
    return data.data;
  },
  
  fetchUpcomingMovies: async (page = 1) => {
    const { data } = await api.get('/api/movies/upcoming', { params: { page } });
    return data.data;
  },
  
  searchMovies: async (query, page = 1) => {
    const { data } = await api.get('/api/movies/search', { params: { q: query, page } });
    return data.data;
  },
  
  getMovieById: async (id) => {
    const { data } = await api.get(`/api/movies/${id}`);
    return data.data;
  },

  // ─── Series ────────────────────────────────────────────────────────────────
  fetchTrendingSeries: async () => {
    const { data } = await api.get('/api/series/trending');
    return data.data;
  },

  fetchPopularSeries: async (page = 1) => {
    const { data } = await api.get('/api/series/popular', { params: { page } });
    return data.data;
  },

  searchSeries: async (query, page = 1) => {
    const { data } = await api.get('/api/series/search', { params: { q: query, page } });
    return data.data;
  },

  getSeriesById: async (id) => {
    const { data } = await api.get(`/api/series/${id}`);
    return data.data;
  },

  getSeriesSeason: async (id, seasonNumber) => {
    const { data } = await api.get(`/api/series/${id}/season/${seasonNumber}`);
    return data.data;
  },

  // ─── Games ────────────────────────────────────────────────────────────────
  fetchTrendingGames: async (page = 1) => {
    const { data } = await api.get('/api/games/trending', { params: { page } });
    return data.data;
  },

  searchGames: async (query, page = 1) => {
    const { data } = await api.get('/api/games/search', { params: { q: query, page } });
    return data.data;
  },

  getGameById: async (id) => {
    const { data } = await api.get(`/api/games/${id}`);
    return data.data;
  },
};

export default mediaService;
