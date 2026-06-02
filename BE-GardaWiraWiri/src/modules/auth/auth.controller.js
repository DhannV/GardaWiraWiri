'use strict';

const authService = require('./auth.service');
const { created, ok, noContent } = require('../../utils/response');

// =============================================================================
// AUTH CONTROLLER
//
// Tanggung jawab controller:
//  1. Terima req, panggil service
//  2. Kirim response sesuai hasil
//  3. Teruskan error ke next() → ditangkap error.middleware.js
//
// Controller TIDAK boleh berisi logika bisnis — semua ada di service.
// Controller TIDAK boleh langsung query Prisma.
// =============================================================================

/**
 * POST /api/v1/auth/register
 *
 * Request body:
 *   { name, email, password, role, phone? }
 *
 * Response 201:
 *   { success, message, data: { user, accessToken, refreshToken } }
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;

    const result = await authService.register({ name, email, password, role, phone });

    return created(res, result, 'Registrasi berhasil. Selamat bergabung di Garda Wira Wiri!');
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/v1/auth/login
 *
 * Request body:
 *   { email, password }
 *
 * Response 200:
 *   { success, message, data: { user, accessToken, refreshToken } }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    return ok(res, result, 'Login berhasil.');
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/auth/me
 * Protected — membutuhkan JWT valid (authenticate middleware)
 *
 * Response 200:
 *   { success, message, data: { ...user, clientProfile | freelancerProfile } }
 */
async function getMe(req, res, next) {
  try {
    // req.user diisi oleh authenticate middleware dari JWT payload
    const user = await authService.getMe(req.user.id);

    return ok(res, user, 'Data profil berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/auth/change-password
 * Protected — membutuhkan JWT valid
 *
 * Request body:
 *   { currentPassword, newPassword, confirmPassword }
 *
 * Response 200:
 *   { success, message }
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, { currentPassword, newPassword });

    // Tidak kembalikan data — hanya konfirmasi sukses
    return ok(res, null, 'Password berhasil diubah. Silakan login ulang dengan password baru.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
