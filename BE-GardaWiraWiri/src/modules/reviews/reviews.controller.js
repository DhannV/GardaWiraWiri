'use strict';

const reviewsService = require('./reviews.service');
const { created, ok, noContent } = require('../../utils/response');

// =============================================================================
// REVIEWS CONTROLLER
// =============================================================================

async function createReview(req, res, next) {
  try {
    const review = await reviewsService.createReview(req.user.id, req.body);
    return created(res, review, 'Review berhasil diberikan. Terima kasih atas ulasannya!');
  } catch (error) {
    return next(error);
  }
}

async function getFreelancerReviews(req, res, next) {
  try {
    const result = await reviewsService.getFreelancerReviews(req.params.id, req.query);
    return ok(res, result, 'Daftar review berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

async function updateReview(req, res, next) {
  try {
    const review = await reviewsService.updateReview(req.params.id, req.user.id, req.body);
    return ok(res, review, 'Review berhasil diperbarui.');
  } catch (error) {
    return next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    await reviewsService.deleteReview(req.params.id, req.user);
    return noContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createReview,
  getFreelancerReviews,
  updateReview,
  deleteReview,
};
