'use strict';

const { Router } = require('express');
const bidsController = require('./bids.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  bidIdParam,
  createBidValidators,
  rejectBidValidators,
  myBidsQueryValidators,
  projectBidsQueryValidators,
} = require('./bids.validation');

// =============================================================================
// BIDS ROUTES
// Base path: /api/v1/bids
//
// ⚠️  URUTAN ROUTE KRITIS:
//  /my-bids dan /project/:projectId adalah route STATIS.
//  Harus dideklarasikan SEBELUM route dinamis /:id agar Express
//  tidak salah mencocokkan "my-bids" sebagai UUID param.
// =============================================================================

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ROUTES — wajib sebelum /:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/bids/my-bids
 * Daftar bid milik freelancer yang sedang login.
 * Query: ?status, ?page, ?limit
 */
router.get(
  '/my-bids',
  authenticate,
  authorize('freelancer'),
  myBidsQueryValidators,
  validate,
  bidsController.getMyBids,
);

/**
 * GET /api/v1/bids/project/:projectId
 * Semua bid untuk satu project.
 * Hanya client pemilik project atau admin yang bisa akses.
 * Query: ?status, ?sortBy, ?sortOrder, ?page, ?limit
 */
router.get(
  '/project/:projectId',
  authenticate,
  authorize('client', 'admin'),
  projectBidsQueryValidators,
  validate,
  bidsController.getBidsByProject,
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT ROUTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/bids
 * Freelancer ajukan bid ke project.
 * Body: { projectId, proposedPrice, coverLetter, estimatedDays }
 */
router.post(
  '/',
  authenticate,
  authorize('freelancer'),
  createBidValidators,
  validate,
  bidsController.createBid,
);

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ROUTES — setelah static routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/bids/:id/accept
 * Client menerima bid → buat contract otomatis, reject bid lain.
 * Hanya client pemilik project.
 */
router.patch(
  '/:id/accept',
  authenticate,
  authorize('client'),
  bidIdParam,
  validate,
  bidsController.acceptBid,
);

/**
 * PATCH /api/v1/bids/:id/reject
 * Client menolak satu bid secara spesifik.
 * Body: { rejectionNote? }
 */
router.patch(
  '/:id/reject',
  authenticate,
  authorize('client'),
  rejectBidValidators,
  validate,
  bidsController.rejectBid,
);

/**
 * DELETE /api/v1/bids/:id
 * Freelancer menarik bid miliknya. Hanya bisa jika status masih 'pending'.
 */
router.delete(
  '/:id',
  authenticate,
  authorize('freelancer'),
  bidIdParam,
  validate,
  bidsController.deleteBid,
);

module.exports = router;
