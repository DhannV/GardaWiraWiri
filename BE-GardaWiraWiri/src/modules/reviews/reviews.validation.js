'use strict';

const { body, param, query } = require('express-validator');

// =============================================================================
// REVIEWS VALIDATION
// =============================================================================

const reviewIdParam = [
  param('id').isUUID(4).withMessage('ID review tidak valid.'),
];

const freelancerIdParam = [
  param('id').isUUID(4).withMessage('ID freelancer tidak valid.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /reviews — Client membuat review setelah contract completed
// ─────────────────────────────────────────────────────────────────────────────

const createReviewValidators = [
  body('contractId')
    .notEmpty()
    .withMessage('contractId wajib diisi.')
    .isUUID(4)
    .withMessage('contractId tidak valid.'),

  body('rating')
    .notEmpty()
    .withMessage('Rating wajib diisi.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating harus bilangan bulat antara 1–5.')
    .toInt(),

  body('comment')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Komentar harus antara 10–1.000 karakter.'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic harus boolean.')
    .toBoolean(),
];

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /reviews/:id — Client update review miliknya
// ─────────────────────────────────────────────────────────────────────────────

const updateReviewValidators = [
  ...reviewIdParam,

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating harus bilangan bulat antara 1–5.')
    .toInt(),

  body('comment')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Komentar harus antara 10–1.000 karakter.'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic harus boolean.')
    .toBoolean(),
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /reviews/freelancer/:id — List review milik freelancer
// ─────────────────────────────────────────────────────────────────────────────

const listReviewsValidators = [
  ...freelancerIdParam,

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page harus >= 1.').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit harus 1–50.').toInt(),

  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('minRating harus 1–5.').toInt(),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('sortOrder harus "asc" atau "desc".'),
];

module.exports = {
  reviewIdParam,
  createReviewValidators,
  updateReviewValidators,
  listReviewsValidators,
};
