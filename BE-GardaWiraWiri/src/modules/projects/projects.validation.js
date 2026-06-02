'use strict';

const { body, query, param } = require('express-validator');

// =============================================================================
// PROJECTS VALIDATION
// Nilai enum disinkronkan dengan schema.prisma — update keduanya bersamaan
// jika ada perubahan kategori atau status.
// =============================================================================

const VALID_CATEGORIES = [
  'antar_jemput', 'belanja', 'pindahan', 'kebersihan',
  'perbaikan', 'titip_antrian', 'administrasi', 'lainnya',
];

const VALID_STATUSES = ['open', 'in_progress', 'completed', 'cancelled', 'closed'];

const VALID_SORT_FIELDS = ['createdAt', 'budgetMin', 'budgetMax', 'deadline', 'viewCount'];

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE PARAM VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────

const projectIdParam = [
  param('id')
    .isUUID(4)
    .withMessage('ID project tidak valid. Harus berupa UUID v4.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE BUDGET CROSS-VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validasi silang: budgetMax tidak boleh < budgetMin.
 * Dipakai di create dan update validator.
 */
const budgetMaxCrossValidation = body('budgetMax')
  .custom((budgetMax, { req }) => {
    const min = parseFloat(req.body.budgetMin);
    if (!isNaN(min) && !isNaN(budgetMax) && budgetMax < min) {
      throw new Error('Budget maksimum tidak boleh lebih kecil dari budget minimum.');
    }
    return true;
  });

// ─────────────────────────────────────────────────────────────────────────────
// POST /projects — Buat project baru
// ─────────────────────────────────────────────────────────────────────────────

const createProjectValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Judul project wajib diisi.')
    .isLength({ min: 5, max: 200 })
    .withMessage('Judul project harus antara 5–200 karakter.'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Deskripsi project wajib diisi.')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Deskripsi project harus antara 20–5.000 karakter.'),

  body('category')
    .notEmpty()
    .withMessage('Kategori project wajib diisi.')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Kategori tidak valid. Pilih salah satu: ${VALID_CATEGORIES.join(', ')}.`),

  body('budgetMin')
    .notEmpty()
    .withMessage('Budget minimum wajib diisi.')
    .isFloat({ min: 0 })
    .withMessage('Budget minimum harus angka positif.')
    .toFloat(),

  body('budgetMax')
    .notEmpty()
    .withMessage('Budget maksimum wajib diisi.')
    .isFloat({ min: 0 })
    .withMessage('Budget maksimum harus angka positif.')
    .toFloat(),

  budgetMaxCrossValidation,

  body('location')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Lokasi maksimal 200 karakter.'),

  body('deadline')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Format deadline tidak valid. Gunakan ISO 8601 (contoh: 2025-12-31T23:59:00Z).')
    .toDate()
    .custom((deadline) => {
      if (deadline && deadline <= new Date()) {
        throw new Error('Deadline harus di masa depan.');
      }
      return true;
    }),

  body('attachmentUrl')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('attachmentUrl harus berupa URL yang valid.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /projects/:id — Update project (partial)
// ─────────────────────────────────────────────────────────────────────────────

const updateProjectValidators = [
  ...projectIdParam,

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Judul project harus antara 5–200 karakter.'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Deskripsi project harus antara 20–5.000 karakter.'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Kategori tidak valid. Pilih salah satu: ${VALID_CATEGORIES.join(', ')}.`),

  body('budgetMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum harus angka positif.')
    .toFloat(),

  body('budgetMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget maksimum harus angka positif.')
    .toFloat(),

  budgetMaxCrossValidation,

  body('location')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Lokasi maksimal 200 karakter.'),

  body('deadline')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Format deadline tidak valid. Gunakan ISO 8601.')
    .toDate()
    .custom((deadline) => {
      if (deadline && deadline <= new Date()) {
        throw new Error('Deadline harus di masa depan.');
      }
      return true;
    }),

  body('attachmentUrl')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('attachmentUrl harus berupa URL yang valid.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /projects/:id/cancel
// ─────────────────────────────────────────────────────────────────────────────

const cancelProjectValidators = [
  ...projectIdParam,

  body('reason')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Alasan pembatalan maksimal 500 karakter.'),
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /projects — List dengan filter + pagination + sort
// ─────────────────────────────────────────────────────────────────────────────

const listProjectsValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page harus bilangan bulat >= 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit harus bilangan bulat 1–100.')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('search maksimal 100 karakter.'),

  query('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Kategori tidak valid. Pilih salah satu: ${VALID_CATEGORIES.join(', ')}.`),

  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status tidak valid. Pilih salah satu: ${VALID_STATUSES.join(', ')}.`),

  query('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('location maksimal 100 karakter.'),

  query('budgetMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('budgetMin harus angka positif.')
    .toFloat(),

  query('budgetMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('budgetMax harus angka positif.')
    .toFloat(),

  query('sortBy')
    .optional()
    .isIn(VALID_SORT_FIELDS)
    .withMessage(`sortBy tidak valid. Pilih salah satu: ${VALID_SORT_FIELDS.join(', ')}.`),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder harus "asc" atau "desc".'),
];

module.exports = {
  projectIdParam,
  createProjectValidators,
  updateProjectValidators,
  cancelProjectValidators,
  listProjectsValidators,
  VALID_STATUSES,
  VALID_CATEGORIES,
};
