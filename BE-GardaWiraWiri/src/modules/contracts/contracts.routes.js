'use strict';

const { Router } = require('express');
const contractsController = require('./contracts.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  contractIdParam,
  listContractsValidators,
  finishContractValidators,
  cancelContractValidators,
} = require('./contracts.validation');

// =============================================================================
// CONTRACTS ROUTES
// Base path: /api/v1/contracts
//
// Contract dibuat OTOMATIS oleh bids.service.acceptBid() — tidak ada
// endpoint POST di sini. Module ini hanya mengelola lifecycle contract.
//
// Semua endpoint membutuhkan autentikasi.
// Akses per endpoint dikontrol di service (bukan hanya di route)
// karena butuh cek kepemilikan data (client/freelancer pihak kontrak).
// =============================================================================

const router = Router();

// Terapkan authenticate ke semua route
router.use(authenticate);

/**
 * GET /api/v1/contracts
 * List contract milik user yang sedang login:
 *  - admin    : semua contract
 *  - client   : contract dari project miliknya
 *  - freelancer: contract yang dia kerjakan
 * Query: ?status, ?page, ?limit
 */
router.get(
  '/',
  authorize('client', 'freelancer', 'admin'),
  listContractsValidators,
  validate,
  contractsController.getContracts,
);

/**
 * GET /api/v1/contracts/:id
 * Detail satu contract.
 * Hanya pihak terkait (client/freelancer pihak kontrak) atau admin.
 */
router.get(
  '/:id',
  authorize('client', 'freelancer', 'admin'),
  contractIdParam,
  validate,
  contractsController.getContractById,
);

/**
 * PATCH /api/v1/contracts/:id/start
 * Freelancer konfirmasi mulai pengerjaan.
 * Hanya freelancer pihak kontrak yang bisa akses (dicek di service).
 */
router.patch(
  '/:id/start',
  authorize('freelancer'),
  contractIdParam,
  validate,
  contractsController.startContract,
);

/**
 * PATCH /api/v1/contracts/:id/finish
 * Freelancer submit hasil pekerjaan.
 * Status contract tetap 'active' — client yang konfirmasi selesai via
 * PATCH /api/v1/projects/:id/complete.
 * Body: { workNote? }
 */
router.patch(
  '/:id/finish',
  authorize('freelancer'),
  finishContractValidators,
  validate,
  contractsController.finishContract,
);

/**
 * PATCH /api/v1/contracts/:id/cancel
 * Batalkan contract.
 * Client atau admin. Freelancer tidak bisa cancel langsung.
 * Body: { cancellationReason? }
 */
router.patch(
  '/:id/cancel',
  authorize('client', 'admin'),
  cancelContractValidators,
  validate,
  contractsController.cancelContract,
);

module.exports = router;
