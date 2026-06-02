'use strict';

const { prisma, withTransaction, batchQueries } = require('../../config/prisma');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

// =============================================================================
// FREELANCERS SERVICE
// =============================================================================

/**
 * Seleksi field yang dikembalikan untuk list freelancer (ringkas).
 * Dipisah sebagai konstanta agar tidak duplikasi.
 */
const FREELANCER_LIST_SELECT = {
  id: true,
  bio: true,
  location: true,
  hourlyRate: true,
  avgRating: true,
  totalReviews: true,
  completedJobs: true,
  isAvailable: true,
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
  skills: {
    select: { skillName: true, level: true },
    orderBy: { skillName: 'asc' },
  },
};

/**
 * Bangun where clause Prisma untuk filter list freelancer.
 *
 * Filter yang didukung:
 * - search: nama atau email user (case-insensitive)
 * - skill: nama skill yang dimiliki (contains, insensitive)
 * - location: kota/lokasi (contains, insensitive)
 * - isAvailable: boolean
 * - minRating: float, filter avgRating >= minRating
 * - maxHourlyRate: float, filter hourlyRate <= maxHourlyRate
 *
 * @param {object} filters
 * @returns {object} Prisma where clause
 */
function buildFreelancerWhere(filters) {
  const { search, skill, location, isAvailable, minRating, maxHourlyRate } = filters;

  const where = {};

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  if (skill) {
    where.skills = {
      some: {
        skillName: { contains: skill, mode: 'insensitive' },
      },
    };
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable === 'true';
  }

  if (minRating !== undefined) {
    where.avgRating = { gte: parseFloat(minRating) };
  }

  if (maxHourlyRate !== undefined) {
    where.hourlyRate = { lte: parseFloat(maxHourlyRate) };
  }

  return where;
}

/**
 * Bangun orderBy untuk list freelancer.
 * Default: sort berdasarkan avgRating desc (freelancer terbaik di atas).
 *
 * @param {{ sortBy?: string, sortOrder?: string }} params
 * @returns {object}
 */
function buildFreelancerOrderBy({ sortBy = 'avgRating', sortOrder = 'desc' }) {
  const ALLOWED = ['avgRating', 'completedJobs', 'totalEarned', 'createdAt', 'hourlyRate'];
  const field = ALLOWED.includes(sortBy) ? sortBy : 'avgRating';
  return { [field]: sortOrder === 'asc' ? 'asc' : 'desc' };
}

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

/**
 * List semua freelancer publik dengan filter, sort, dan pagination.
 * Endpoint ini bisa diakses semua role (public browsing).
 *
 * @param {object} queryParams
 * @returns {Promise<{ data, meta }>}
 */
async function findAll(queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const where = buildFreelancerWhere(queryParams);
  const orderBy = buildFreelancerOrderBy(queryParams);

  const [profiles, total] = await batchQueries([
    prisma.freelancerProfile.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: FREELANCER_LIST_SELECT,
    }),
    prisma.freelancerProfile.count({ where }),
  ]);

  return {
    data: profiles,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Detail satu freelancer berdasarkan ID profil (bukan user ID).
 * Sertakan skills, portfolio, dan statistik.
 *
 * @param {string} profileId - UUID dari freelancerProfile.id
 * @returns {Promise<object>}
 */
async function findById(profileId) {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { id: profileId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
      skills: {
        orderBy: { skillName: 'asc' },
      },
      portfolioItems: {
        orderBy: { createdAt: 'desc' },
      },
      // Hitung total bids aktif
      _count: {
        select: { bids: true, contracts: true },
      },
    },
  });

  if (!profile) {
    const error = new Error('Profil freelancer tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  return profile;
}

/**
 * Update profil freelancer milik user yang sedang login.
 *
 * Mendukung:
 * - Update field dasar profil (bio, location, hourlyRate, isAvailable)
 * - Replace skills: jika `skills` dikirim, hapus semua skill lama dan buat baru
 *   (strategi replace-all lebih simpel dari merge untuk awal implementasi)
 * - Tambah item portfolio baru: jika `portfolio` dikirim, buat item baru
 *   (tidak menghapus yang lama — hapus via endpoint terpisah jika diperlukan)
 *
 * Semua operasi dalam satu transaksi.
 *
 * @param {string} userId - Dari JWT
 * @param {object} dto
 * @returns {Promise<object>} Updated profile
 */
async function updateMyProfile(userId, dto) {
  // Cari profil berdasarkan userId
  const existing = await prisma.freelancerProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    const error = new Error('Profil freelancer tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const { bio, location, hourlyRate, isAvailable, skills, portfolio } = dto;

  const result = await withTransaction(async (tx) => {
    // 1. Update field dasar profil
    const profileData = {};
    if (bio !== undefined) profileData.bio = bio || null;
    if (location !== undefined) profileData.location = location || null;
    if (hourlyRate !== undefined) profileData.hourlyRate = hourlyRate || null;
    if (isAvailable !== undefined) profileData.isAvailable = isAvailable;

    const updatedProfile = await tx.freelancerProfile.update({
      where: { userId },
      data: profileData,
    });

    // 2. Replace skills jika dikirim
    if (Array.isArray(skills)) {
      // Hapus semua skill lama
      await tx.freelancerSkill.deleteMany({
        where: { profileId: existing.id },
      });

      // Buat skill baru (jika array tidak kosong)
      if (skills.length > 0) {
        await tx.freelancerSkill.createMany({
          data: skills.map((s) => ({
            profileId: existing.id,
            skillName: s.skillName.trim(),
            level: s.level || 'intermediate',
          })),
          skipDuplicates: true,
        });
      }
    }

    // 3. Tambah portfolio baru jika dikirim
    if (Array.isArray(portfolio) && portfolio.length > 0) {
      await tx.portfolioItem.createMany({
        data: portfolio.map((p) => ({
          profileId: existing.id,
          title: p.title.trim(),
          description: p.description || null,
          imageUrl: p.imageUrl || null,
          projectUrl: p.projectUrl || null,
        })),
      });
    }

    return updatedProfile;
  });

  // Kembalikan profil lengkap setelah update
  return findById(existing.id);
}

/**
 * Ambil review yang diterima oleh freelancer berdasarkan ID profil.
 * Mendukung filter minRating dan pagination.
 *
 * @param {string} profileId - UUID freelancerProfile
 * @param {object} queryParams
 * @returns {Promise<{ data, meta }>}
 */
async function getFreelancerReviews(profileId, queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const { minRating } = queryParams;

  // Pastikan profil ada
  const profile = await prisma.freelancerProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });

  if (!profile) {
    const error = new Error('Profil freelancer tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const where = {
    revieweeId: profile.userId,
    isPublic: true,
  };

  if (minRating) {
    where.rating = { gte: parseInt(minRating, 10) };
  }

  const [reviews, total] = await batchQueries([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        contract: {
          select: {
            project: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

module.exports = {
  findAll,
  findById,
  updateMyProfile,
  getFreelancerReviews,
};
