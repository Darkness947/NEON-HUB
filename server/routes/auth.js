const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginLimiter, loginValidator, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/password', authMiddleware, changePasswordValidator, authController.changePassword);

module.exports = router;
