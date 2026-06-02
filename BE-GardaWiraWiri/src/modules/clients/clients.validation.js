'use strict';

const { body } = require('express-validator');

// =============================================================================
// CLIENTS VALIDATION
// =============================================================================

/**
 * Validator PATCH /clients/profile
 * Semua field opsional — partial update.
 */
const updateClientProfileValidators = [
  body('companyName')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('companyName maksimal 150 karakter.'),

  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage('address maksimal 300 karakter.'),

  body('city')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('city maksimal 100 karakter.'),

  body('bio')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('bio maksimal 1000 karakter.'),
];

module.exports = {
  updateClientProfileValidators,
};
