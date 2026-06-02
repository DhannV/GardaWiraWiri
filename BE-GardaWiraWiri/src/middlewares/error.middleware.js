'use strict';

const env = require('../config/env');
const { errorResponse } = require('../utils/response');
const {
  isPrismaError,
  isNotFoundError,
  isUniqueConstraintError,
  isForeignKeyError,
  getUniqueConstraintField,
} = require('../config/prisma');

/**
 * Global Error Handler Middleware.
 *
 * Tangkap semua error yang di-pass via next(error) dari controller/service.
 * Harus didaftarkan PALING TERAKHIR di app.js setelah semua route.
 */
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}`);
  if (env.isDevelopment) console.error(err);

  // ---- Prisma errors — gunakan helpers dari config/prisma.js ----

  if (isNotFoundError(err)) {
    return errorResponse(res, { statusCode: 404, message: 'Data tidak ditemukan.' });
  }

  if (isUniqueConstraintError(err)) {
    const field = getUniqueConstraintField(err);
    return errorResponse(res, {
      statusCode: 409,
      message: `Data dengan ${field} tersebut sudah terdaftar.`,
    });
  }

  if (isForeignKeyError(err)) {
    return errorResponse(res, { statusCode: 400, message: 'Referensi data tidak valid.' });
  }

  if (isPrismaError(err)) {
    console.error(`[Prisma] Code: ${err.code}`, err.meta);
    return errorResponse(res, { statusCode: 400, message: 'Operasi database gagal.' });
  }

  // ---- JWT errors ----
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, { statusCode: 401, message: 'Token tidak valid.' });
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, { statusCode: 401, message: 'Token telah kedaluwarsa.' });
  }

  // ---- HTTP errors dengan statusCode eksplisit ----
  if (err.statusCode) {
    return errorResponse(res, { statusCode: err.statusCode, message: err.message });
  }

  // ---- Default 500 ----
  return errorResponse(res, {
    statusCode: 500,
    message: env.isProduction
      ? 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
      : err.message || 'Internal Server Error',
  });
}

/**
 * Handler untuk route yang tidak ditemukan (404).
 * Daftarkan SEBELUM errorHandler, SETELAH semua route.
 */
function notFoundHandler(req, res) {
  return errorResponse(res, {
    statusCode: 404,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
}

module.exports = { errorHandler, notFoundHandler };
