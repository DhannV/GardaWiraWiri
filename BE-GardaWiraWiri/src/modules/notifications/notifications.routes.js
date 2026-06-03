'use strict';

const { Router } = require('express');
const notificationsController = require('./notifications.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  notificationIdParam,
  listNotificationsValidators,
} = require('./notifications.validation');

// =============================================================================
// NOTIFICATIONS ROUTES
// Base path: /api/v1/notifications
//
// Semua endpoint membutuhkan autentikasi — notifikasi adalah data privat.
// Semua role (client, freelancer, admin) bisa akses endpoint ini.
// Akses data dikontrol di service level (hanya notifikasi milik sendiri).
// =============================================================================

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/notifications
 * List notifikasi milik user yang sedang login.
 * Response menyertakan unreadCount dalam meta untuk badge di UI.
 * Query: ?isRead, ?type, ?page, ?limit
 */
router.get(
  '/',
  listNotificationsValidators,
  validate,
  notificationsController.getMyNotifications,
);

/**
 * PATCH /api/v1/notifications/:id/read
 * Tandai satu notifikasi sebagai sudah dibaca.
 * Idempotent — aman dipanggil berulang kali.
 */
router.patch(
  '/:id/read',
  notificationIdParam,
  validate,
  notificationsController.markAsRead,
);

/**
 * DELETE /api/v1/notifications/:id
 * Hapus satu notifikasi milik user.
 */
router.delete(
  '/:id',
  notificationIdParam,
  validate,
  notificationsController.deleteNotification,
);

module.exports = router;
