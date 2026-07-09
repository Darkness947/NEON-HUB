const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/recommendations/:mediaType', aiController.getRecommendations);
router.get('/compare/:mediaType/:mediaId1/:mediaId2', aiController.getComparison);

module.exports = router;
