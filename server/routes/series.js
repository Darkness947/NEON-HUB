const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');

router.get('/trending', seriesController.getTrending);
router.get('/popular', seriesController.getPopular);
router.get('/search', seriesController.search);
router.get('/:id', seriesController.getById);
router.get('/:id/season/:n', seriesController.getSeason);

module.exports = router;
