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

const issueRefreshToken = async (userId, res) => {
  // Generate opaque token
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Hash before storing in DB
  const tokenHash = await bcrypt.hash(rawToken, 10);

  // Calculate expiry
  const expiresInDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 7;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  // Store hashed token in DB
  await userModel.createRefreshToken(userId, tokenHash, expiresAt);

  // Send raw token in httpOnly cookie
  res.cookie('refreshToken', rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: expiresInDays * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const _formatUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar_url: user.avatar_url,
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
  const rawToken = req.cookies?.refreshToken;

  if (!rawToken) {
    throw new AppError('No refresh token provided', 401, 'NO_REFRESH_TOKEN');
  }

  // We need to find which user this token belongs to by checking all non-expired tokens
  // Since we hash tokens, we can't do a direct DB lookup — we iterate and compare
  // This is intentional: hashed tokens prevent DB breach from exposing raw tokens
  const pool = require('../config/db');
  const { rows: allTokens } = await pool.query(
    'SELECT rt.id, rt.user_id, rt.token_hash, rt.expires_at FROM refresh_tokens rt WHERE rt.expires_at > NOW()'
  );

  let matchedToken = null;
  for (const tokenRow of allTokens) {
    const isMatch = await bcrypt.compare(rawToken, tokenRow.token_hash);
    if (isMatch) {
      matchedToken = tokenRow;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Get user
  const user = await userModel.findUserById(matchedToken.user_id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Delete the old token (rotation)
  await userModel.deleteRefreshToken(matchedToken.id);

  // Issue new tokens
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

// ─── Logout ───────────────────────────────────────────────────────────────────

const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;

  if (rawToken) {
    // Find and delete the matching token
    const pool = require('../config/db');
    const { rows: userTokens } = await pool.query(
      'SELECT id, token_hash FROM refresh_tokens WHERE user_id = $1',
      [req.user.id]
    );

    for (const tokenRow of userTokens) {
      const isMatch = await bcrypt.compare(rawToken, tokenRow.token_hash);
      if (isMatch) {
        await userModel.deleteRefreshToken(tokenRow.id);
        break;
      }
    }
  }

  // Clear the cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  changePassword,
};
