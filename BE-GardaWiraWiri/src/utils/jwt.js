'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate access token (umur pendek, untuk autentikasi request)
 * @param {object} payload - Data yang disimpan dalam token
 * @returns {string}
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'garda-wira-wiri',
  });
}

/**
 * Generate refresh token (umur panjang, untuk perpanjang sesi)
 * @param {object} payload
 * @returns {string}
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'garda-wira-wiri',
  });
}

/**
 * Verifikasi access token
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'garda-wira-wiri',
  });
}

/**
 * Verifikasi refresh token
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'garda-wira-wiri',
  });
}

/**
 * Generate sepasang token sekaligus
 * @param {object} user - User object dari database
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokenPair(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ sub: user.id }),
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
