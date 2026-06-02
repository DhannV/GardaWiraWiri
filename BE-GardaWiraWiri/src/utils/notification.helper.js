'use strict';

const { prisma } = require('../config/database');
const { NOTIFICATION_TYPE } = require('../config/constants');

/**
 * Buat notifikasi untuk satu user.
 * Dijalankan secara fire-and-forget — error tidak akan menggagalkan
 * operasi utama, hanya dicatat ke console.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.type - Nilai dari NOTIFICATION_TYPE
 * @param {string} params.title
 * @param {string} params.message
 * @param {object} [params.data] - Data tambahan (JSON)
 */
async function createNotification({ userId, type, title, message, data = null }) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? data : undefined,
      },
    });
  } catch (error) {
    // Jangan crash aplikasi hanya karena notifikasi gagal
    console.error(`[Notification] Failed to create notification for user ${userId}:`, error.message);
  }
}

/**
 * Notifikasi: Bid baru masuk ke project client
 */
async function notifyNewBid({ clientId, freelancerName, projectTitle, bidId }) {
  await createNotification({
    userId: clientId,
    type: NOTIFICATION_TYPE.NEW_BID,
    title: 'Bid baru masuk',
    message: `${freelancerName} mengajukan bid untuk project "${projectTitle}"`,
    data: { bidId },
  });
}

/**
 * Notifikasi: Bid freelancer diterima
 */
async function notifyBidAccepted({ freelancerId, projectTitle, contractId }) {
  await createNotification({
    userId: freelancerId,
    type: NOTIFICATION_TYPE.BID_ACCEPTED,
    title: 'Bid kamu diterima! 🎉',
    message: `Bid kamu untuk project "${projectTitle}" diterima. Contract telah dibuat.`,
    data: { contractId },
  });
}

/**
 * Notifikasi: Bid freelancer ditolak
 */
async function notifyBidRejected({ freelancerId, projectTitle }) {
  await createNotification({
    userId: freelancerId,
    type: NOTIFICATION_TYPE.BID_REJECTED,
    title: 'Bid tidak dipilih',
    message: `Bid kamu untuk project "${projectTitle}" tidak dipilih client.`,
  });
}

/**
 * Notifikasi: Contract selesai
 */
async function notifyContractCompleted({ freelancerId, clientId, projectTitle }) {
  const msg = `Project "${projectTitle}" telah selesai dan dikonfirmasi.`;
  await Promise.all([
    createNotification({
      userId: freelancerId,
      type: NOTIFICATION_TYPE.CONTRACT_COMPLETED,
      title: 'Pekerjaan selesai!',
      message: msg,
    }),
    createNotification({
      userId: clientId,
      type: NOTIFICATION_TYPE.CONTRACT_COMPLETED,
      title: 'Pekerjaan dikonfirmasi selesai',
      message: msg,
    }),
  ]);
}

module.exports = {
  createNotification,
  notifyNewBid,
  notifyBidAccepted,
  notifyBidRejected,
  notifyContractCompleted,
};
