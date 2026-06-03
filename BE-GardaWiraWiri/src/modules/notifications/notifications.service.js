'use strict';

const { prisma, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

// =============================================================================
// NOTIFICATIONS SERVICE
//
// Notifikasi adalah data MILIK USER — satu user hanya bisa akses
// notifikasi miliknya sendiri. Tidak ada sharing antar user.
//
// Fitur:
//  - List dengan filter isRead dan type, sorted terbaru di atas
//  - Mark satu notifikasi sebagai read
//  - Delete satu notifikasi
//  - Menyertakan unreadCount di header response list
//
// Notifikasi dibuat oleh notification.helper.js (createNotification)
// yang dipanggil dari service lain (bids, contracts, payments, reviews).
// Tidak ada endpoint untuk membuat notifikasi secara manual.
// =============================================================================

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  title: true,
  message: true,
  isRead: true,
  data: true,
  createdAt: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List notifikasi milik user yang sedang login.
 *
 * Selalu diurutkan dari yang terbaru (createdAt DESC).
 * Menyertakan unreadCount untuk badge di UI.
 *
 * @param {string} userId
 * @param {object} queryParams
 * @returns {Promise<{ data, meta, unreadCount }>}
 */
async function getMyNotifications(userId, queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const { isRead, type } = queryParams;

  const where = { userId };

  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }

  if (type) {
    where.type = type;
  }

  // Jalankan 3 query paralel: data, total, unreadCount
  const [notifications, total, unreadCount] = await batchQueries([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: NOTIFICATION_SELECT,
    }),
    prisma.notification.count({ where }),
    // unreadCount selalu dihitung tanpa filter isRead agar badge akurat
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    data: notifications,
    meta: buildPaginationMeta({ page, limit, total }),
    unreadCount,
  };
}

/**
 * Tandai satu notifikasi sebagai sudah dibaca.
 *
 * Jika notifikasi sudah read → tidak error, return data yang ada (idempotent).
 * Hanya pemilik yang bisa tandai notifikasinya.
 *
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<object>} Updated notification
 */
async function markAsRead(notificationId, userId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true, isRead: true },
  });

  if (!notification) {
    const err = new Error('Notifikasi tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  if (notification.userId !== userId) {
    const err = new Error('Anda tidak memiliki akses ke notifikasi ini.');
    err.statusCode = 403;
    throw err;
  }

  // Idempotent: sudah read → return tanpa update DB
  if (notification.isRead) {
    return prisma.notification.findUnique({
      where: { id: notificationId },
      select: NOTIFICATION_SELECT,
    });
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
    select: NOTIFICATION_SELECT,
  });
}

/**
 * Hapus satu notifikasi.
 * User hanya bisa hapus notifikasi miliknya sendiri.
 *
 * @param {string} notificationId
 * @param {string} userId
 */
async function deleteNotification(notificationId, userId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true },
  });

  if (!notification) {
    const err = new Error('Notifikasi tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  if (notification.userId !== userId) {
    const err = new Error('Anda tidak memiliki akses ke notifikasi ini.');
    err.statusCode = 403;
    throw err;
  }

  await prisma.notification.delete({ where: { id: notificationId } });
}

module.exports = {
  getMyNotifications,
  markAsRead,
  deleteNotification,
};
