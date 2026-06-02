'use strict';

const { prisma, excludeFields, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

// =============================================================================
// USERS SERVICE
// Manajemen data user oleh admin.
// Endpoint ini hanya bisa diakses role admin (di-enforce di route level).
// =============================================================================

/**
 * Field yang selalu di-exclude dari response user.
 * Didefinisikan sekali di sini agar konsisten.
 */
const EXCLUDE_FIELDS = ['passwordHash'];

/**
 * Bangun where clause Prisma dari query params.
 * Dipisah agar mudah di-test dan dikomposisi.
 *
 * @param {{ search?, role?, isActive? }} filters
 * @returns {object} Prisma where clause
 */
function buildWhereClause({ search, role, isActive }) {
  const where = {};

  // Full-text search pada nama DAN email sekaligus menggunakan OR
  // Prisma `contains` + `mode: 'insensitive'` = ILIKE di PostgreSQL
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  // Query string selalu string, konversi ke boolean
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  return where;
}

/**
 * Bangun orderBy Prisma dari query params.
 *
 * @param {{ sortBy?: string, sortOrder?: string }} params
 * @returns {object}
 */
function buildOrderBy({ sortBy = 'createdAt', sortOrder = 'desc' }) {
  const ALLOWED_SORT_FIELDS = ['name', 'email', 'createdAt', 'lastLoginAt'];
  const field = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  return { [field]: sortOrder === 'asc' ? 'asc' : 'desc' };
}

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

/**
 * Ambil list semua user dengan pagination, search, filter, dan sort.
 * Hanya admin yang boleh memanggil ini.
 *
 * @param {object} queryParams - req.query
 * @returns {Promise<{ data: object[], meta: object }>}
 */
async function findAll(queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const where = buildWhereClause(queryParams);
  const orderBy = buildOrderBy(queryParams);

  // Jalankan query data dan count secara paralel untuk efisiensi
  const [users, total] = await batchQueries([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        // Sertakan profil ringkas untuk info tambahan
        clientProfile: {
          select: {
            id: true,
            totalOrders: true,
            totalSpent: true,
            city: true,
          },
        },
        freelancerProfile: {
          select: {
            id: true,
            avgRating: true,
            completedJobs: true,
            isAvailable: true,
            location: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Ambil detail satu user berdasarkan ID.
 * Sertakan profil lengkap.
 *
 * @param {string} id - UUID user
 * @returns {Promise<object>}
 */
async function findById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      clientProfile: true,
      freelancerProfile: {
        include: {
          skills: {
            orderBy: { skillName: 'asc' },
          },
          portfolioItems: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!user) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  return excludeFields(user, EXCLUDE_FIELDS);
}

/**
 * Update data user (partial update).
 * Admin bisa update nama, phone, avatarUrl, isActive.
 * Password TIDAK bisa diubah dari sini — hanya via change-password.
 *
 * @param {string} id - UUID user
 * @param {object} dto - Field yang akan diupdate
 * @returns {Promise<object>}
 */
async function updateById(id, dto) {
  // Pastikan user ada dulu
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // Hanya ambil field yang boleh diupdate (whitelist)
  const { name, phone, avatarUrl, isActive } = dto;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone || null; // null jika string kosong
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      isVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
}

/**
 * Hapus user secara permanen (hard delete).
 * Hanya admin. Gunakan isActive = false untuk soft delete jika ingin
 * mempertahankan data historis.
 *
 * Cascades di schema Prisma akan menghapus profil dan notifikasi terkait.
 * Contract dan Review TIDAK akan terhapus (onDelete: Restrict).
 *
 * @param {string} id
 * @param {string} requesterId - ID admin yang melakukan delete (cegah self-delete)
 * @returns {Promise<void>}
 */
async function deleteById(id, requesterId) {
  if (id === requesterId) {
    const error = new Error('Tidak dapat menghapus akun sendiri.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!existing) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // Cegah hapus admin lain via API (harus langsung di DB)
  if (existing.role === 'admin') {
    const error = new Error('Akun admin tidak dapat dihapus via API.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.user.delete({ where: { id } });
}

module.exports = {
  findAll,
  findById,
  updateById,
  deleteById,
};
