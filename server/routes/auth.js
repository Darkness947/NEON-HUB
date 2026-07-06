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

const upload = require('../middleware/cloudinaryMiddleware');

// Public routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginLimiter, loginValidator, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/password', authMiddleware, changePasswordValidator, authController.changePassword);
router.post('/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
