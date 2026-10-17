const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/visit', historyController.recordVisit);
router.get('/count', historyController.getHistoryCount);
router.get('/', historyController.getHistory);
router.delete('/', historyController.removeHistory);

module.exports = router;
