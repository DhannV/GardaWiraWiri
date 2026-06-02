'use strict';

const { prisma, withTransaction, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { createNotification } = require('../../utils/notification.helper');

// =============================================================================
// PROJECTS SERVICE
//
// Aturan bisnis utama:
//  - Hanya client yang bisa membuat project (di-enforce di route + service)
//  - Hanya pemilik project (clientProfile.userId === requestUser.id) atau admin
//    yang bisa PATCH / DELETE
//  - Project hanya bisa diedit ketika berstatus 'open'
//  - Project berstatus 'in_progress' atau 'completed' tidak bisa dihapus
//  - PATCH /:id/complete hanya boleh dilakukan client pemilik (admin tidak)
//    karena ini adalah konfirmasi kepuasan — keputusan subyektif client
//  - PATCH /:id/cancel bisa dilakukan client pemilik ATAU admin
//  - viewCount di-increment setiap GET /:id (fire-and-forget)
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SELECT/INCLUDE CLAUSES
// Didefinisikan di atas agar tidak duplikasi antara fungsi-fungsi service.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kolom untuk list project — ringkas, tidak ambil isi bids.
 */
const PROJECT_LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  status: true,
  budgetMin: true,
  budgetMax: true,
  location: true,
  deadline: true,
  viewCount: true,
  attachmentUrl: true,
  createdAt: true,
  updatedAt: true,
  clientProfile: {
    select: {
      id: true,
      city: true,
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  },
  _count: { select: { bids: true } },
};

/**
 * Relasi untuk detail satu project — lengkap dengan bids dan contract.
 */
const PROJECT_DETAIL_INCLUDE = {
  clientProfile: {
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true, createdAt: true },
      },
    },
  },
  bids: {
    // Sembunyikan bid yang di-withdraw dari tampilan publik
    where: { status: { not: 'withdrawn' } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      proposedPrice: true,
      coverLetter: true,
      estimatedDays: true,
      status: true,
      createdAt: true,
      freelancerProfile: {
        select: {
          id: true,
          avgRating: true,
          completedJobs: true,
          location: true,
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  },
  contract: {
    select: {
      id: true,
      status: true,
      agreedPrice: true,
      createdAt: true,
      completedAt: true,
      freelancerProfile: {
        select: {
          id: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  },
  _count: { select: { bids: true } },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dapatkan clientProfile milik userId.
 * Throw 404 jika tidak ada (user bukan client atau profil belum dibuat).
 *
 * @param {string} userId
 * @returns {Promise<{ id: string }>}
 */
async function requireClientProfile(userId) {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    const err = new Error('Profil client tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  return profile;
}

/**
 * Dapatkan project dan validasi kepemilikan.
 *
 * - Admin selalu lolos
 * - Client hanya lolos jika clientProfile.userId === requestUser.id
 *
 * @param {string} projectId
 * @param {{ id: string, role: string }} requestUser
 * @returns {Promise<object>} project record (include clientProfile.userId)
 */
async function requireOwnerOrAdmin(projectId, requestUser) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      clientProfile: { select: { userId: true } },
    },
  });

  if (!project) {
    const err = new Error('Project tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = project.clientProfile.userId === requestUser.id;
  const isAdmin = requestUser.role === 'admin';

  if (!isOwner && !isAdmin) {
    const err = new Error('Anda tidak memiliki izin untuk mengubah project ini.');
    err.statusCode = 403;
    throw err;
  }

  return project;
}

/**
 * Bangun Prisma where clause dari filter query params.
 *
 * @param {{ search?, category?, status?, location?, budgetMin?, budgetMax? }} filters
 * @returns {object}
 */
function buildWhereClause({ search, category, status, location, budgetMin, budgetMax }) {
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) where.category = category;
  if (status) where.status = status;

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  // Budget range: filter berdasarkan budgetMax agar project dengan kisaran
  // budget yang mencakup range pencarian muncul
  if (budgetMin !== undefined || budgetMax !== undefined) {
    where.budgetMax = {};
    if (budgetMin !== undefined) where.budgetMax.gte = Number(budgetMin);
    if (budgetMax !== undefined) where.budgetMax.lte = Number(budgetMax);
  }

  return where;
}

/**
 * Bangun Prisma orderBy dari sort query params.
 *
 * @param {{ sortBy?: string, sortOrder?: string }} params
 * @returns {object}
 */
function buildOrderBy({ sortBy = 'createdAt', sortOrder = 'desc' }) {
  const ALLOWED = ['createdAt', 'budgetMin', 'budgetMax', 'deadline', 'viewCount'];
  const field = ALLOWED.includes(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder === 'asc' ? 'asc' : 'desc' };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Buat project baru.
 * Hanya client yang memiliki clientProfile yang bisa membuat project.
 *
 * @param {string} userId - req.user.id dari JWT
 * @param {object} dto - Validated request body
 * @returns {Promise<object>} Project yang baru dibuat
 */
async function createProject(userId, dto) {
  const clientProfile = await requireClientProfile(userId);

  const { title, description, category, budgetMin, budgetMax, location, deadline, attachmentUrl } = dto;

  const project = await prisma.project.create({
    data: {
      clientProfileId: clientProfile.id,
      title,
      description,
      category: category || 'lainnya',
      status: 'open',  // Status awal selalu open
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      location: location || null,
      deadline: deadline ? new Date(deadline) : null,
      attachmentUrl: attachmentUrl || null,
    },
    include: PROJECT_DETAIL_INCLUDE,
  });

  return project;
}

/**
 * List semua project dengan filter, sort, dan pagination.
 * Endpoint publik — semua role (dan tanpa login) bisa mengakses.
 *
 * @param {object} queryParams - req.query
 * @returns {Promise<{ data: object[], meta: object }>}
 */
async function findAll(queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const where = buildWhereClause(queryParams);
  const orderBy = buildOrderBy(queryParams);

  // Jalankan count dan findMany paralel — satu roundtrip
  const [projects, total] = await batchQueries([
    prisma.project.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: PROJECT_LIST_SELECT,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * List project dengan status 'open'.
 * Shortcut untuk halaman utama — freelancer bisa langsung browse project.
 *
 * @param {object} queryParams
 * @returns {Promise<{ data, meta }>}
 */
async function findOpenProjects(queryParams) {
  // Override / paksa status = open, abaikan status dari query
  return findAll({ ...queryParams, status: 'open' });
}

/**
 * List project dengan status 'completed'.
 * Berguna sebagai referensi / portofolio project yang pernah dikerjakan.
 *
 * @param {object} queryParams
 * @returns {Promise<{ data, meta }>}
 */
async function findCompletedProjects(queryParams) {
  return findAll({ ...queryParams, status: 'completed' });
}

/**
 * Ambil detail satu project.
 *
 * Increment viewCount dilakukan secara fire-and-forget setelah response
 * siap dikirim — tidak blocking, dan jika gagal tidak merusak apapun.
 *
 * @param {string} projectId
 * @returns {Promise<object>}
 */
async function findById(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: PROJECT_DETAIL_INCLUDE,
  });

  if (!project) {
    const err = new Error('Project tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // Fire-and-forget viewCount increment
  prisma.project
    .update({ where: { id: projectId }, data: { viewCount: { increment: 1 } } })
    .catch((e) => console.error('[Project] viewCount increment failed:', e.message));

  return project;
}

/**
 * Update project (partial update).
 *
 * Aturan:
 * - Hanya pemilik atau admin
 * - Hanya boleh jika status masih 'open'
 *   (jika sudah in_progress, ada freelancer yang sedang mengerjakan)
 *
 * @param {string} projectId
 * @param {{ id: string, role: string }} requestUser
 * @param {object} dto - Partial update body
 * @returns {Promise<object>}
 */
async function updateProject(projectId, requestUser, dto) {
  const project = await requireOwnerOrAdmin(projectId, requestUser);

  if (project.status !== 'open') {
    const err = new Error(
      `Project berstatus "${project.status}" tidak dapat diedit. ` +
      'Hanya project berstatus "open" yang dapat diubah.'
    );
    err.statusCode = 400;
    throw err;
  }

  const { title, description, category, budgetMin, budgetMax, location, deadline, attachmentUrl } = dto;

  const data = {};
  if (title !== undefined)         data.title = title;
  if (description !== undefined)   data.description = description;
  if (category !== undefined)      data.category = category;
  if (budgetMin !== undefined)     data.budgetMin = Number(budgetMin);
  if (budgetMax !== undefined)     data.budgetMax = Number(budgetMax);
  if (location !== undefined)      data.location = location || null;
  if (deadline !== undefined)      data.deadline = deadline ? new Date(deadline) : null;
  if (attachmentUrl !== undefined) data.attachmentUrl = attachmentUrl || null;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data,
    include: PROJECT_DETAIL_INCLUDE,
  });

  return updated;
}

/**
 * Hapus project secara permanen.
 *
 * Aturan:
 * - Hanya pemilik atau admin
 * - Tidak bisa hapus jika status 'in_progress' atau 'completed'
 *   (data kontrak dan transaksi historis harus terjaga)
 * - Cascade di schema akan otomatis hapus semua bids terkait
 *
 * @param {string} projectId
 * @param {{ id: string, role: string }} requestUser
 */
async function deleteProject(projectId, requestUser) {
  const project = await requireOwnerOrAdmin(projectId, requestUser);

  const NON_DELETABLE_STATUSES = ['in_progress', 'completed'];
  if (NON_DELETABLE_STATUSES.includes(project.status)) {
    const err = new Error(
      `Project berstatus "${project.status}" tidak dapat dihapus ` +
      'karena sudah memiliki contract. Batalkan project terlebih dahulu.'
    );
    err.statusCode = 400;
    throw err;
  }

  await prisma.project.delete({ where: { id: projectId } });
}

/**
 * Konfirmasi penyelesaian project oleh client pemilik.
 *
 * Alur (semua dalam satu transaksi):
 *  1. Validasi: project ada, request dari pemilik, status = in_progress
 *  2. Update project.status → completed
 *  3. Update contract.status → completed + set completedAt
 *  4. Increment freelancerProfile.completedJobs
 *  5. Kirim notifikasi ke freelancer (fire-and-forget, di luar transaksi)
 *
 * Admin TIDAK bisa complete project — ini adalah konfirmasi kepuasan
 * subyektif dari client, harus dilakukan sendiri oleh pemilik project.
 *
 * @param {string} projectId
 * @param {{ id: string, role: string }} requestUser - Harus client
 * @returns {Promise<object>} Updated project dengan detail lengkap
 */
async function completeProject(projectId, requestUser) {
  // Ambil project beserta contract dan freelancer — butuh semua untuk transaksi
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      clientProfile: { select: { userId: true } },
      contract: {
        select: {
          id: true,
          status: true,
          freelancerProfileId: true,
          freelancerProfile: {
            select: { userId: true },
          },
        },
      },
    },
  });

  if (!project) {
    const err = new Error('Project tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // Hanya pemilik project yang bisa complete — bukan admin, bukan freelancer
  if (project.clientProfile.userId !== requestUser.id) {
    const err = new Error('Hanya pemilik project yang dapat mengonfirmasi penyelesaian.');
    err.statusCode = 403;
    throw err;
  }

  if (project.status !== 'in_progress') {
    const err = new Error(
      `Project tidak dapat diselesaikan. Status saat ini: "${project.status}". ` +
      'Project harus berstatus "in_progress".'
    );
    err.statusCode = 400;
    throw err;
  }

  if (!project.contract || project.contract.status !== 'active') {
    const err = new Error('Tidak ada contract aktif untuk project ini.');
    err.statusCode = 400;
    throw err;
  }

  const completedAt = new Date();

  // Jalankan semua update dalam satu transaksi atomik
  await withTransaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: { status: 'completed' },
    });

    await tx.contract.update({
      where: { id: project.contract.id },
      data: { status: 'completed', completedAt },
    });

    await tx.freelancerProfile.update({
      where: { id: project.contract.freelancerProfileId },
      data: { completedJobs: { increment: 1 } },
    });
  });

  // Notifikasi ke freelancer (di luar transaksi — kegagalan tidak rollback)
  createNotification({
    userId: project.contract.freelancerProfile.userId,
    type: 'contract_completed',
    title: 'Pekerjaan dikonfirmasi selesai! 🎉',
    message: `Client telah mengonfirmasi bahwa project "${project.title}" telah selesai. Silakan berikan yang terbaik di project berikutnya!`,
    data: { projectId, contractId: project.contract.id },
  }).catch((e) => console.error('[Project] Notification failed:', e.message));

  // Kembalikan data terbaru
  return prisma.project.findUnique({
    where: { id: projectId },
    include: PROJECT_DETAIL_INCLUDE,
  });
}

/**
 * Batalkan project.
 *
 * Alur (semua dalam satu transaksi):
 *  1. Validasi: pemilik atau admin, status bukan completed/cancelled
 *  2. Update project.status → cancelled
 *  3. Jika ada contract aktif → update contract.status → cancelled
 *  4. Reject semua bid yang masih pending (tidak relevan lagi)
 *  5. Kirim notifikasi ke freelancer yang sedang mengerjakan (jika ada)
 *
 * @param {string} projectId
 * @param {{ id: string, role: string }} requestUser
 * @param {string} [reason] - Alasan pembatalan (opsional)
 * @returns {Promise<object>}
 */
async function cancelProject(projectId, requestUser, reason) {
  const project = await requireOwnerOrAdmin(projectId, requestUser);

  if (project.status === 'completed') {
    const err = new Error('Project yang sudah selesai tidak dapat dibatalkan.');
    err.statusCode = 400;
    throw err;
  }

  if (project.status === 'cancelled') {
    const err = new Error('Project ini sudah berstatus dibatalkan.');
    err.statusCode = 400;
    throw err;
  }

  // Ambil data contract (jika ada) untuk keperluan notifikasi dan update
  const projectWithContract = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      contract: {
        select: {
          id: true,
          status: true,
          freelancerProfile: {
            select: { userId: true },
          },
        },
      },
    },
  });

  const cancellationReason = reason || null;
  const rejectionNote = reason ? `Project dibatalkan: ${reason}` : 'Project dibatalkan oleh client.';

  await withTransaction(async (tx) => {
    // 1. Update project
    await tx.project.update({
      where: { id: projectId },
      data: { status: 'cancelled' },
    });

    // 2. Cancel contract aktif jika ada
    if (projectWithContract.contract && projectWithContract.contract.status === 'active') {
      await tx.contract.update({
        where: { id: projectWithContract.contract.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason,
        },
      });
    }

    // 3. Reject semua bid pending — tidak relevan setelah project cancelled
    await tx.bid.updateMany({
      where: { projectId, status: 'pending' },
      data: { status: 'rejected', rejectionNote },
    });
  });

  // 4. Notifikasi ke freelancer yang sedang mengerjakan (jika ada contract aktif)
  const freelancerUserId = projectWithContract.contract?.freelancerProfile?.userId;
  if (freelancerUserId) {
    createNotification({
      userId: freelancerUserId,
      type: 'contract_cancelled',
      title: 'Contract dibatalkan',
      message: `Project "${project.title}" telah dibatalkan.${reason ? ` Alasan: ${reason}` : ''}`,
      data: { projectId, contractId: projectWithContract.contract.id },
    }).catch((e) => console.error('[Project] Notification failed:', e.message));
  }

  return prisma.project.findUnique({
    where: { id: projectId },
    include: PROJECT_DETAIL_INCLUDE,
  });
}

module.exports = {
  createProject,
  findAll,
  findOpenProjects,
  findCompletedProjects,
  findById,
  updateProject,
  deleteProject,
  completeProject,
  cancelProject,
};
