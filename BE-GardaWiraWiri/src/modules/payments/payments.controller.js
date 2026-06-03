'use strict';

const paymentsService = require('./payments.service');
const { created, ok, successResponse } = require('../../utils/response');

// =============================================================================
// PAYMENTS CONTROLLER
// =============================================================================

/**
 * POST /api/v1/payments/create
 * Client membuat payment record untuk contract.
 */
async function createPayment(req, res, next) {
  try {
    const payment = await paymentsService.createPayment(req.user.id, req.body);
    return created(res, payment, 'Payment berhasil dibuat. Silakan selesaikan pembayaran sesuai metode yang dipilih.');
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/payments/history
 * Riwayat payment milik user yang sedang login.
 * Query: ?status, ?method, ?dateFrom, ?dateTo, ?sortBy, ?sortOrder, ?page, ?limit
 */
async function getPaymentHistory(req, res, next) {
  try {
    const result = await paymentsService.getPaymentHistory(req.user, req.query);
    return successResponse(res, {
      message: 'Riwayat payment berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/payments/:id
 * Detail satu payment. Hanya pihak terkait atau admin.
 */
async function getPaymentById(req, res, next) {
  try {
    const payment = await paymentsService.getPaymentById(req.params.id, req.user);
    return ok(res, payment, 'Detail payment berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/payments/:id/paid
 * Konfirmasi pembayaran masuk. Admin only.
 * Mensimulasikan callback dari payment gateway.
 * Body: { externalRef?, notes? }
 */
async function confirmPaid(req, res, next) {
  try {
    const payment = await paymentsService.confirmPaid(req.params.id, req.user, req.body);
    return ok(res, payment, 'Pembayaran berhasil dikonfirmasi. Dana ditahan platform (escrow).');
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/payments/:id/refund
 * Refund dana ke client. Admin only.
 * Body: { notes } ← wajib (alasan refund)
 */
async function refundPayment(req, res, next) {
  try {
    const payment = await paymentsService.refundPayment(
      req.params.id,
      req.user,
      req.body.notes,
    );
    return ok(res, payment, 'Refund berhasil diproses. Dana akan dikembalikan ke client.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPayment,
  getPaymentHistory,
  getPaymentById,
  confirmPaid,
  refundPayment,
};
