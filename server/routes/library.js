const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const libraryController = require('../controllers/libraryController');
const { validateLibraryAdd, validateLibraryUpdate } = require('../validators/libraryValidator');

router.use(authMiddleware);

router.post('/add', validateLibraryAdd, libraryController.addToLibrary);
router.put('/update', validateLibraryUpdate, libraryController.updateLibrary);
router.delete('/remove', libraryController.removeFromLibrary);
router.get('/', libraryController.getLibrary);
router.get('/favorites', libraryController.getFavorites);

// Episodes
router.post('/episode', libraryController.trackEpisode);
router.put('/episode', libraryController.updateEpisode);
router.delete('/episode', libraryController.deleteEpisode);
router.get('/series/:id/episodes', libraryController.getSeriesEpisodes);

// Ratings
router.get('/ratings', libraryController.getRatings);

// Lightweight IDs (no hydration, no pagination)
router.get('/ids', libraryController.getLibraryIds);

module.exports = router;
