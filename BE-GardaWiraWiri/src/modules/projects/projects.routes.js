'use strict';

const { Router } = require('express');
const projectsController = require('./projects.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  projectIdParam,
  createProjectValidators,
  updateProjectValidators,
  cancelProjectValidators,
  listProjectsValidators,
} = require('./projects.validation');

// =============================================================================
// PROJECTS ROUTES
// Base path: /api/v1/projects
//
// Akses:
//  GET  / dan GET /:id          → Publik (tidak perlu login)
//  GET  /status/open            → Publik
//  GET  /status/completed       → Publik
//  POST /                       → Hanya client
//  PATCH /:id                   → client (pemilik) atau admin
//  DELETE /:id                  → client (pemilik) atau admin
//  PATCH /:id/complete          → Hanya client (pemilik)
//  PATCH /:id/cancel            → client (pemilik) atau admin
//
// ⚠️  URUTAN ROUTE KRITIS:
//  Route statis (/status/open, /status/completed) HARUS dideklarasikan
//  SEBELUM route dinamis (/:id). Jika dibalik, Express akan mencoba
//  mencocokkan string "status" sebagai UUID dan query gagal.
// =============================================================================

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ROUTES — harus sebelum /:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/projects/status/open
 * Shortcut: semua project berstatus open.
 * Query: ?search, ?category, ?location, ?budgetMin, ?budgetMax, ?page, ?limit
 */
router.get(
  '/status/open',
  listProjectsValidators,
  validate,
  projectsController.getOpenProjects,
);

/**
 * GET /api/v1/projects/status/completed
 * Shortcut: semua project berstatus completed.
 */
router.get(
  '/status/completed',
  listProjectsValidators,
  validate,
  projectsController.getCompletedProjects,
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/projects
 * List semua project dengan filter, sort, pagination.
 * Publik — tidak perlu login.
 * Query: ?search, ?category, ?status, ?location, ?budgetMin, ?budgetMax,
 *        ?sortBy, ?sortOrder, ?page, ?limit
 */
router.get(
  '/',
  listProjectsValidators,
  validate,
  projectsController.getProjects,
);

/**
 * POST /api/v1/projects
 * Buat project baru. Hanya client.
 * Body: { title, description, category, budgetMin, budgetMax, location?,
 *         deadline?, attachmentUrl? }
 */
router.post(
  '/',
  authenticate,
  authorize('client'),
  createProjectValidators,
  validate,
  projectsController.createProject,
);

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ROUTES — setelah semua static route
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/projects/:id
 * Detail satu project. Publik.
 * Otomatis increment viewCount.
 */
router.get(
  '/:id',
  projectIdParam,
  validate,
  projectsController.getProjectById,
);

/**
 * PATCH /api/v1/projects/:id
 * Update project. Client (pemilik) atau admin.
 * Hanya boleh jika status masih 'open'.
 * Body: { title?, description?, category?, budgetMin?, budgetMax?,
 *         location?, deadline?, attachmentUrl? }
 */
router.patch(
  '/:id',
  authenticate,
  authorize('client', 'admin'),
  updateProjectValidators,
  validate,
  projectsController.updateProject,
);

/**
 * DELETE /api/v1/projects/:id
 * Hapus project. Client (pemilik) atau admin.
 * Tidak bisa hapus jika status in_progress atau completed.
 */
router.delete(
  '/:id',
  authenticate,
  authorize('client', 'admin'),
  projectIdParam,
  validate,
  projectsController.deleteProject,
);

/**
 * PATCH /api/v1/projects/:id/complete
 * Konfirmasi project selesai. HANYA client pemilik.
 * Mengubah status project → completed dan contract → completed.
 */
router.patch(
  '/:id/complete',
  authenticate,
  authorize('client'),    // Admin sengaja dikecualikan
  projectIdParam,
  validate,
  projectsController.completeProject,
);

/**
 * PATCH /api/v1/projects/:id/cancel
 * Batalkan project. Client (pemilik) atau admin.
 * Body: { reason? }
 */
router.patch(
  '/:id/cancel',
  authenticate,
  authorize('client', 'admin'),
  cancelProjectValidators,
  validate,
  projectsController.cancelProject,
);

module.exports = router;
