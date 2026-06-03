'use strict';

const { Router } = require('express');
const reviewsController = require('./reviews.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  reviewIdParam,
  createReviewValidators,
  updateReviewValidators,
  listReviewsValidators,
} = require('./reviews.validation');

// =============================================================================
// REVIEWS ROUTES
// Base path: /api/v1/reviews
//
// ⚠️ URUTAN ROUTE KRITIS:
//  /freelancer/:id adalah route statis bertingkat.
//  Harus dideklarasikan SEBELUM /:id agar "freelancer" tidak
//  dicocokkan sebagai UUID param.
//
// Akses:
//  POST /               → client only
//  GET  /freelancer/:id → publik (tidak perlu login)
//  PATCH /:id           → client (pemilik review)
//  DELETE /:id          → client (pemilik) atau admin
// =============================================================================

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// STATIC / PREFIXED ROUTES — sebelum /:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/reviews/freelancer/:id
 * List semua review untuk freelancer berdasarkan freelancerProfile ID.
 * Publik — tidak perlu login.
 * Menyertakan statistik distribusi rating.
 * Query: ?minRating, ?sortOrder, ?page, ?limit
 */
router.get(
  '/freelancer/:id',
  listReviewsValidators,
  validate,
  reviewsController.getFreelancerReviews,
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT ROUTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/reviews
 * Client membuat review setelah contract completed.
 * Otomatis update avgRating freelancer.
 * Body: { contractId, rating (1-5), comment?, isPublic? }
 */
router.post(
  '/',
  authenticate,
  authorize('client'),
  createReviewValidators,
  validate,
  reviewsController.createReview,
);

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ROUTES — setelah static
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/reviews/:id
 * Update review milik client.
 * Otomatis recalculate avgRating freelancer jika rating berubah.
 * Body: { rating?, comment?, isPublic? }
 */
router.patch(
  '/:id',
  authenticate,
  authorize('client'),
  updateReviewValidators,
  validate,
  reviewsController.updateReview,
);

/**
 * DELETE /api/v1/reviews/:id
 * Hapus review.
 * Client: hanya review miliknya.
 * Admin: review siapapun (moderasi).
 * Otomatis recalculate avgRating freelancer setelah delete.
 */
router.delete(
  '/:id',
  authenticate,
  authorize('client', 'admin'),
  reviewIdParam,
  validate,
  reviewsController.deleteReview,
);

module.exports = router;
