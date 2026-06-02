'use strict';

const { prisma, withTransaction, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { createNotification } = require('../../utils/notification.helper');

// =============================================================================
// BIDS SERVICE
//
// Aturan bisnis:
//  1. Hanya freelancer yang bisa bid (di-enforce di route)
//  2. Freelancer tidak bisa bid project milik clientProfile yang sama usernya
//     → perlu cek silang: freelancer.userId ≠ project.clientProfile.userId
//  3. Satu freelancer hanya bisa bid satu kali per project
//     → di-enforce di schema (@@unique) dan di-handle sebagai 409
//  4. Bid hanya bisa diajukan ke project berstatus 'open'
//  5. Saat bid diterima (accept), SEMUA operasi berjalan dalam satu transaksi:
//     a. Bid yang diterima → status 'accepted'
//     b. Semua bid lain pada project yang sama → status 'rejected'
//     c. Project → status 'in_progress'
//     d. Contract dibuat otomatis
//     e. Notifikasi ke freelancer yang bid-nya diterima
//     f. Notifikasi ke freelancer lain yang bid-nya di-reject
//  6. Freelancer hanya bisa delete bid miliknya sendiri selama status 'pending'
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SELECT CLAUSES
// ─────────────────────────────────────────────────────────────────────────────

const BID_DETAIL_SELECT = {
  id: true,
  proposedPrice: true,
  coverLetter: true,
  estimatedDays: true,
  status: true,
  rejectionNote: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      budgetMin: true,
      budgetMax: true,
      deadline: true,
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
      avgRating: true,
      completedJobs: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  },
  contract: {
    select: { id: true, status: true },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dapatkan freelancerProfile berdasarkan userId.
 * Throw 404 jika tidak ada.
 */
async function requireFreelancerProfile(userId) {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });

  if (!profile) {
    const err = new Error('Profil freelancer tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  return profile;
}

/**
 * Dapatkan bid dan validasi kepemilikan.
 * Freelancer hanya bisa akses bid miliknya.
 */
async function requireBidOwner(bidId, freelancerProfileId) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
  });

  if (!bid) {
    const err = new Error('Bid tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  if (bid.freelancerProfileId !== freelancerProfileId) {
    const err = new Error('Anda tidak memiliki izin untuk mengakses bid ini.');
    err.statusCode = 403;
    throw err;
  }

  return bid;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Freelancer mengajukan bid ke project.
 *
 * Validasi yang dilakukan:
 * 1. Project ada dan berstatus 'open'
 * 2. Freelancer tidak bid project milik dirinya sendiri
 * 3. Freelancer belum pernah bid ke project ini (unique constraint di schema)
 *
 * @param {string} userId - req.user.id
 * @param {{ projectId, proposedPrice, coverLetter, estimatedDays }} dto
 */
async function createBid(userId, dto) {
  const { projectId, proposedPrice, coverLetter, estimatedDays } = dto;

  // 1. Dapatkan profil freelancer
  const freelancerProfile = await requireFreelancerProfile(userId);

  // 2. Ambil project beserta pemiliknya
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      clientProfile: { select: { userId: true } },
    },
  });

  if (!project) {
    const err = new Error('Project tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // 3. Cek status project
  if (project.status !== 'open') {
    const err = new Error(
      `Project tidak menerima bid. Status saat ini: "${project.status}".`
    );
    err.statusCode = 400;
    throw err;
  }

  // 4. Cegah freelancer bid project miliknya sendiri
  //    Bisa terjadi jika user pernah punya role client lalu ganti ke freelancer
  if (project.clientProfile.userId === userId) {
    const err = new Error('Anda tidak dapat mengajukan bid pada project milik sendiri.');
    err.statusCode = 403;
    throw err;
  }

  // 5. Buat bid — unique constraint di DB akan tangkap bid duplikat
  try {
    const bid = await prisma.bid.create({
      data: {
        projectId,
        freelancerProfileId: freelancerProfile.id,
        proposedPrice: Number(proposedPrice),
        coverLetter,
        estimatedDays: Number(estimatedDays),
        status: 'pending',
      },
      select: BID_DETAIL_SELECT,
    });

    // Notifikasi ke client bahwa ada bid baru (fire-and-forget)
    createNotification({
      userId: project.clientProfile.userId,
      type: 'new_bid',
      title: 'Bid baru masuk! 📬',
      message: `Ada freelancer baru yang mengajukan bid untuk project "${project.title}".`,
      data: { projectId, bidId: bid.id },
    }).catch((e) => console.error('[Bid] Notification failed:', e.message));

    return bid;
  } catch (error) {
    // Tangkap unique constraint violation (bid duplikat)
    if (error.code === 'P2002') {
      const err = new Error('Anda sudah pernah mengajukan bid untuk project ini.');
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

/**
 * Ambil semua bid untuk satu project.
 * Hanya bisa diakses oleh client pemilik project atau admin.
 *
 * @param {string} projectId
 * @param {{ id: string, role: string }} requestUser
 * @param {object} queryParams
 */
async function getBidsByProject(projectId, requestUser, queryParams) {
  // Verifikasi project ada
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { clientProfile: { select: { userId: true } } },
  });

  if (!project) {
    const err = new Error('Project tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // Hanya pemilik project atau admin yang bisa lihat semua bid
  const isOwner = project.clientProfile.userId === requestUser.id;
  const isAdmin = requestUser.role === 'admin';

  if (!isOwner && !isAdmin) {
    const err = new Error('Hanya pemilik project yang dapat melihat daftar bid.');
    err.statusCode = 403;
    throw err;
  }

  const { page, limit, skip } = parsePagination(queryParams);
  const { status, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

  const where = { projectId };
  if (status) where.status = status;

  const ALLOWED_SORT = ['proposedPrice', 'estimatedDays', 'createdAt'];
  const sortField = ALLOWED_SORT.includes(sortBy) ? sortBy : 'createdAt';

  const [bids, total] = await batchQueries([
    prisma.bid.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' },
      select: BID_DETAIL_SELECT,
    }),
    prisma.bid.count({ where }),
  ]);

  return {
    data: bids,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Ambil semua bid milik freelancer yang sedang login.
 *
 * @param {string} userId
 * @param {object} queryParams
 */
async function getMyBids(userId, queryParams) {
  const freelancerProfile = await requireFreelancerProfile(userId);

  const { page, limit, skip } = parsePagination(queryParams);
  const { status } = queryParams;

  const where = { freelancerProfileId: freelancerProfile.id };
  if (status) where.status = status;

  const [bids, total] = await batchQueries([
    prisma.bid.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: BID_DETAIL_SELECT,
    }),
    prisma.bid.count({ where }),
  ]);

  return {
    data: bids,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Client menerima bid → trigger pembuatan contract otomatis.
 *
 * Semua operasi dalam SATU TRANSAKSI ATOMIK:
 *  1. Update bid yang diterima → status 'accepted'
 *  2. Reject semua bid lain pada project yang sama (status 'pending')
 *  3. Update project → status 'in_progress'
 *  4. Buat contract baru secara otomatis
 *
 * Notifikasi dikirim setelah transaksi sukses (fire-and-forget):
 *  - Ke freelancer yang diterima: 'bid_accepted'
 *  - Ke freelancer lain yang di-reject: 'bid_rejected'
 *
 * @param {string} bidId
 * @param {{ id: string, role: string }} requestUser - Harus client pemilik
 * @returns {Promise<{ bid: object, contract: object }>}
 */
async function acceptBid(bidId, requestUser) {
  // Ambil bid beserta relasi yang dibutuhkan
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: {
      project: {
        include: {
          clientProfile: { select: { userId: true } },
        },
      },
      freelancerProfile: {
        select: { id: true, userId: true },
      },
    },
  });

  if (!bid) {
    const err = new Error('Bid tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // Hanya client pemilik project yang bisa accept bid
  if (bid.project.clientProfile.userId !== requestUser.id) {
    const err = new Error('Hanya pemilik project yang dapat menerima bid.');
    err.statusCode = 403;
    throw err;
  }

  // Project harus masih 'open' — tidak bisa accept bid kedua kali
  if (bid.project.status !== 'open') {
    const err = new Error(
      `Bid tidak dapat diterima. Status project saat ini: "${bid.project.status}".`
    );
    err.statusCode = 400;
    throw err;
  }

  // Bid yang akan diterima harus masih 'pending'
  if (bid.status !== 'pending') {
    const err = new Error(
      `Bid tidak dapat diterima. Status bid saat ini: "${bid.status}".`
    );
    err.statusCode = 400;
    throw err;
  }

  // ── TRANSAKSI ATOMIK ──────────────────────────────────────────────────────
  const { acceptedBid, contract, rejectedBids } = await withTransaction(async (tx) => {
    // 1. Accept bid yang dipilih
    const acceptedBid = await tx.bid.update({
      where: { id: bidId },
      data: { status: 'accepted' },
    });

    // 2. Reject semua bid lain di project yang sama (selain yang diterima)
    const rejectedBids = await tx.bid.findMany({
      where: {
        projectId: bid.projectId,
        id: { not: bidId },
        status: 'pending',
      },
      select: {
        id: true,
        freelancerProfile: { select: { userId: true } },
      },
    });

    await tx.bid.updateMany({
      where: {
        projectId: bid.projectId,
        id: { not: bidId },
        status: 'pending',
      },
      data: {
        status: 'rejected',
        rejectionNote: 'Bid lain telah dipilih oleh client.',
      },
    });

    // 3. Update project → in_progress
    await tx.project.update({
      where: { id: bid.projectId },
      data: { status: 'in_progress' },
    });

    // 4. Buat contract otomatis berdasarkan bid yang diterima
    const contract = await tx.contract.create({
      data: {
        projectId: bid.projectId,
        bidId: bid.id,
        freelancerProfileId: bid.freelancerProfile.id,
        agreedPrice: bid.proposedPrice,
        status: 'active',
        terms: `Pekerjaan diselesaikan dalam ${bid.estimatedDays} hari kerja sesuai kesepakatan bid.`,
      },
    });

    return { acceptedBid, contract, rejectedBids };
  });
  // ── AKHIR TRANSAKSI ───────────────────────────────────────────────────────

  // Notifikasi ke freelancer yang diterima
  createNotification({
    userId: bid.freelancerProfile.userId,
    type: 'bid_accepted',
    title: 'Bid kamu diterima! 🎉',
    message: `Selamat! Bid kamu untuk project "${bid.project.title}" diterima. Contract telah dibuat, segera mulai pengerjaan.`,
    data: { projectId: bid.projectId, bidId, contractId: contract.id },
  }).catch((e) => console.error('[Bid] Notification failed:', e.message));

  // Notifikasi ke masing-masing freelancer yang bid-nya di-reject
  for (const rejectedBid of rejectedBids) {
    createNotification({
      userId: rejectedBid.freelancerProfile.userId,
      type: 'bid_rejected',
      title: 'Bid tidak dipilih',
      message: `Bid kamu untuk project "${bid.project.title}" tidak dipilih. Jangan patah semangat, masih banyak project lainnya!`,
      data: { projectId: bid.projectId, bidId: rejectedBid.id },
    }).catch((e) => console.error('[Bid] Notification failed:', e.message));
  }

  // Kembalikan bid dan contract yang baru dibuat
  const [freshBid, freshContract] = await batchQueries([
    prisma.bid.findUnique({ where: { id: bidId }, select: BID_DETAIL_SELECT }),
    prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        project: { select: { id: true, title: true, status: true } },
        bid: { select: { id: true, proposedPrice: true, estimatedDays: true } },
        freelancerProfile: {
          select: {
            id: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    }),
  ]);

  return { bid: freshBid, contract: freshContract };
}

/**
 * Client menolak satu bid spesifik.
 * Berbeda dengan reject massal saat accept — ini reject satu per satu.
 *
 * @param {string} bidId
 * @param {{ id: string, role: string }} requestUser - Harus client pemilik
 * @param {string} [rejectionNote]
 */
async function rejectBid(bidId, requestUser, rejectionNote) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: {
      project: {
        include: { clientProfile: { select: { userId: true } } },
      },
      freelancerProfile: { select: { userId: true } },
    },
  });

  if (!bid) {
    const err = new Error('Bid tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  if (bid.project.clientProfile.userId !== requestUser.id) {
    const err = new Error('Hanya pemilik project yang dapat menolak bid.');
    err.statusCode = 403;
    throw err;
  }

  if (bid.status !== 'pending') {
    const err = new Error(`Bid berstatus "${bid.status}" tidak dapat ditolak.`);
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.bid.update({
    where: { id: bidId },
    data: {
      status: 'rejected',
      rejectionNote: rejectionNote || null,
    },
    select: BID_DETAIL_SELECT,
  });

  // Notifikasi ke freelancer
  createNotification({
    userId: bid.freelancerProfile.userId,
    type: 'bid_rejected',
    title: 'Bid tidak dipilih',
    message: `Bid kamu untuk project "${bid.project.title}" tidak dipilih oleh client.${rejectionNote ? ` Catatan: ${rejectionNote}` : ''}`,
    data: { projectId: bid.projectId, bidId },
  }).catch((e) => console.error('[Bid] Notification failed:', e.message));

  return updated;
}

/**
 * Freelancer menarik (withdraw) bid miliknya.
 * Hanya bisa selama bid masih 'pending'.
 *
 * Menggunakan delete (hard delete) karena bid yang withdrawn
 * tidak lagi relevan dan lebih bersih dari menyimpannya dengan status withdrawn.
 * Jika ingin soft delete, ganti ke update status = 'withdrawn'.
 *
 * @param {string} bidId
 * @param {string} userId - Freelancer yang sedang login
 */
async function deleteBid(bidId, userId) {
  const freelancerProfile = await requireFreelancerProfile(userId);
  const bid = await requireBidOwner(bidId, freelancerProfile.id);

  if (bid.status !== 'pending') {
    const err = new Error(
      `Bid berstatus "${bid.status}" tidak dapat dihapus. Hanya bid berstatus "pending" yang dapat ditarik.`
    );
    err.statusCode = 400;
    throw err;
  }

  await prisma.bid.delete({ where: { id: bidId } });
}

module.exports = {
  createBid,
  getBidsByProject,
  getMyBids,
  acceptBid,
  rejectBid,
  deleteBid,
};
