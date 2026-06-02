'use strict';

const { body, param, query } = require('express-validator');

// =============================================================================
// BIDS VALIDATION
// =============================================================================

/** UUID param validator yang bisa di-reuse */
const bidIdParam = [
  param('id').isUUID(4).withMessage('ID bid tidak valid.'),
];

const projectIdParam = [
  param('projectId').isUUID(4).withMessage('ID project tidak valid.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /bids — Freelancer ajukan bid
// ─────────────────────────────────────────────────────────────────────────────

const createBidValidators = [
  body('projectId')
    .notEmpty().withMessage('projectId wajib diisi.')
    .isUUID(4).withMessage('projectId tidak valid.'),

  body('proposedPrice')
    .notEmpty().withMessage('Harga penawaran wajib diisi.')
    .isFloat({ min: 1000 })
    .withMessage('Harga penawaran minimal Rp1.000.')
    .toFloat(),

  body('coverLetter')
    .trim()
    .notEmpty().withMessage('Cover letter wajib diisi.')
    .isLength({ min: 30, max: 2000 })
    .withMessage('Cover letter harus antara 30–2.000 karakter.'),

  body('estimatedDays')
    .notEmpty().withMessage('Estimasi hari pengerjaan wajib diisi.')
    .isInt({ min: 1, max: 365 })
    .withMessage('Estimasi hari harus antara 1–365 hari.')
    .toInt(),
];

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /bids/:id/reject — Tambahkan alasan penolakan (opsional)
// ─────────────────────────────────────────────────────────────────────────────

const rejectBidValidators = [
  ...bidIdParam,

  body('rejectionNote')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Catatan penolakan maksimal 500 karakter.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /bids/my-bids — Query untuk list bid milik freelancer
// ─────────────────────────────────────────────────────────────────────────────

const myBidsQueryValidators = [
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('status tidak valid.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page harus >= 1.').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit harus 1–50.').toInt(),
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /bids/project/:projectId — Query untuk list bid per project
// ─────────────────────────────────────────────────────────────────────────────

const projectBidsQueryValidators = [
  ...projectIdParam,

  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('status tidak valid.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page harus >= 1.').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit harus 1–50.').toInt(),

  query('sortBy')
    .optional()
    .isIn(['proposedPrice', 'estimatedDays', 'createdAt'])
    .withMessage('sortBy tidak valid.'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder harus "asc" atau "desc".'),
];

module.exports = {
  bidIdParam,
  projectIdParam,
  createBidValidators,
  rejectBidValidators,
  myBidsQueryValidators,
  projectBidsQueryValidators,
};
