const asyncHandler = require('../utils/asyncHandler');
const reviewModel = require('../models/reviewModel');
const hydrateItem = require('../utils/hydrateItem');

const getReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reviews = await reviewModel.getUserReviews(userId);

  // Hydrate all items to get title/poster
  const hydratedReviews = await Promise.all(
    reviews.map(item => hydrateItem(item, item.media_type))
  );

  res.status(200).json({
    success: true,
    data: hydratedReviews
  });
});

const getMediaReviews = asyncHandler(async (req, res) => {
  const { mediaType, mediaId } = req.params;
  
  if (!['movie', 'series', 'game'].includes(mediaType)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid media type' } });
  }

  const reviews = await reviewModel.getMediaReviews(mediaType, mediaId);

  res.status(200).json({
    success: true,
    data: reviews
  });
});

module.exports = {
  getReviews,
  getMediaReviews
};
