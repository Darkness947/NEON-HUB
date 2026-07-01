const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');

// GET /api/games/trending
router.get('/trending', gamesController.getTrendingGames);

// GET /api/games/search
router.get('/search', gamesController.searchGames);

// GET /api/games/:id
router.get('/:id', gamesController.getGameById);

module.exports = router;
