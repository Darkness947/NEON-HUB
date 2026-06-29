const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401, 'NO_TOKEN');
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
});

module.exports = authMiddleware;
