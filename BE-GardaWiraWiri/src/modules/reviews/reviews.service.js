'use strict';

const { prisma, withTransaction, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { createNotification } = require('../../utils/notification.helper');

// =============================================================================
// REVIEWS SERVICE
//
// Aturan bisnis:
//  1. Hanya client yang bisa membuat review (hanya client yang "menerima jasa")
//  2. Review hanya bisa dibuat setelah contract.status = 'completed'
//  3. Satu contract hanya menghasilkan satu review
//     → di-enforce oleh @unique contractId di schema
//  4. Reviewer adalah client pemilik project — bukan sembarang client
//  5. Reviewee adalah freelancer yang mengerjakan contract tersebut
//  6. Saat review dibuat atau diupdate → recalculate avgRating freelancer
//     secara atomik dalam satu transaksi
//  7. Client hanya bisa update/delete review miliknya sendiri
//  8. Admin bisa delete review apapun (moderasi konten)
//  9. Review yang sudah didelete tidak bisa dikembalikan (hard delete)
//     → recalculate avgRating setelah delete
//
// avgRating dihitung ulang dari semua review yang ada (bukan increment/decrement)
// untuk menjaga akurasi — tidak ada floating point drift akibat operasi berulang.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SELECT CLAUSE
// ─────────────────────────────────────────────────────────────────────────────

const REVIEW_DETAIL_SELECT = {
  id: true,
  rating: true,
  comment: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  contract: {
    select: {
      id: true,
      project: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
  },
  reviewer: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
  reviewee: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hitung ulang avgRating dan totalReviews freelancer dari semua review-nya.
 *
 * Strategi "recalculate from scratch" lebih akurat dibanding
 * increment/decrement karena:
 * - Tidak ada floating point drift dari operasi berulang
 * - Konsisten walaupun ada race condition (idempotent)
 * - Sederhana untuk di-test
 *
 * Dipanggil dalam transaksi yang sama dengan operasi review
 * agar tidak ada jeda antara data review dan avgRating.
 *
 * @param {string} freelancerUserId - User ID freelancer (bukan profileId)
 * @param {import('@prisma/client').PrismaClient} tx - Prisma transaction client
 */
async function recalculateFreelancerRating(freelancerUserId, tx) {
  const db = tx || prisma;

  // Ambil semua review publik untuk freelancer ini
  const reviews = await db.review.findMany({
    where: {
      revieweeId: freelancerUserId,
      isPublic: true,
    },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? parseFloat(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
        )
      : 0;

  await db.freelancerProfile.update({
    where: { userId: freelancerUserId },
    data: { avgRating, totalReviews },
  });

  return { avgRating, totalReviews };
}

/**
 * Validasi bahwa requestUser adalah reviewer (pemilik review).
 *
 * @param {string} reviewId
 * @param {string} requestUserId
 * @returns {Promise<object>} Review record
 */
async function requireReviewOwner(reviewId, requestUserId) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    const err = new Error('Review tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  if (review.reviewerId !== requestUserId) {
    const err = new Error('Anda tidak memiliki izin untuk mengubah review ini.');
    err.statusCode = 403;
    throw err;
  }

  return review;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Client membuat review untuk freelancer setelah contract selesai.
 *
 * Alur validasi:
 * 1. Contract ada dan requestUser adalah client pemilik project
 * 2. Contract berstatus 'completed' (belum selesai = belum bisa review)
 * 3. Belum ada review untuk contract ini (1 contract = 1 review)
 *
 * Dalam satu TRANSAKSI ATOMIK:
 * 1. Buat review record
 * 2. Recalculate avgRating dan totalReviews freelancer
 *
 * Notifikasi ke freelancer dikirim setelah transaksi sukses.
 *
 * @param {string} userId - req.user.id (client)
 * @param {{ contractId, rating, comment?, isPublic? }} dto
 */
async function createReview(userId, dto) {
  const { contractId, rating, comment, isPublic = true } = dto;

  // 1. Ambil contract beserta semua relasi yang dibutuhkan
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      review: { select: { id: true } },
      project: {
        select: {
          title: true,
          clientProfile: { select: { userId: true } },
        },
      },
      freelancerProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!contract) {
    const err = new Error('Contract tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Hanya client pemilik project yang bisa review
  if (contract.project.clientProfile.userId !== userId) {
    const err = new Error('Hanya client pemilik project yang dapat memberikan review.');
    err.statusCode = 403;
    throw err;
  }

  // 3. Contract harus sudah selesai
  if (contract.status !== 'completed') {
    const err = new Error(
      `Review belum dapat diberikan. Status contract: "${contract.status}". ` +
      'Contract harus berstatus "completed" terlebih dahulu.'
    );
    err.statusCode = 400;
    throw err;
  }

  // 4. Cegah review duplikat (jaga-jaga sebelum unique constraint DB)
  if (contract.review) {
    const err = new Error(
      'Review untuk contract ini sudah ada. ' +
      `Gunakan PATCH /reviews/${contract.review.id} untuk mengubah review.`
    );
    err.statusCode = 409;
    throw err;
  }

  const freelancerUserId = contract.freelancerProfile.userId;

  // ── TRANSAKSI ATOMIK ──────────────────────────────────────────────────────
  const review = await withTransaction(async (tx) => {
    // 1. Buat review
    const newReview = await tx.review.create({
      data: {
        contractId,
        reviewerId: userId,           // client yang mereview
        revieweeId: freelancerUserId, // freelancer yang direview
        rating: Number(rating),
        comment: comment?.trim() || null,
        isPublic,
      },
      select: REVIEW_DETAIL_SELECT,
    });

    // 2. Recalculate rating freelancer dalam transaksi yang sama
    await recalculateFreelancerRating(freelancerUserId, tx);

    return newReview;
  });
  // ── AKHIR TRANSAKSI ───────────────────────────────────────────────────────

  // Notifikasi ke freelancer (fire-and-forget di luar transaksi)
  createNotification({
    userId: freelancerUserId,
    type: 'review_received',
    title: `Review baru: ${rating}/5 ⭐`,
    message: `Kamu mendapatkan review ${rating} bintang untuk project "${contract.project.title}".${comment ? ` "${comment.substring(0, 80)}${comment.length > 80 ? '...' : ''}"` : ''}`,
    data: { reviewId: review.id, contractId, projectTitle: contract.project.title },
  }).catch((e) => console.error('[Review] Notification failed:', e.message));

  return review;
}

/**
 * List review yang diterima oleh freelancer berdasarkan freelancerProfile ID.
 * Endpoint publik — semua role bisa melihat review publik.
 * Hanya tampilkan review dengan isPublic = true.
 *
 * @param {string} freelancerProfileId - UUID dari freelancerProfile (bukan userId)
 * @param {object} queryParams
 */
async function getFreelancerReviews(freelancerProfileId, queryParams) {
  // Resolve freelancerProfile → userId untuk query review
  const profile = await prisma.freelancerProfile.findUnique({
    where: { id: freelancerProfileId },
    select: {
      userId: true,
      avgRating: true,
      totalReviews: true,
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  if (!profile) {
    const err = new Error('Profil freelancer tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  const { page, limit, skip } = parsePagination(queryParams);
  const { minRating, sortOrder = 'desc' } = queryParams;

  const where = {
    revieweeId: profile.userId,
    isPublic: true,
  };

  if (minRating) {
    where.rating = { gte: Number(minRating) };
  }

  const [reviews, total] = await batchQueries([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' },
      select: REVIEW_DETAIL_SELECT,
    }),
    prisma.review.count({ where }),
  ]);

  // Sertakan statistik rating dalam response
  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { revieweeId: profile.userId, isPublic: true },
    _count: { rating: true },
    orderBy: { rating: 'desc' },
  });

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(({ rating, _count }) => {
    distribution[rating] = _count.rating;
  });

  return {
    freelancer: {
      id: freelancerProfileId,
      userId: profile.userId,
      name: profile.user.name,
      avatarUrl: profile.user.avatarUrl,
      avgRating: profile.avgRating,
      totalReviews: profile.totalReviews,
    },
    ratingDistribution: distribution,
    data: reviews,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Client update review miliknya.
 *
 * Aturan:
 * - Hanya reviewer (client yang membuat review) yang bisa update
 * - Admin tidak bisa edit isi review — hanya bisa hapus
 *
 * Dalam satu TRANSAKSI ATOMIK:
 * 1. Update review
 * 2. Recalculate avgRating freelancer (rating mungkin berubah)
 *
 * @param {string} reviewId
 * @param {string} userId - req.user.id
 * @param {{ rating?, comment?, isPublic? }} dto
 */
async function updateReview(reviewId, userId, dto) {
  const existingReview = await requireReviewOwner(reviewId, userId);

  const { rating, comment, isPublic } = dto;

  // Tidak ada perubahan → early return
  if (rating === undefined && comment === undefined && isPublic === undefined) {
    const err = new Error('Tidak ada data yang diperbarui. Kirim minimal satu field.');
    err.statusCode = 400;
    throw err;
  }

  const updateData = {};
  if (rating !== undefined)   updateData.rating = Number(rating);
  if (comment !== undefined)  updateData.comment = comment?.trim() || null;
  if (isPublic !== undefined) updateData.isPublic = isPublic;

  // ── TRANSAKSI ATOMIK ──────────────────────────────────────────────────────
  const updated = await withTransaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: updateData,
      select: REVIEW_DETAIL_SELECT,
    });

    // Recalculate hanya jika rating atau isPublic berubah
    // (comment tidak mempengaruhi avgRating)
    const needsRecalculate = rating !== undefined || isPublic !== undefined;
    if (needsRecalculate) {
      await recalculateFreelancerRating(existingReview.revieweeId, tx);
    }

    return updatedReview;
  });
  // ── AKHIR TRANSAKSI ───────────────────────────────────────────────────────

  return updated;
}

/**
 * Hapus review.
 *
 * Akses:
 * - Client: hanya review miliknya
 * - Admin: review siapapun (moderasi)
 *
 * Setelah delete → recalculate avgRating freelancer dalam transaksi.
 *
 * @param {string} reviewId
 * @param {{ id: string, role: string }} requestUser
 */
async function deleteReview(reviewId, requestUser) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    const err = new Error('Review tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // Client hanya bisa hapus miliknya; admin bisa hapus semua
  const isOwner = review.reviewerId === requestUser.id;
  const isAdmin = requestUser.role === 'admin';

  if (!isOwner && !isAdmin) {
    const err = new Error('Anda tidak memiliki izin untuk menghapus review ini.');
    err.statusCode = 403;
    throw err;
  }

  const freelancerUserId = review.revieweeId;

  // ── TRANSAKSI ATOMIK ──────────────────────────────────────────────────────
  await withTransaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });

    // Recalculate setelah delete — rating freelancer bisa naik atau turun
    await recalculateFreelancerRating(freelancerUserId, tx);
  });
  // ── AKHIR TRANSAKSI ───────────────────────────────────────────────────────
}

module.exports = {
  createReview,
  getFreelancerReviews,
  updateReview,
  deleteReview,
};
