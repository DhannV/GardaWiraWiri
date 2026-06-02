'use strict';

const { body, query, param } = require('express-validator');

// =============================================================================
// USERS VALIDATION
// =============================================================================

/**
 * Validator query GET /users (list + search + pagination)
 */
const listUsersValidators = [
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

  query('role')
    .optional()
    .isIn(['client', 'freelancer', 'admin'])
    .withMessage('role harus salah satu dari: client, freelancer, admin.'),

  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive harus "true" atau "false".'),

  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'createdAt', 'lastLoginAt'])
    .withMessage('sortBy harus salah satu dari: name, email, createdAt, lastLoginAt.'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder harus "asc" atau "desc".'),
];

/**
 * Validator param :id (UUID)
 */
const userIdValidators = [
  param('id')
    .isUUID(4)
    .withMessage('ID user tidak valid.'),
];

/**
 * Validator PATCH /users/:id
 * Semua field opsional — hanya yang dikirim yang diupdate (partial update).
 */
const updateUserValidators = [
  ...userIdValidators,

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus antara 2–100 karakter.')
    .matches(/^[a-zA-Z\s.'"-]+$/)
    .withMessage('Nama hanya boleh berisi huruf, spasi, dan tanda baca umum.'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^(\+62|0)[0-9]{8,12}$/)
    .withMessage('Nomor telepon tidak valid. Gunakan format 08xx atau +628xx.'),

  body('avatarUrl')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('avatarUrl harus berupa URL yang valid.'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive harus boolean.')
    .toBoolean(),
];

module.exports = {
  listUsersValidators,
  userIdValidators,
  updateUserValidators,
};
