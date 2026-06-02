'use strict';

const { Router } = require('express');
const freelancersController = require('./freelancers.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listFreelancersValidators,
  freelancerIdValidators,
  updateFreelancerProfileValidators,
  listReviewsValidators,
} = require('./freelancers.validation');

// =============================================================================
// FREELANCERS ROUTES
// Base path: /api/v1/freelancers
//
// Akses campuran:
//  - GET list & detail: semua user (termasuk guest via Postman)
//  - PATCH profile: hanya freelancer pemilik profil
//  - GET reviews: semua user
// =============================================================================

const router = Router();

/**
 * GET /api/v1/freelancers
 * List semua freelancer. Publik — tidak perlu login.
 * Query: ?search, ?skill, ?location, ?isAvailable, ?minRating,
 *        ?maxHourlyRate, ?sortBy, ?sortOrder, ?page, ?limit
 */
router.get(
  '/',
  listFreelancersValidators,
  validate,
  freelancersController.getFreelancers,
);

/**
 * PATCH /api/v1/freelancers/profile
 * Update profil freelancer yang sedang login.
 * ⚠️ Route ini HARUS sebelum /:id agar Express tidak salah parse
 *    "profile" sebagai UUID param.
 */
router.patch(
  '/profile',
  authenticate,
  authorize('freelancer'),
  updateFreelancerProfileValidators,
  validate,
  freelancersController.updateMyProfile,
);

/**
 * GET /api/v1/freelancers/:id
 * Detail profil freelancer berdasarkan profileId.
 */
router.get(
  '/:id',
  freelancerIdValidators,
  validate,
  freelancersController.getFreelancerById,
);

/**
 * GET /api/v1/freelancers/:id/reviews
 * Review yang diterima oleh freelancer.
 * Query: ?minRating, ?page, ?limit
 */
router.get(
  '/:id/reviews',
  listReviewsValidators,
  validate,
  freelancersController.getFreelancerReviews,
);

module.exports = router;
