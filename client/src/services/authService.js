import api from './api';

const authService = {
  register: async (username, email, password) => {
    const { data } = await api.post('/api/auth/register', {
      username,
      email,
      password,
    });
    return data.data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', {
      email,
      password,
    });
    return data.data;
  },

  logout: async () => {
    const { data } = await api.post('/api/auth/logout');
    return data.data;
  },

  refreshToken: async () => {
    const { data } = await api.post('/api/auth/refresh');
    return data.data;
  },

  getProfile: async () => {
    const { data } = await api.get('/api/auth/profile');
    return data.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const { data } = await api.put('/api/auth/password', {
      oldPassword,
      newPassword,
    });
    return data.data;
  },
};

export default authService;
