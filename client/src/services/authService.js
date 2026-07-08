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

  uploadAvatar: async (formData) => {
    const { data } = await api.post('/api/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/api/auth/forgot-password', { email });
    return data.data;
  },

  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return data.data;
  },

  updateBio: async (bio) => {
    const { data } = await api.put('/api/auth/bio', { bio });
    return data.data;
  },

  deleteAccount: async () => {
    const { data } = await api.delete('/api/auth/account');
    return data.data;
  },
};

export default authService;
