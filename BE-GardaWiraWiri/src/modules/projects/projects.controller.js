'use strict';

const projectsService = require('./projects.service');
const { created, ok, noContent, successResponse } = require('../../utils/response');

// =============================================================================
// PROJECTS CONTROLLER
//
// Tanggung jawab:
//  - Ekstrak data dari req (body, params, query, user)
//  - Panggil service yang tepat
//  - Format dan kirimkan response
//  - Teruskan error ke next()
//
// Controller tidak mengandung logika bisnis sama sekali.
// =============================================================================

/**
 * POST /api/v1/projects
 * Buat project baru. Hanya client.
 */
async function createProject(req, res, next) {
  try {
    const project = await projectsService.createProject(req.user.id, req.body);
    return created(res, project, 'Project berhasil dibuat.');
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/projects
 * List semua project. Publik — semua role.
 * Query: ?search, ?category, ?status, ?location, ?budgetMin, ?budgetMax,
 *        ?sortBy, ?sortOrder, ?page, ?limit
 */
async function getProjects(req, res, next) {
  try {
    const result = await projectsService.findAll(req.query);
    return successResponse(res, {
      message: 'Daftar project berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/projects/status/open
 * List project yang sedang buka (menerima bid).
 * Shortcut untuk halaman browse freelancer.
 */
async function getOpenProjects(req, res, next) {
  try {
    const result = await projectsService.findOpenProjects(req.query);
    return successResponse(res, {
      message: 'Daftar project open berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/projects/status/completed
 * List project yang sudah selesai.
 */
async function getCompletedProjects(req, res, next) {
  try {
    const result = await projectsService.findCompletedProjects(req.query);
    return successResponse(res, {
      message: 'Daftar project selesai berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/v1/projects/:id
 * Detail satu project beserta bids dan contract-nya.
 */
async function getProjectById(req, res, next) {
  try {
    const project = await projectsService.findById(req.params.id);
    return ok(res, project, 'Detail project berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/projects/:id
 * Update project. Hanya pemilik (client), hanya jika status 'open'.
 * Admin bisa update project siapapun.
 */
async function updateProject(req, res, next) {
  try {
    const project = await projectsService.updateProject(
      req.params.id,
      req.user,   // { id, role } — dikirim penuh agar service bisa cek role
      req.body,
    );
    return ok(res, project, 'Project berhasil diperbarui.');
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/v1/projects/:id
 * Hapus project permanen.
 * Hanya pemilik atau admin. Tidak bisa jika sudah in_progress/completed.
 */
async function deleteProject(req, res, next) {
  try {
    await projectsService.deleteProject(req.params.id, req.user);
    return noContent(res);
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/projects/:id/complete
 * Konfirmasi project selesai. Hanya client pemilik project.
 * Admin tidak bisa — ini adalah pernyataan kepuasan subyektif client.
 */
async function completeProject(req, res, next) {
  try {
    const project = await projectsService.completeProject(req.params.id, req.user);
    return ok(res, project, 'Project berhasil diselesaikan. Terima kasih telah menggunakan Garda Wira Wiri!');
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/v1/projects/:id/cancel
 * Batalkan project.
 * - Client: bisa cancel project miliknya
 * - Admin: bisa cancel project siapapun
 * Body: { reason? }
 */
async function cancelProject(req, res, next) {
  try {
    const project = await projectsService.cancelProject(
      req.params.id,
      req.user,
      req.body.reason,
    );
    return ok(res, project, 'Project berhasil dibatalkan.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProject,
  getProjects,
  getOpenProjects,
  getCompletedProjects,
  getProjectById,
  updateProject,
  deleteProject,
  completeProject,
  cancelProject,
};
