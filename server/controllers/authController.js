const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const userModel = require('../models/userModel');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const issueAccessToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h', algorithm: 'HS256' }
  );

const issueRefreshToken = async (userId, res, absoluteExpiresAt = null) => {
  // Generate the secret part (random 32 bytes)
  const secret = crypto.randomBytes(32).toString('hex');

  // Hash the secret before storing in DB
  const secretHash = await bcrypt.hash(secret, 10);

  // Rolling expiry: 7 days of inactivity
  const rollingDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 7;
  const expiresAt = new Date(Date.now() + rollingDays * 24 * 60 * 60 * 1000);

  // Absolute expiry: 30 days from login (set once, never extended)
  const absoluteDays = parseInt(process.env.ABSOLUTE_SESSION_DAYS) || 30;
  const absExpiry = absoluteExpiresAt || new Date(Date.now() + absoluteDays * 24 * 60 * 60 * 1000);

  // Store in DB — returns the row including UUID id (the selector)
  const row = await userModel.createRefreshToken(userId, secretHash, expiresAt, absExpiry);

  // Cookie value = selector.secret
  const cookieValue = `${row.id}.${secret}`;

  // Robust check for production / cross-site environments
  const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod' || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

  res.cookie('refreshToken', cookieValue, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: rollingDays * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const _formatUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar_url: user.avatar_url,
  bio: user.bio,
  created_at: user.created_at,
});

// ─── Register ─────────────────────────────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new AppError(first.msg, 400, 'VALIDATION_ERROR');
  }

  const { username, email, password } = req.body;

  // Check for existing user
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  // Hash password with 12 rounds
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await userModel.createUser(username, email, hashedPassword);

  res.status(201).json({
    success: true,
    data: {
      message: 'Account created successfully',
      user: _formatUser(user),
    },
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new AppError(first.msg, 400, 'VALIDATION_ERROR');
  }

  const { email, password } = req.body;

  // Find user (includes password hash for comparison)
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Issue tokens
  const accessToken = issueAccessToken(user.id);
  await issueRefreshToken(user.id, res);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: _formatUser(user),
    },
  });
});

// ─── Refresh Token ────────────────────────────────────────────────────────────

const refresh = asyncHandler(async (req, res) => {
  const cookieValue = req.cookies?.refreshToken;

  if (!cookieValue) {
    throw new AppError('No refresh token provided', 401, 'NO_REFRESH_TOKEN');
  }

  // Parse selector.secret from cookie
  const dotIndex = cookieValue.indexOf('.');
  if (dotIndex === -1) {
    throw new AppError('Invalid refresh token format', 401, 'INVALID_REFRESH_TOKEN');
  }

  const selector = cookieValue.substring(0, dotIndex);
  const secret = cookieValue.substring(dotIndex + 1);

  // O(1) lookup by selector (UUID primary key)
  const tokenRow = await userModel.findRefreshTokenById(selector);

  if (!tokenRow) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Check rolling expiry (7 days of inactivity)
  if (new Date(tokenRow.expires_at) < new Date()) {
    await userModel.deleteRefreshToken(tokenRow.id);
    throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
  }

  // Check absolute expiry (30 days since login — never extends)
  if (new Date(tokenRow.absolute_expires_at) < new Date()) {
    await userModel.deleteRefreshToken(tokenRow.id);
    throw new AppError('Session expired — please log in again', 401, 'ABSOLUTE_SESSION_EXPIRED');
  }

  // Check grace period: if token was already rotated, only accept within 30s window
  if (tokenRow.rotated_at) {
    const rotatedTime = new Date(tokenRow.rotated_at).getTime();
    const gracePeriodMs = 30 * 1000; // 30 seconds
    if (Date.now() - rotatedTime > gracePeriodMs) {
      // Grace period expired — this is a stale or replayed token
      await userModel.deleteRefreshToken(tokenRow.id);
      throw new AppError('Refresh token already used', 401, 'REFRESH_TOKEN_REUSED');
    }
    // Within grace period — allow it but don't rotate again
  }

  // Single bcrypt comparison: verify the secret
  const isValid = await bcrypt.compare(secret, tokenRow.secret_hash);
  if (!isValid) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Get user
  const user = await userModel.findUserById(tokenRow.user_id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Rotate: mark old token as rotated (grace period) instead of deleting
  if (!tokenRow.rotated_at) {
    await userModel.markRefreshTokenRotated(tokenRow.id);
  }

  // Issue new tokens — carry over the original absolute_expires_at
  const accessToken = issueAccessToken(user.id);
  await issueRefreshToken(user.id, res, tokenRow.absolute_expires_at);

  // Cleanup stale tokens in the background (fire-and-forget)
  userModel.cleanupStaleTokens().catch(() => {});

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: _formatUser(user),
    },
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

const logout = asyncHandler(async (req, res) => {
  const cookieValue = req.cookies?.refreshToken;

  if (cookieValue) {
    // Parse selector from cookie and delete directly — no bcrypt needed
    const dotIndex = cookieValue.indexOf('.');
    if (dotIndex !== -1) {
      const selector = cookieValue.substring(0, dotIndex);
      await userModel.deleteRefreshToken(selector);
    }
  }

  const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod' || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

  // Clear the cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

// ─── Get Profile ──────────────────────────────────────────────────────────────

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findUserById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: { user: _formatUser(user) },
  });
});

// ─── Change Password ──────────────────────────────────────────────────────────

const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new AppError(first.msg, 400, 'VALIDATION_ERROR');
  }

  const { oldPassword, newPassword } = req.body;

  // Get user with password hash
  const user = await userModel.findUserByEmail(
    (await userModel.findUserById(req.user.id)).email
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS');
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await userModel.updatePassword(req.user.id, hashedPassword);

  // Invalidate all refresh tokens (force re-login on other devices)
  await userModel.deleteAllRefreshTokensForUser(req.user.id);

  res.status(200).json({
    success: true,
    data: { message: 'Password changed successfully' },
  });
});

// ─── Forgot Password ────────────────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400, 'VALIDATION_ERROR');

  const user = await userModel.findUserByEmail(email);
  if (!user) {
    // Return 200 even if user not found to prevent email enumeration
    return res.status(200).json({ success: true, data: { message: 'If that email is registered, a reset link was sent.' } });
  }

  // Create a JWT valid for 15 minutes, signed with user's old password hash so it's invalidated upon use
  const resetSecret = process.env.JWT_SECRET + user.password;
  const resetToken = jwt.sign({ userId: user.id }, resetSecret, { expiresIn: '15m' });

  const { sendPasswordResetEmail } = require('../services/emailService');
  try {
    await sendPasswordResetEmail(user.email, `${user.id}-${resetToken}`);
  } catch (error) {
    console.error('Failed to send reset email', error);
    throw new AppError('Failed to send reset email. Try again later.', 500);
  }

  res.status(200).json({ success: true, data: { message: 'If that email is registered, a reset link was sent.' } });
});

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) throw new AppError('Token and new password required', 400, 'VALIDATION_ERROR');

  const [userIdStr, ...jwtParts] = token.split('-');
  const resetJwt = jwtParts.join('-');
  const userId = parseInt(userIdStr, 10);

  const user = await userModel.findUserById(userId);
  if (!user) throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  
  // We need the password hash to verify the token
  const userWithPass = await userModel.findUserByEmail(user.email);
  const resetSecret = process.env.JWT_SECRET + userWithPass.password;

  try {
    jwt.verify(resetJwt, resetSecret);
  } catch (err) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await userModel.updatePassword(user.id, hashedPassword);
  await userModel.deleteAllRefreshTokensForUser(user.id);

  res.status(200).json({ success: true, data: { message: 'Password has been reset successfully' } });
});

// ─── Upload Avatar ────────────────────────────────────────────────────────────

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No image file provided', 400, 'VALIDATION_ERROR');
  }

  // req.file.path contains the Cloudinary secure_url
  let avatarUrl = req.file.path;
  
  // Inject transformation string for auto-resizing
  // Cloudinary URLs look like: https://res.cloudinary.com/cloud_name/image/upload/v1234567/avatars/user-1.jpg
  const uploadIndex = avatarUrl.indexOf('/upload/') + 8;
  avatarUrl = avatarUrl.substring(0, uploadIndex) + 'c_fill,g_face,h_200,w_200/' + avatarUrl.substring(uploadIndex);

  const updatedUser = await userModel.updateAvatar(req.user.id, avatarUrl);

  res.status(200).json({
    success: true,
    data: { user: _formatUser(updatedUser) },
  });
});

// ─── Update Bio ───────────────────────────────────────────────────────────────

const updateBio = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new AppError(first.msg, 400, 'VALIDATION_ERROR');
  }

  const { bio } = req.body;
  const updatedUser = await userModel.updateBio(req.user.id, bio);

  res.status(200).json({
    success: true,
    data: { user: _formatUser(updatedUser) },
  });
});

// ─── Delete Account ───────────────────────────────────────────────────────────

const deleteAccount = asyncHandler(async (req, res) => {
  await userModel.deleteUser(req.user.id);

  const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod' || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });

  res.status(200).json({ success: true, data: { message: 'Account deleted successfully' } });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  updateBio,
  deleteAccount,
};
