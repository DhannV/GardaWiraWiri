'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/response');

/**
 * Middleware autentikasi JWT.
 *
 * Mengekstrak token dari header Authorization: Bearer <token>,
 * memverifikasinya, dan menyimpan payload di req.user.
 *
 * Jika token tidak ada atau tidak valid → 401 Unauthorized.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Access token tidak ditemukan. Silakan login terlebih dahulu.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);

    // Simpan payload ke req.user agar bisa diakses di controller
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token telah kedaluwarsa. Silakan login ulang.');
    }
    return unauthorized(res, 'Token tidak valid.');
  }
}

module.exports = { authenticate };
