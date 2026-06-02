'use strict';

const { prisma, withTransaction, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { createNotification } = require('../../utils/notification.helper');

// =============================================================================
// CONTRACTS SERVICE
//
// Contract TIDAK dibuat dari endpoint di sini.
// Contract dibuat otomatis oleh bids.service.acceptBid() dalam transaksi.
// Module ini hanya mengelola lifecycle contract yang sudah ada:
//
// Lifecycle contract:
//   active → (freelancer submit) → active (submittedAt set) →
//   (client konfirmasi) → completed      [via projects.service.completeProject]
//   active → cancelled                   [via /:id/cancel]
//   active → disputed                    [admin]
//
// Endpoint PATCH /:id/start  : freelancer konfirmasi mulai pengerjaan
// Endpoint PATCH /:id/finish : freelancer submit hasil pekerjaan
// Endpoint PATCH /:id/cancel : client atau admin batalkan contract
//
// Akses:
//  GET /contracts            : client (contract-nya) atau freelancer atau admin
//  GET /contracts/:id        : parties terlibat (client/freelancer) atau admin
//  PATCH /:id/start          : hanya freelancer (pihak kontrak)
//  PATCH /:id/finish         : hanya freelancer (pihak kontrak)
//  PATCH /:id/cancel         : client (pihak kontrak) atau admin
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SELECT CLAUSE
// ─────────────────────────────────────────────────────────────────────────────

const CONTRACT_DETAIL_INCLUDE = {
  project: {
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      description: true,
      deadline: true,
      clientProfile: {
        select: {
          id: true,
          city: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  },
  bid: {
    select: {
      id: true,
      proposedPrice: true,
      coverLetter: true,
      estimatedDays: true,
    },
  },
  freelancerProfile: {
    select: {
      id: true,
      avgRating: true,
      completedJobs: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  },
  payment: {
    select: {
      id: true,
      amount: true,
      status: true,
      method: true,
      paidAt: true,
      releasedAt: true,
    },
  },
  review: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil contract dan validasi bahwa requestUser adalah salah satu pihak
 * dalam contract (client pemilik project, freelancer, atau admin).
 *
 * @param {string} contractId
 * @param {{ id: string, role: string }} requestUser
 * @returns {Promise<object>} contract record lengkap
 */
async function requireContractAccess(contractId, requestUser) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: {
        select: {
          clientProfile: { select: { userId: true } },
        },
      },
      freelancerProfile: { select: { userId: true } },
    },
  });

  if (!contract) {
    const err = new Error('Contract tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = requestUser.role === 'admin';
  const isClient = contract.project.clientProfile.userId === requestUser.id;
  const isFreelancer = contract.freelancerProfile.userId === requestUser.id;

  if (!isAdmin && !isClient && !isFreelancer) {
    const err = new Error('Anda tidak memiliki akses ke contract ini.');
    err.statusCode = 403;
    throw err;
  }

  return { contract, isAdmin, isClient, isFreelancer };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List contract berdasarkan role user yang sedang login.
 *
 * - Admin: semua contract (bisa filter by status)
 * - Client: contract dari project miliknya
 * - Freelancer: contract yang dia kerjakan
 *
 * @param {{ id: string, role: string }} requestUser
 * @param {object} queryParams
 */
async function findAll(requestUser, queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const { status } = queryParams;

  const where = {};

  // Filter berdasarkan role
  if (requestUser.role === 'admin') {
    // Admin lihat semua
    if (status) where.status = status;
  } else if (requestUser.role === 'client') {
    // Cari contracts dari project milik client ini
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: requestUser.id },
      select: { id: true },
    });

    if (!clientProfile) {
      return { data: [], meta: buildPaginationMeta({ page, limit, total: 0 }) };
    }

    where.project = { clientProfileId: clientProfile.id };
    if (status) where.status = status;
  } else if (requestUser.role === 'freelancer') {
    // Cari contracts yang dikerjakan freelancer ini
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: requestUser.id },
      select: { id: true },
    });

    if (!freelancerProfile) {
      return { data: [], meta: buildPaginationMeta({ page, limit, total: 0 }) };
    }

    where.freelancerProfileId = freelancerProfile.id;
    if (status) where.status = status;
  }

  const [contracts, total] = await batchQueries([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: CONTRACT_DETAIL_INCLUDE,
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    data: contracts,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Detail satu contract.
 * Hanya pihak terkait (client, freelancer) atau admin yang bisa akses.
 *
 * @param {string} contractId
 * @param {{ id: string, role: string }} requestUser
 */
async function findById(contractId, requestUser) {
  await requireContractAccess(contractId, requestUser);

  return prisma.contract.findUnique({
    where: { id: contractId },
    include: CONTRACT_DETAIL_INCLUDE,
  });
}

/**
 * Freelancer konfirmasi mulai pengerjaan.
 *
 * Endpoint ini opsional — berguna sebagai sinyal ke client bahwa
 * freelancer sudah membaca brief dan siap memulai.
 * Tidak mengubah status contract (tetap 'active').
 * Hanya mencatat waktu start di field 'terms' sebagai catatan (tidak ada
 * field startedAt di schema, jadi kita update workNote saja).
 *
 * @param {string} contractId
 * @param {{ id: string, role: string }} requestUser - Harus freelancer pihak kontrak
 */
async function startContract(contractId, requestUser) {
  const { contract, isFreelancer } = await requireContractAccess(contractId, requestUser);

  if (!isFreelancer) {
    const err = new Error('Hanya freelancer pihak contract yang dapat memulai pengerjaan.');
    err.statusCode = 403;
    throw err;
  }

  if (contract.status !== 'active') {
    const err = new Error(
      `Contract tidak dapat dimulai. Status saat ini: "${contract.status}".`
    );
    err.statusCode = 400;
    throw err;
  }

  // Tandai bahwa freelancer sudah mulai (gunakan workNote sebagai log awal)
  const startNote = `[${new Date().toISOString()}] Freelancer telah mengonfirmasi mulai pengerjaan.`;

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      workNote: contract.workNote
        ? `${contract.workNote}\n${startNote}`
        : startNote,
    },
    include: CONTRACT_DETAIL_INCLUDE,
  });

  // Notifikasi ke client
  const clientUserId = updated.project.clientProfile.user.id;
  createNotification({
    userId: clientUserId,
    type: 'work_submitted',
    title: 'Freelancer mulai mengerjakan',
    message: `Freelancer telah mengonfirmasi mulai mengerjakan project "${updated.project.title}".`,
    data: { contractId },
  }).catch((e) => console.error('[Contract] Notification failed:', e.message));

  return updated;
}

/**
 * Freelancer submit hasil pekerjaan (mark as finished dari sisi freelancer).
 *
 * Alur:
 * 1. Freelancer submit dengan catatan pekerjaan (workNote)
 * 2. Set submittedAt = now()
 * 3. Status tetap 'active' — belum 'completed' sampai client konfirmasi
 * 4. Client akan menggunakan PATCH /projects/:id/complete untuk konfirmasi akhir
 *
 * @param {string} contractId
 * @param {{ id: string, role: string }} requestUser - Harus freelancer pihak kontrak
 * @param {string} [workNote] - Catatan / deskripsi hasil pekerjaan
 */
async function finishContract(contractId, requestUser, workNote) {
  const { contract, isFreelancer } = await requireContractAccess(contractId, requestUser);

  if (!isFreelancer) {
    const err = new Error('Hanya freelancer pihak contract yang dapat mengirimkan hasil pekerjaan.');
    err.statusCode = 403;
    throw err;
  }

  if (contract.status !== 'active') {
    const err = new Error(
      `Hasil pekerjaan tidak dapat dikirimkan. Status contract: "${contract.status}".`
    );
    err.statusCode = 400;
    throw err;
  }

  if (contract.submittedAt) {
    const err = new Error('Hasil pekerjaan sudah pernah dikirimkan. Tunggu konfirmasi dari client.');
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      submittedAt: new Date(),
      workNote: workNote || null,
    },
    include: CONTRACT_DETAIL_INCLUDE,
  });

  // Notifikasi ke client bahwa hasil pekerjaan siap direview
  const clientUserId = updated.project.clientProfile.user.id;
  createNotification({
    userId: clientUserId,
    type: 'work_submitted',
    title: 'Hasil pekerjaan siap direview 📋',
    message: `Freelancer telah mengirimkan hasil pekerjaan untuk project "${updated.project.title}". Silakan review dan konfirmasi.`,
    data: { contractId, projectId: contract.projectId },
  }).catch((e) => console.error('[Contract] Notification failed:', e.message));

  return updated;
}

/**
 * Batalkan contract.
 *
 * Hanya bisa dilakukan oleh:
 * - Client pemilik project (dengan atau tanpa alasan)
 * - Admin (untuk mediasi dispute)
 *
 * Freelancer tidak bisa cancel contract — harus melalui negosiasi dengan client
 * atau admin untuk menjaga kepercayaan di platform.
 *
 * Alur dalam transaksi:
 * 1. Update contract.status → 'cancelled'
 * 2. Update project.status → 'open' kembali (client bisa menerima bid baru)
 *    ATAU → 'cancelled' jika client memang ingin batalkan seluruhnya
 * 3. Reset bid yang diterima → 'pending' (TIDAK dilakukan — bid tetap cancelled
 *    karena contract sudah terbentuk. Client perlu buat project baru.)
 *
 * @param {string} contractId
 * @param {{ id: string, role: string }} requestUser
 * @param {string} [cancellationReason]
 */
async function cancelContract(contractId, requestUser, cancellationReason) {
  const { contract, isClient, isAdmin } = await requireContractAccess(contractId, requestUser);

  if (!isClient && !isAdmin) {
    const err = new Error('Hanya client atau admin yang dapat membatalkan contract.');
    err.statusCode = 403;
    throw err;
  }

  if (contract.status !== 'active') {
    const err = new Error(
      `Contract tidak dapat dibatalkan. Status saat ini: "${contract.status}".`
    );
    err.statusCode = 400;
    throw err;
  }

  // Ambil data lengkap untuk notifikasi
  const fullContract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: {
        select: {
          title: true,
          clientProfile: { select: { userId: true } },
        },
      },
      freelancerProfile: { select: { userId: true } },
    },
  });

  await withTransaction(async (tx) => {
    // 1. Batalkan contract
    await tx.contract.update({
      where: { id: contractId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || null,
      },
    });

    // 2. Update project kembali ke 'cancelled'
    //    (client dapat membuat project baru jika ingin mencari freelancer lain)
    await tx.project.update({
      where: { id: contract.projectId },
      data: { status: 'cancelled' },
    });
  });

  // Notifikasi ke pihak lainnya
  const freelancerUserId = fullContract.freelancerProfile.userId;
  const clientUserId = fullContract.project.clientProfile.userId;
  const projectTitle = fullContract.project.title;

  // Notifikasi ke freelancer (jika yang cancel adalah client/admin)
  if (requestUser.id !== freelancerUserId) {
    createNotification({
      userId: freelancerUserId,
      type: 'contract_cancelled',
      title: 'Contract dibatalkan',
      message: `Contract untuk project "${projectTitle}" telah dibatalkan.${cancellationReason ? ` Alasan: ${cancellationReason}` : ''}`,
      data: { contractId, projectId: contract.projectId },
    }).catch((e) => console.error('[Contract] Notification failed:', e.message));
  }

  // Notifikasi ke client (jika yang cancel adalah admin)
  if (isAdmin && requestUser.id !== clientUserId) {
    createNotification({
      userId: clientUserId,
      type: 'contract_cancelled',
      title: 'Contract dibatalkan oleh admin',
      message: `Contract untuk project "${projectTitle}" dibatalkan oleh admin.${cancellationReason ? ` Alasan: ${cancellationReason}` : ''}`,
      data: { contractId, projectId: contract.projectId },
    }).catch((e) => console.error('[Contract] Notification failed:', e.message));
  }

  return prisma.contract.findUnique({
    where: { id: contractId },
    include: CONTRACT_DETAIL_INCLUDE,
  });
}

module.exports = {
  findAll,
  findById,
  startContract,
  finishContract,
  cancelContract,
};
