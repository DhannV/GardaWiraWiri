'use strict';

const { prisma, withTransaction, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { createNotification } = require('../../utils/notification.helper');

// =============================================================================
// PAYMENTS SERVICE
//
// Model Pembayaran: ESCROW
// ─────────────────────────────────────────────────────────────────────────────
// Platform ini menggunakan model escrow sederhana:
//
//   Client bayar → Dana ditahan platform (paid)
//       │
//       ▼ Contract selesai (dikonfirmasi client)
//   Dana dilepas ke freelancer (released)
//       │
//       ▼ Contract cancel / dispute sebelum selesai
//   Dana dikembalikan ke client (refunded)
//
// Status Flow:
//   pending → paid → released     (alur normal)
//   pending → failed               (pembayaran gagal)
//   paid    → refunded             (cancel setelah bayar)
//
// Platform Fee:
//   Dikenakan 5% dari amount (dapat dikonfigurasi via konstanta PLATFORM_FEE_RATE).
//   netAmount = amount - platformFee → yang diterima freelancer.
//
// Aturan akses:
//   createPayment  : client pemilik contract
//   confirmPaid    : admin (simulasi payment gateway callback)
//   releasePayment : otomatis dipanggil saat contract completed (internal)
//   refundPayment  : admin only
//   getHistory     : client (payment miliknya) / freelancer (payment contract-nya)
//                    / admin (semua)
//   getById        : pihak terkait atau admin
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Platform fee 5% dari amount. Ubah nilai ini untuk menyesuaikan komisi. */
const PLATFORM_FEE_RATE = 0.05;

// ─────────────────────────────────────────────────────────────────────────────
// SELECT CLAUSE
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_DETAIL_INCLUDE = {
  contract: {
    select: {
      id: true,
      status: true,
      agreedPrice: true,
      createdAt: true,
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          clientProfile: {
            select: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      },
      freelancerProfile: {
        select: {
          id: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hitung platform fee dan net amount dari jumlah pembayaran.
 *
 * @param {number} amount
 * @returns {{ platformFee: number, netAmount: number }}
 */
function calculateFees(amount) {
  const platformFee = parseFloat((amount * PLATFORM_FEE_RATE).toFixed(2));
  const netAmount = parseFloat((amount - platformFee).toFixed(2));
  return { platformFee, netAmount };
}

/**
 * Ambil payment dan validasi akses.
 * Client: hanya payment dari contract project miliknya.
 * Freelancer: hanya payment dari contract yang dia kerjakan.
 * Admin: semua payment.
 *
 * @param {string} paymentId
 * @param {{ id: string, role: string }} requestUser
 * @returns {Promise<{ payment, isAdmin, isClient, isFreelancer }>}
 */
async function requirePaymentAccess(paymentId, requestUser) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      contract: {
        select: {
          id: true,
          status: true,
          projectId: true,
          freelancerProfile: { select: { userId: true } },
          project: {
            select: {
              clientProfile: { select: { userId: true } },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    const err = new Error('Payment tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = requestUser.role === 'admin';
  const isClient = payment.contract.project.clientProfile.userId === requestUser.id;
  const isFreelancer = payment.contract.freelancerProfile.userId === requestUser.id;

  if (!isAdmin && !isClient && !isFreelancer) {
    const err = new Error('Anda tidak memiliki akses ke payment ini.');
    err.statusCode = 403;
    throw err;
  }

  return { payment, isAdmin, isClient, isFreelancer };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Buat payment record untuk contract.
 *
 * Alur validasi:
 * 1. Contract ada dan requestUser adalah client pemilik project
 * 2. Contract berstatus 'active' (tidak bisa bayar contract yang cancelled)
 * 3. Belum ada payment untuk contract ini (1 contract = 1 payment)
 * 4. Hitung platform fee dan net amount
 * 5. Buat payment record dengan status 'pending'
 *
 * Amount diambil dari contract.agreedPrice — tidak bisa diubah client.
 * Ini penting: client tidak bisa mengirim amount berbeda dari yang disepakati.
 *
 * @param {string} userId - req.user.id (harus client)
 * @param {{ contractId: string, method: string, notes?: string }} dto
 */
async function createPayment(userId, dto) {
  const { contractId, method, notes } = dto;

  // 1. Ambil contract beserta relasi pemilik
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: {
        select: {
          title: true,
          clientProfile: { select: { userId: true } },
        },
      },
      freelancerProfile: {
        select: { userId: true },
      },
      payment: { select: { id: true } },
    },
  });

  if (!contract) {
    const err = new Error('Contract tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Hanya client pemilik project yang bisa buat payment
  if (contract.project.clientProfile.userId !== userId) {
    const err = new Error('Hanya client pemilik project yang dapat membuat payment.');
    err.statusCode = 403;
    throw err;
  }

  // 3. Contract harus aktif
  if (contract.status !== 'active') {
    const err = new Error(
      `Pembayaran tidak dapat dibuat. Status contract: "${contract.status}". ` +
      'Contract harus berstatus "active".'
    );
    err.statusCode = 400;
    throw err;
  }

  // 4. Cegah duplikasi payment
  if (contract.payment) {
    const err = new Error(
      'Payment untuk contract ini sudah pernah dibuat. ' +
      `ID Payment: ${contract.payment.id}`
    );
    err.statusCode = 409;
    throw err;
  }

  // 5. Hitung fee
  const amount = parseFloat(contract.agreedPrice);
  const { platformFee, netAmount } = calculateFees(amount);

  // 6. Buat payment record
  const payment = await prisma.payment.create({
    data: {
      contractId,
      amount,
      platformFee,
      netAmount,
      status: 'pending',
      method,
      notes: notes || null,
    },
    include: PAYMENT_DETAIL_INCLUDE,
  });

  // Notifikasi ke freelancer bahwa payment sedang diproses
  createNotification({
    userId: contract.freelancerProfile.userId,
    type: 'payment_received',
    title: 'Pembayaran sedang diproses',
    message: `Client telah membuat permintaan pembayaran untuk project "${contract.project.title}". Dana akan segera diverifikasi.`,
    data: { paymentId: payment.id, contractId },
  }).catch((e) => console.error('[Payment] Notification failed:', e.message));

  return payment;
}

/**
 * Riwayat payment milik user yang sedang login.
 *
 * - Admin  : semua payment
 * - Client : payment dari contract project miliknya
 * - Freelancer: payment dari contract yang dia kerjakan
 *
 * Filter opsional: status, method, dateFrom, dateTo.
 *
 * @param {{ id: string, role: string }} requestUser
 * @param {object} queryParams
 */
async function getPaymentHistory(requestUser, queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const { status, method, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

  // Bangun where clause berdasarkan role
  const where = {};

  if (requestUser.role === 'client') {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: requestUser.id },
      select: { id: true },
    });
    if (!clientProfile) {
      return { data: [], meta: buildPaginationMeta({ page, limit, total: 0 }) };
    }
    where.contract = { project: { clientProfileId: clientProfile.id } };
  } else if (requestUser.role === 'freelancer') {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: requestUser.id },
      select: { id: true },
    });
    if (!freelancerProfile) {
      return { data: [], meta: buildPaginationMeta({ page, limit, total: 0 }) };
    }
    where.contract = { freelancerProfileId: freelancerProfile.id };
  }
  // admin: where tetap {} → semua payment

  // Tambahkan filter opsional
  if (status) where.status = status;
  if (method) where.method = method;

  // Filter rentang tanggal berdasarkan createdAt
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      // Set ke akhir hari agar inklusif
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt.lte = endOfDay;
    }
  }

  // Validasi field sort
  const ALLOWED_SORT = ['createdAt', 'amount', 'paidAt'];
  const sortField = ALLOWED_SORT.includes(sortBy) ? sortBy : 'createdAt';

  const [payments, total] = await batchQueries([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' },
      include: PAYMENT_DETAIL_INCLUDE,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    data: payments,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Detail satu payment.
 *
 * @param {string} paymentId
 * @param {{ id: string, role: string }} requestUser
 */
async function getPaymentById(paymentId, requestUser) {
  await requirePaymentAccess(paymentId, requestUser);

  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: PAYMENT_DETAIL_INCLUDE,
  });
}

/**
 * Konfirmasi pembayaran masuk — ADMIN ONLY.
 *
 * Di platform produksi, ini akan dipanggil oleh webhook dari payment gateway
 * (Midtrans, Xendit, dll). Untuk saat ini disimulasikan via endpoint admin.
 *
 * Alur dalam transaksi:
 * 1. Update payment.status → 'paid'
 * 2. Set payment.paidAt = now()
 * 3. Set payment.externalRef (nomor referensi dari bank/gateway)
 * 4. Notifikasi ke client dan freelancer
 *
 * Tidak ada update ke contract atau freelancerProfile di sini —
 * dana baru "dilepas" (released) setelah contract completed.
 *
 * @param {string} paymentId
 * @param {{ id: string, role: string }} requestUser - Harus admin
 * @param {{ externalRef?: string, notes?: string }} dto
 */
async function confirmPaid(paymentId, requestUser, dto) {
  if (requestUser.role !== 'admin') {
    const err = new Error('Hanya admin yang dapat mengonfirmasi pembayaran.');
    err.statusCode = 403;
    throw err;
  }

  const { payment } = await requirePaymentAccess(paymentId, requestUser);

  if (payment.status !== 'pending') {
    const err = new Error(
      `Pembayaran tidak dapat dikonfirmasi. Status saat ini: "${payment.status}". ` +
      'Hanya payment berstatus "pending" yang dapat dikonfirmasi.'
    );
    err.statusCode = 400;
    throw err;
  }

  // Cek duplikasi externalRef (jika dikirim)
  if (dto.externalRef) {
    const duplicate = await prisma.payment.findUnique({
      where: { externalRef: dto.externalRef },
    });
    if (duplicate && duplicate.id !== paymentId) {
      const err = new Error(`externalRef "${dto.externalRef}" sudah digunakan oleh payment lain.`);
      err.statusCode = 409;
      throw err;
    }
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'paid',
      paidAt: new Date(),
      externalRef: dto.externalRef || null,
      notes: dto.notes
        ? payment.notes
          ? `${payment.notes}\n[Admin] ${dto.notes}`
          : `[Admin] ${dto.notes}`
        : payment.notes,
    },
    include: PAYMENT_DETAIL_INCLUDE,
  });

  // Notifikasi ke kedua pihak
  const clientUserId = updated.contract.project.clientProfile.user.id;
  const freelancerUserId = updated.contract.freelancerProfile.user.id;
  const projectTitle = updated.contract.project.title;

  createNotification({
    userId: clientUserId,
    type: 'payment_received',
    title: 'Pembayaran dikonfirmasi ✅',
    message: `Pembayaran untuk project "${projectTitle}" telah berhasil dikonfirmasi dan dana ditahan platform.`,
    data: { paymentId, contractId: payment.contractId },
  }).catch((e) => console.error('[Payment] Notification failed:', e.message));

  createNotification({
    userId: freelancerUserId,
    type: 'payment_received',
    title: 'Dana client sudah masuk',
    message: `Dana untuk project "${projectTitle}" sudah masuk dan ditahan platform. Segera selesaikan pekerjaan!`,
    data: { paymentId, contractId: payment.contractId },
  }).catch((e) => console.error('[Payment] Notification failed:', e.message));

  return updated;
}

/**
 * Lepaskan dana ke freelancer (release dari escrow).
 *
 * DIPANGGIL SECARA INTERNAL oleh projects.service.completeProject()
 * setelah client mengonfirmasi pekerjaan selesai.
 * BUKAN endpoint HTTP langsung — tidak ada route untuk ini.
 *
 * Menggunakan tx (Prisma transaction client) karena dipanggil dalam
 * konteks transaksi yang lebih besar di projects.service.
 *
 * Alur dalam transaksi luar (dari projects.service):
 * 1. Update payment.status → 'released'
 * 2. Set payment.releasedAt = now()
 * 3. Increment freelancerProfile.totalEarned += payment.netAmount
 *
 * @param {string} contractId
 * @param {import('@prisma/client').PrismaClient} tx - Prisma transaction client
 * @returns {Promise<object>} Updated payment
 */
async function releasePaymentInternal(contractId, tx) {
  const client = tx || prisma;

  const payment = await client.payment.findUnique({
    where: { contractId },
    include: {
      contract: {
        select: { freelancerProfileId: true },
      },
    },
  });

  // Payment mungkin belum dibuat jika transaksi tunai (luar sistem)
  // Tidak perlu throw error — lewati saja
  if (!payment) return null;

  if (payment.status !== 'paid') {
    // Jika payment belum 'paid', jangan release — catat saja
    console.warn(
      `[Payment] releasePaymentInternal: payment ${payment.id} berstatus "${payment.status}", skip release.`
    );
    return payment;
  }

  // Update payment → released
  const updated = await client.payment.update({
    where: { id: payment.id },
    data: {
      status: 'released',
      releasedAt: new Date(),
    },
  });

  // Tambah totalEarned freelancer (netAmount yang diterima setelah platform fee)
  await client.freelancerProfile.update({
    where: { id: payment.contract.freelancerProfileId },
    data: {
      totalEarned: { increment: Number(payment.netAmount) },
    },
  });

  return updated;
}

/**
 * Refund dana ke client.
 * ADMIN ONLY — hanya bisa jika payment berstatus 'paid' (belum released).
 *
 * Alur dalam transaksi:
 * 1. Update payment.status → 'refunded'
 * 2. Set payment.refundedAt = now()
 * 3. Update contract.status → 'cancelled' (jika belum)
 * 4. Notifikasi ke client dan freelancer
 *
 * Refund TIDAK bisa dilakukan jika payment sudah 'released'
 * (dana sudah masuk ke freelancer — perlu proses berbeda di luar sistem).
 *
 * @param {string} paymentId
 * @param {{ id: string, role: string }} requestUser - Harus admin
 * @param {string} notes - Alasan refund (wajib)
 */
async function refundPayment(paymentId, requestUser, notes) {
  if (requestUser.role !== 'admin') {
    const err = new Error('Hanya admin yang dapat memproses refund.');
    err.statusCode = 403;
    throw err;
  }

  const { payment } = await requirePaymentAccess(paymentId, requestUser);

  // Hanya payment berstatus 'paid' yang bisa di-refund
  if (payment.status !== 'paid') {
    const err = new Error(
      `Refund tidak dapat diproses. Status pembayaran saat ini: "${payment.status}". ` +
      'Hanya payment berstatus "paid" yang dapat di-refund.'
    );
    err.statusCode = 400;
    throw err;
  }

  // Ambil data untuk notifikasi sebelum transaksi
  const fullPayment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      contract: {
        select: {
          id: true,
          status: true,
          projectId: true,
          project: {
            select: {
              title: true,
              clientProfile: { select: { userId: true } },
            },
          },
          freelancerProfile: { select: { userId: true } },
        },
      },
    },
  });

  await withTransaction(async (tx) => {
    // 1. Tandai payment sebagai refunded
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'refunded',
        refundedAt: new Date(),
        notes: payment.notes
          ? `${payment.notes}\n[Refund] ${notes}`
          : `[Refund] ${notes}`,
      },
    });

    // 2. Batalkan contract jika masih active
    if (fullPayment.contract.status === 'active') {
      await tx.contract.update({
        where: { id: fullPayment.contract.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: `Refund oleh admin: ${notes}`,
        },
      });

      // 3. Batalkan project terkait
      await tx.project.update({
        where: { id: fullPayment.contract.projectId },
        data: { status: 'cancelled' },
      });
    }
  });

  // Notifikasi ke client
  createNotification({
    userId: fullPayment.contract.project.clientProfile.userId,
    type: 'payment_received',
    title: 'Refund berhasil diproses 💰',
    message: `Dana pembayaran untuk project "${fullPayment.contract.project.title}" telah dikembalikan. Alasan: ${notes}`,
    data: { paymentId, contractId: fullPayment.contract.id },
  }).catch((e) => console.error('[Payment] Notification failed:', e.message));

  // Notifikasi ke freelancer
  createNotification({
    userId: fullPayment.contract.freelancerProfile.userId,
    type: 'contract_cancelled',
    title: 'Contract dibatalkan dan dana di-refund',
    message: `Contract untuk project "${fullPayment.contract.project.title}" dibatalkan dan dana dikembalikan ke client. Alasan: ${notes}`,
    data: { paymentId, contractId: fullPayment.contract.id },
  }).catch((e) => console.error('[Payment] Notification failed:', e.message));

  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: PAYMENT_DETAIL_INCLUDE,
  });
}

module.exports = {
  createPayment,
  getPaymentHistory,
  getPaymentById,
  confirmPaid,
  releasePaymentInternal,
  refundPayment,
  calculateFees,
  PLATFORM_FEE_RATE,
};
