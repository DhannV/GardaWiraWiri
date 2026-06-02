'use strict';

const usersService = require('./users.service');
const { ok, noContent } = require('../../utils/response');

// =============================================================================
// USERS CONTROLLER
// Semua endpoint hanya bisa diakses admin (diatur di route).
// =============================================================================

async function getUsers(req, res, next) {
  try {
    const result = await usersService.findAll(req.query);
    return ok(res, result.data, 'Daftar user berhasil diambil.');
    // Note: meta pagination dikembalikan via successResponse terpisah
    // Gunakan paginatedResponse jika ingin meta inline
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await usersService.findById(req.params.id);
    return ok(res, user, 'Detail user berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await usersService.updateById(req.params.id, req.body);
    return ok(res, user, 'Data user berhasil diperbarui.');
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    await usersService.deleteById(req.params.id, req.user.id);
    return noContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
