'use strict';

const { body, param, query } = require('express-validator');

// =============================================================================
// CONTRACTS VALIDATION
// =============================================================================

const contractIdParam = [
  param('id').isUUID(4).withMessage('ID contract tidak valid.'),
];

/** Query params untuk GET /contracts list */
const listContractsValidators = [
  query('status')
    .optional()
    .isIn(['active', 'completed', 'cancelled', 'disputed'])
    .withMessage('status tidak valid.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page harus >= 1.').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit harus 1–50.').toInt(),

  query('role')
    .optional()
    .isIn(['client', 'freelancer'])
    .withMessage('role harus "client" atau "freelancer".'),
];

/** PATCH /:id/finish — freelancer submit hasil pekerjaan */
const finishContractValidators = [
  ...contractIdParam,

  body('workNote')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Catatan pekerjaan maksimal 2.000 karakter.'),
];

/** PATCH /:id/cancel — sertakan alasan pembatalan */
const cancelContractValidators = [
  ...contractIdParam,

  body('cancellationReason')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Alasan pembatalan maksimal 500 karakter.'),
];

module.exports = {
  contractIdParam,
  listContractsValidators,
  finishContractValidators,
  cancelContractValidators,
};
