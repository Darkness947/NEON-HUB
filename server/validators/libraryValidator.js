const { body } = require('express-validator');

const baseValidation = [
  body('media_type')
    .isIn(['movie', 'series', 'game'])
    .withMessage('Media type must be movie, series, or game'),
  body('media_id')
    .isInt({ min: 1 })
    .withMessage('Media ID must be a positive integer'),
  body('rating')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('hours_played')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hours played must be a positive number'),
  body('episodes_watched')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Episodes watched must be a positive integer')
];

const statusValidation = body('status')
  .custom((value, { req }) => {
    const type = req.body.media_type;
    const movieSeriesStatus = ['watching', 'completed', 'planned', 'paused', 'dropped'];
    const gameStatus = ['playing', 'completed', 'backlog', 'paused', 'dropped'];
    
    if ((type === 'movie' || type === 'series') && !movieSeriesStatus.includes(value)) {
      throw new Error('Invalid status for movie/series');
    }
    if (type === 'game' && !gameStatus.includes(value)) {
      throw new Error('Invalid status for game');
    }
    return true;
  });

const validateLibraryAdd = [
  ...baseValidation,
  statusValidation
];

const validateLibraryUpdate = [
  ...baseValidation,
  statusValidation.optional()
];

module.exports = {
  validateLibraryAdd,
  validateLibraryUpdate
};
