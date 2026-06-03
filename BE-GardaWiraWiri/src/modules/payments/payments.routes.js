'use strict';

const { Router } = require('express');
const paymentsController = require('./payments.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  paymentIdParam,
  createPaymentValidators,
  confirmPaidValidators,
  refundPaymentValidators,
  paymentHistoryValidators,
} = require('./payments.validation');

// =============================================================================
// PAYMENTS ROUTES
// Base path: /api/v1/payments
//
// Semua endpoint membutuhkan autentikasi.
//
// ⚠️  URUTAN ROUTE KRITIS:
//  /create dan /history adalah route STATIS.
//  Harus dideklarasikan SEBELUM /:id agar Express tidak salah
//  mencocokkan string "create" atau "history" sebagai UUID param.
//
// Akses:
//  POST /create           → client (pemilik contract)
//  GET  /history          → client, freelancer, admin (context-aware)
//  GET  /:id              → pihak terkait atau admin
//  PATCH /:id/paid        → admin only (simulasi payment gateway callback)
//  PATCH /:id/refund      → admin only
// =============================================================================

const router = Router();

// Autentikasi wajib untuk semua route payment
router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ROUTES — wajib sebelum /:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/payments/create
 * Client membuat payment record setelah contract aktif.
 * Body: { contractId, method, notes? }
 *
 * Amount tidak dikirim dari client — diambil dari contract.agreedPrice
 * untuk mencegah manipulasi jumlah pembayaran.
 */
router.post(
  '/create',
  authorize('client'),
  createPaymentValidators,
  validate,
  paymentsController.createPayment,
);

/**
 * GET /api/v1/payments/history
 * Riwayat payment sesuai role:
 *  - client     : payment dari project miliknya
 *  - freelancer : payment dari contract yang dia kerjakan
 *  - admin      : semua payment
 *
 * Query: ?status, ?method, ?dateFrom, ?dateTo, ?sortBy, ?sortOrder, ?page, ?limit
 */
router.get(
  '/history',
  authorize('client', 'freelancer', 'admin'),
  paymentHistoryValidators,
  validate,
  paymentsController.getPaymentHistory,
);

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ROUTES — setelah static routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/payments/:id
 * Detail satu payment.
 * Hanya pihak terkait (client/freelancer pihak contract) atau admin.
 */
router.get(
  '/:id',
  authorize('client', 'freelancer', 'admin'),
  paymentIdParam,
  validate,
  paymentsController.getPaymentById,
);

/**
 * PATCH /api/v1/payments/:id/paid
 * Konfirmasi pembayaran berhasil masuk. Admin only.
 * Mensimulasikan webhook callback dari payment gateway (Midtrans, Xendit, dll).
 * Body: { externalRef?, notes? }
 */
router.patch(
  '/:id/paid',
  authorize('admin'),
  confirmPaidValidators,
  validate,
  paymentsController.confirmPaid,
);

/**
 * PATCH /api/v1/payments/:id/refund
 * Refund dana ke client. Admin only.
 * Hanya bisa jika status payment masih 'paid' (belum released ke freelancer).
 * Body: { notes } ← wajib (alasan refund untuk audit trail)
 */
router.patch(
  '/:id/refund',
  authorize('admin'),
  refundPaymentValidators,
  validate,
  paymentsController.refundPayment,
);

module.exports = router;
