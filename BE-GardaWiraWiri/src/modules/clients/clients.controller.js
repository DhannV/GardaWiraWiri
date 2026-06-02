'use strict';

const clientsService = require('./clients.service');
const { ok, successResponse } = require('../../utils/response');

async function getMyProfile(req, res, next) {
  try {
    const profile = await clientsService.getMyProfile(req.user.id);
    return ok(res, profile, 'Profil client berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await clientsService.updateMyProfile(req.user.id, req.body);
    return ok(res, profile, 'Profil client berhasil diperbarui.');
  } catch (error) {
    return next(error);
  }
}

async function getMyProjects(req, res, next) {
  try {
    const result = await clientsService.getMyProjects(req.user.id, req.query);
    return successResponse(res, {
      message: 'Daftar project berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyProjects,
};
