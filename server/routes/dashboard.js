const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getActivity);
router.get('/genres', dashboardController.getGenres);
router.get('/insights', dashboardController.getInsights);
router.get('/profile-summary', dashboardController.getProfileSummary);

module.exports = router;
