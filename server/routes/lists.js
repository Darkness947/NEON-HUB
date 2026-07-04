const express = require('express');
const router = express.Router();
const listsController = require('../controllers/listsController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.use(authMiddleware);

// Validation
const listValidation = [
  body('name').trim().notEmpty().withMessage('List name is required').isLength({ max: 100 }).withMessage('List name must be under 100 characters')
];

// Routes
router.get('/', listsController.getLists);
router.post('/', listValidation, listsController.createList);

router.get('/:id', listsController.getList);
router.put('/:id', listValidation, listsController.updateList);
router.delete('/:id', listsController.deleteList);

router.post('/:id/items', listsController.addListItem);
router.delete('/:id/items', listsController.removeListItem); // body: media_type, media_id

module.exports = router;
