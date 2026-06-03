'use strict';

const { param, query } = require('express-validator');

// =============================================================================
// NOTIFICATIONS VALIDATION
// =============================================================================

const notificationIdParam = [
  param('id').isUUID(4).withMessage('ID notifikasi tidak valid.'),
];

/**
 * Query params untuk GET /notifications
 */
const listNotificationsValidators = [
  query('isRead')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isRead harus "true" atau "false".'),

  query('type')
    .optional()
    .isIn([
      'new_bid', 'bid_accepted', 'bid_rejected', 'bid_withdrawn',
      'contract_created', 'contract_completed', 'contract_cancelled',
      'contract_disputed', 'work_submitted', 'review_received',
      'payment_received', 'payment_released',
    ])
    .withMessage('type notifikasi tidak valid.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page harus >= 1.').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit harus 1–100.').toInt(),
];

module.exports = {
  notificationIdParam,
  listNotificationsValidators,
};
