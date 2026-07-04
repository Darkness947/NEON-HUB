import api from './api';

const listService = {
  getLists: async () => {
    const response = await api.get('/api/lists');
    return response.data.data;
  },

  createList: async (name, description) => {
    const response = await api.post('/api/lists', { name, description });
    return response.data.data;
  },

  getList: async (id) => {
    const response = await api.get(`/api/lists/${id}`);
    return response.data.data;
  },

  updateList: async (id, fields) => {
    const response = await api.put(`/api/lists/${id}`, fields);
    return response.data.data;
  },

  deleteList: async (id) => {
    const response = await api.delete(`/api/lists/${id}`);
    return response.data.data;
  },

  addListItem: async (listId, mediaType, mediaId) => {
    const response = await api.post(`/api/lists/${listId}/items`, {
      media_type: mediaType,
      media_id: mediaId
    });
    return response.data.data;
  },

  removeListItem: async (listId, mediaType, mediaId) => {
    const response = await api.delete(`/api/lists/${listId}/items`, {
      data: {
        media_type: mediaType,
        media_id: mediaId
      }
    });
    return response.data.data;
  }
};

export default listService;
