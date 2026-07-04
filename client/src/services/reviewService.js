import api from './api';

const reviewService = {
  getReviews: async () => {
    const response = await api.get('/api/reviews');
    return response.data.data;
  },

  getMediaReviews: async (mediaType, mediaId) => {
    const response = await api.get(`/api/reviews/${mediaType}/${mediaId}`);
    return response.data.data;
  },
  
  // Updating/deleting a review actually just calls the library endpoint
  // since reviews are stored directly on the tracked items.
  updateReview: async (mediaType, mediaId, rating, reviewText) => {
    const response = await api.put('/api/library/update', {
      media_type: mediaType,
      media_id: mediaId,
      rating,
      review: reviewText
    });
    return response.data.data;
  },
  
  deleteReview: async (mediaType, mediaId) => {
    // Overwrite with null to "delete" the review
    const response = await api.put('/api/library/update', {
      media_type: mediaType,
      media_id: mediaId,
      rating: null,
      review: null
    });
    return response.data.data;
  }
};

export default reviewService;
