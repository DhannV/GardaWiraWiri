'use strict';

const freelancersService = require('./freelancers.service');
const { ok, successResponse } = require('../../utils/response');

// =============================================================================
// FREELANCERS CONTROLLER
// =============================================================================

async function getFreelancers(req, res, next) {
  try {
    const result = await freelancersService.findAll(req.query);
    return successResponse(res, {
      message: 'Daftar freelancer berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

async function getFreelancerById(req, res, next) {
  try {
    const profile = await freelancersService.findById(req.params.id);
    return ok(res, profile, 'Detail freelancer berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await freelancersService.updateMyProfile(req.user.id, req.body);
    return ok(res, profile, 'Profil freelancer berhasil diperbarui.');
  } catch (error) {
    return next(error);
  }
}

async function getFreelancerReviews(req, res, next) {
  try {
    const result = await freelancersService.getFreelancerReviews(req.params.id, req.query);
    return successResponse(res, {
      message: 'Daftar review berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getFreelancers,
  getFreelancerById,
  updateMyProfile,
  getFreelancerReviews,
};
