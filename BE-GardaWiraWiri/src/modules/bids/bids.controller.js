'use strict';

const bidsService = require('./bids.service');
const { created, ok, noContent, successResponse } = require('../../utils/response');

// =============================================================================
// BIDS CONTROLLER
// =============================================================================

async function createBid(req, res, next) {
  try {
    const bid = await bidsService.createBid(req.user.id, req.body);
    return created(res, bid, 'Bid berhasil diajukan.');
  } catch (error) {
    return next(error);
  }
}

async function getBidsByProject(req, res, next) {
  try {
    const result = await bidsService.getBidsByProject(
      req.params.projectId,
      req.user,
      req.query,
    );
    return successResponse(res, {
      message: 'Daftar bid berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyBids(req, res, next) {
  try {
    const result = await bidsService.getMyBids(req.user.id, req.query);
    return successResponse(res, {
      message: 'Daftar bid kamu berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

async function acceptBid(req, res, next) {
  try {
    const result = await bidsService.acceptBid(req.params.id, req.user);
    return ok(res, result, 'Bid berhasil diterima. Contract telah dibuat otomatis.');
  } catch (error) {
    return next(error);
  }
}

async function rejectBid(req, res, next) {
  try {
    const bid = await bidsService.rejectBid(
      req.params.id,
      req.user,
      req.body.rejectionNote,
    );
    return ok(res, bid, 'Bid berhasil ditolak.');
  } catch (error) {
    return next(error);
  }
}

async function deleteBid(req, res, next) {
  try {
    await bidsService.deleteBid(req.params.id, req.user.id);
    return noContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBid,
  getBidsByProject,
  getMyBids,
  acceptBid,
  rejectBid,
  deleteBid,
};
