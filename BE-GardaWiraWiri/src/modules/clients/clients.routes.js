'use strict';

const { Router } = require('express');
const clientsController = require('./clients.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { updateClientProfileValidators } = require('./clients.validation');

// =============================================================================
// CLIENTS ROUTES
// Base path: /api/v1/clients
// Semua endpoint hanya bisa diakses oleh role 'client'.
// =============================================================================

const router = Router();

router.use(authenticate, authorize('client'));

/**
 * GET /api/v1/clients/profile
 * Ambil profil client yang sedang login.
 */
router.get('/profile', clientsController.getMyProfile);

/**
 * PATCH /api/v1/clients/profile
 * Update profil client.
 * Body: { companyName?, address?, city?, bio? }
 */
router.patch(
  '/profile',
  updateClientProfileValidators,
  validate,
  clientsController.updateMyProfile,
);

/**
 * GET /api/v1/clients/projects
 * Daftar project milik client.
 * Query: ?status, ?page, ?limit
 */
router.get('/projects', clientsController.getMyProjects);

module.exports = router;
