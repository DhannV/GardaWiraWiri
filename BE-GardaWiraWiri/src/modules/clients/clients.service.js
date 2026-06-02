'use strict';

const { prisma, excludeFields } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

// =============================================================================
// CLIENTS SERVICE
// Semua operasi berkaitan dengan profil dan data client.
// Client hanya bisa mengakses dan mengubah data miliknya sendiri.
// =============================================================================

/**
 * Helper: Dapatkan clientProfile berdasarkan userId.
 * Jika user bukan client atau profil tidak ada, lempar error.
 *
 * @param {string} userId
 * @returns {Promise<object>} clientProfile
 */
async function getClientProfileByUserId(userId) {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const error = new Error('Profil client tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  return profile;
}

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

/**
 * Ambil profil client yang sedang login.
 * Sertakan data user agar tidak perlu call terpisah.
 *
 * @param {string} userId - Dari JWT payload (req.user.id)
 * @returns {Promise<object>}
 */
async function getMyProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
      clientProfile: true,
    },
  });

  if (!user) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

/**
 * Update profil client.
 * Hanya field profil yang bisa diubah di sini.
 * Untuk update email/password/phone → gunakan auth module.
 *
 * @param {string} userId
 * @param {{ companyName?, address?, city?, bio? }} dto
 * @returns {Promise<object>} Updated clientProfile
 */
async function updateMyProfile(userId, dto) {
  // Pastikan profile ada
  await getClientProfileByUserId(userId);

  const { companyName, address, city, bio } = dto;

  const updateData = {};
  if (companyName !== undefined) updateData.companyName = companyName || null;
  if (address !== undefined) updateData.address = address || null;
  if (city !== undefined) updateData.city = city || null;
  if (bio !== undefined) updateData.bio = bio || null;

  const updated = await prisma.clientProfile.update({
    where: { userId },
    data: updateData,
  });

  return updated;
}

/**
 * Ambil semua project milik client yang sedang login.
 * Mendukung filter status dan pagination.
 *
 * @param {string} userId
 * @param {object} queryParams - req.query: { status?, page?, limit? }
 * @returns {Promise<{ data: object[], meta: object }>}
 */
async function getMyProjects(userId, queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const { status } = queryParams;

  // Cari profile id dulu
  const profile = await getClientProfileByUserId(userId);

  const where = { clientProfileId: profile.id };

  const VALID_STATUSES = ['open', 'in_progress', 'completed', 'cancelled', 'closed'];
  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        // Hitung jumlah bid tanpa ambil datanya
        _count: { select: { bids: true } },
        // Sertakan contract jika ada
        contract: {
          select: {
            id: true,
            status: true,
            agreedPrice: true,
            createdAt: true,
            freelancerProfile: {
              select: {
                user: {
                  select: { name: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyProjects,
};
