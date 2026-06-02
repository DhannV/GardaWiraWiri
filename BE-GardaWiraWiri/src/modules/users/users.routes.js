'use strict';

const { Router } = require('express');
const usersController = require('./users.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  listUsersValidators,
  userIdValidators,
  updateUserValidators,
} = require('./users.validation');

// =============================================================================
// USERS ROUTES
// Base path: /api/v1/users
// Semua endpoint hanya bisa diakses oleh admin.
// =============================================================================

const router = Router();

// Terapkan authenticate + authorize('admin') ke SEMUA route di file ini
// dengan memakai router.use — tidak perlu tulis ulang di setiap route.
router.use(authenticate, authorize('admin'));

/**
 * GET /api/v1/users
 * Query: ?page, ?limit, ?search, ?role, ?isActive, ?sortBy, ?sortOrder
 */
router.get(
  '/',
  listUsersValidators,
  validate,
  usersController.getUsers,
);

/**
 * GET /api/v1/users/:id
 */
router.get(
  '/:id',
  userIdValidators,
  validate,
  usersController.getUserById,
);

/**
 * PATCH /api/v1/users/:id
 * Body: { name?, phone?, avatarUrl?, isActive? }
 */
router.patch(
  '/:id',
  updateUserValidators,
  validate,
  usersController.updateUser,
);

/**
 * DELETE /api/v1/users/:id
 * Hard delete — admin tidak bisa menghapus dirinya sendiri.
 */
router.delete(
  '/:id',
  userIdValidators,
  validate,
  usersController.deleteUser,
);

module.exports = router;
