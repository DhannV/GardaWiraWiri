'use strict';

const { Router } = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  registerValidators,
  loginValidators,
  changePasswordValidators,
} = require('./auth.validation');

// =============================================================================
// AUTH ROUTES
//
// Base path: /api/v1/auth  (di-mount di src/app.js)
//
// Public routes  : register, login
// Protected routes: me, change-password  (butuh JWT via authenticate middleware)
//
// Urutan middleware per route:
//   validator array → validate → [authenticate] → controller
//
// express-validator bekerja secara sequential dalam array —
// urutan di dalam array registerValidators tidak berpengaruh,
// tapi validate HARUS setelah array validator.
// =============================================================================

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// Tidak membutuhkan token, siapapun bisa akses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Daftarkan user baru (client atau freelancer).
 * Admin dibuat via seeder atau langsung di DB.
 */
router.post(
  '/register',
  registerValidators,   // 1. Jalankan semua rule validasi
  validate,             // 2. Cek hasil — jika ada error, stop & return 422
  authController.register, // 3. Masuk controller
);

/**
 * POST /api/v1/auth/login
 * Login dan dapatkan access token + refresh token.
 */
router.post(
  '/login',
  loginValidators,
  validate,
  authController.login,
);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES
// Membutuhkan header: Authorization: Bearer <accessToken>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Ambil data user yang sedang login beserta profilnya.
 * Tidak perlu body — user ID diambil dari JWT payload di req.user.
 */
router.get(
  '/me',
  authenticate,          // Verifikasi JWT, inject req.user
  authController.getMe,
);

/**
 * PATCH /api/v1/auth/change-password
 * Ganti password. Membutuhkan currentPassword sebagai verifikasi eksplisit.
 */
router.patch(
  '/change-password',
  authenticate,
  changePasswordValidators,
  validate,
  authController.changePassword,
);

module.exports = router;
