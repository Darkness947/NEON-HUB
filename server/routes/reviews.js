const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', reviewsController.getReviews);
router.get('/:mediaType/:mediaId', reviewsController.getMediaReviews);

module.exports = router;
