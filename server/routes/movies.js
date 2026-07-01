const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');

router.get('/trending', moviesController.getTrending);
router.get('/popular', moviesController.getPopular);
router.get('/upcoming', moviesController.getUpcoming);
router.get('/search', moviesController.search);
router.get('/:id', moviesController.getById);

module.exports = router;
