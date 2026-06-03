'use strict';

const notificationsService = require('./notifications.service');
const { ok, noContent, successResponse } = require('../../utils/response');

// =============================================================================
// NOTIFICATIONS CONTROLLER
// =============================================================================

async function getMyNotifications(req, res, next) {
  try {
    const result = await notificationsService.getMyNotifications(req.user.id, req.query);

    return successResponse(res, {
      message: 'Notifikasi berhasil diambil.',
      data: result.data,
      meta: {
        ...result.meta,
        unreadCount: result.unreadCount,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await notificationsService.markAsRead(
      req.params.id,
      req.user.id,
    );
    return ok(res, notification, 'Notifikasi ditandai sudah dibaca.');
  } catch (error) {
    return next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    await notificationsService.deleteNotification(req.params.id, req.user.id);
    return noContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
  deleteNotification,
};
