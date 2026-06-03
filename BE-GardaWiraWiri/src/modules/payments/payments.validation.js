'use strict';

const { body, param, query } = require('express-validator');

// =============================================================================
// PAYMENTS VALIDATION
//
// Nilai enum disinkronkan dengan PaymentStatus dan PaymentMethod di schema.prisma.
// =============================================================================

const VALID_METHODS = ['bank_transfer', 'e_wallet', 'virtual_account', 'credit_card'];
const VALID_STATUSES = ['pending', 'paid', 'released', 'refunded', 'failed'];

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE
// ─────────────────────────────────────────────────────────────────────────────

const paymentIdParam = [
  param('id')
    .isUUID(4)
    .withMessage('ID payment tidak valid. Harus berupa UUID v4.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /payments/create — Client membuat payment record untuk contract
// ─────────────────────────────────────────────────────────────────────────────

const createPaymentValidators = [
  body('contractId')
    .notEmpty()
    .withMessage('contractId wajib diisi.')
    .isUUID(4)
    .withMessage('contractId tidak valid.'),

  body('method')
    .notEmpty()
    .withMessage('Metode pembayaran wajib dipilih.')
    .isIn(VALID_METHODS)
    .withMessage(`Metode tidak valid. Pilih salah satu: ${VALID_METHODS.join(', ')}.`),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Catatan pembayaran maksimal 500 karakter.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /payments/:id/paid — Konfirmasi pembayaran masuk (admin/system)
// ─────────────────────────────────────────────────────────────────────────────

const confirmPaidValidators = [
  ...paymentIdParam,

  body('externalRef')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('externalRef maksimal 255 karakter.')
    .matches(/^[a-zA-Z0-9\-_\/\.]+$/)
    .withMessage('externalRef hanya boleh mengandung huruf, angka, dan karakter - _ / .'),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Catatan maksimal 500 karakter.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /payments/:id/refund — Refund ke client (admin only)
// ─────────────────────────────────────────────────────────────────────────────

const refundPaymentValidators = [
  ...paymentIdParam,

  body('notes')
    .notEmpty()
    .withMessage('Alasan refund wajib diisi.')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Alasan refund harus antara 10–500 karakter.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /payments/history — Filter riwayat pembayaran
// ─────────────────────────────────────────────────────────────────────────────

const paymentHistoryValidators = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`status tidak valid. Pilih: ${VALID_STATUSES.join(', ')}.`),

  query('method')
    .optional()
    .isIn(VALID_METHODS)
    .withMessage(`method tidak valid. Pilih: ${VALID_METHODS.join(', ')}.`),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page harus bilangan bulat >= 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit harus bilangan bulat 1–50.')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'amount', 'paidAt'])
    .withMessage('sortBy tidak valid.'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder harus "asc" atau "desc".'),

  // Filter rentang tanggal
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom harus format ISO 8601 (contoh: 2025-01-01).')
    .toDate(),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo harus format ISO 8601 (contoh: 2025-12-31).')
    .toDate()
    .custom((dateTo, { req }) => {
      if (req.query.dateFrom && dateTo < new Date(req.query.dateFrom)) {
        throw new Error('dateTo tidak boleh lebih awal dari dateFrom.');
      }
      return true;
    }),
];

module.exports = {
  paymentIdParam,
  createPaymentValidators,
  confirmPaidValidators,
  refundPaymentValidators,
  paymentHistoryValidators,
  VALID_METHODS,
  VALID_STATUSES,
};
