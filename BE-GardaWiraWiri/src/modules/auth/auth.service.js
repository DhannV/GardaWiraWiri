'use strict';

const bcrypt = require('bcrypt');
const env = require('../../config/env');
const {
  prisma,
  withTransaction,
  excludeFields,
  isUniqueConstraintError,
  getUniqueConstraintField,
} = require('../../config/prisma');
const { generateTokenPair } = require('../../utils/jwt');

// =============================================================================
// AUTH SERVICE
// Seluruh logika bisnis autentikasi ada di sini.
// Controller hanya memanggil service dan meneruskan hasilnya ke response.
//
// Prinsip:
//  - Service TIDAK boleh import request/response Express
//  - Service boleh throw Error — controller yang menangkapnya
//  - Gunakan withTransaction untuk operasi multi-tabel (register)
// =============================================================================

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Hash password menggunakan bcrypt.
 * Salt rounds diambil dari env (default 12 — keseimbangan antara keamanan
 * dan performa. Setiap +1 membutuhkan 2x waktu hashing).
 *
 * @param {string} plainPassword
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Verifikasi password plain text terhadap hash yang tersimpan.
 * bcrypt.compare aman terhadap timing attack (selalu berjalan ~waktu sama).
 *
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Buat DTO user untuk response — tanpa passwordHash dan field internal.
 * Selalu gunakan fungsi ini sebelum mengembalikan data user ke client.
 *
 * @param {object} user - Raw user dari Prisma query
 * @param {object} [profile] - clientProfile atau freelancerProfile (opsional)
 * @returns {object}
 */
function formatUserResponse(user, profile = null) {
  const safeUser = excludeFields(user, ['passwordHash']);

  if (profile) {
    safeUser.profile = excludeFields(profile, ['createdAt', 'updatedAt', 'userId']);
  }

  return safeUser;
}

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

/**
 * Register user baru.
 *
 * Alur:
 * 1. Hash password
 * 2. Buka transaksi
 * 3. Buat record di tabel users
 * 4. Buat profil di tabel client_profiles atau freelancer_profiles
 * 5. Generate token pair
 * 6. Return user data + token
 *
 * Semua operasi DB dalam satu transaksi — jika pembuatan profil gagal,
 * record user juga di-rollback (tidak ada user tanpa profil).
 *
 * @param {{ name: string, email: string, password: string, role: string, phone?: string }} dto
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
async function register(dto) {
  const { name, email, password, role, phone } = dto;

  const passwordHash = await hashPassword(password);

  try {
    const result = await withTransaction(async (tx) => {
      // Buat user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          phone: phone || null,
        },
      });

      // Buat profil sesuai role dalam transaksi yang sama
      let profile = null;

      if (role === 'client') {
        profile = await tx.clientProfile.create({
          data: { userId: user.id },
        });
      } else if (role === 'freelancer') {
        profile = await tx.freelancerProfile.create({
          data: { userId: user.id },
        });
      }
      // admin tidak punya profil terpisah

      return { user, profile };
    });

    // Generate token setelah transaksi sukses
    const tokens = generateTokenPair(result.user);

    // Update lastLoginAt secara async (tidak blocking, tidak kritis)
    prisma.user
      .update({
        where: { id: result.user.id },
        data: { lastLoginAt: new Date() },
      })
      .catch((err) => console.error('[Auth] Failed to update lastLoginAt:', err.message));

    return {
      user: formatUserResponse(result.user, result.profile),
      ...tokens,
    };
  } catch (error) {
    // Tangkap unique constraint (email/phone sudah terdaftar)
    if (isUniqueConstraintError(error)) {
      const field = getUniqueConstraintField(error);
      const appError = new Error(
        field.includes('email')
          ? 'Email sudah terdaftar. Gunakan email lain atau login.'
          : `Data dengan ${field} sudah terdaftar.`
      );
      appError.statusCode = 409;
      throw appError;
    }
    throw error;
  }
}

/**
 * Login user.
 *
 * Alur:
 * 1. Cari user by email
 * 2. Cek akun aktif
 * 3. Verifikasi password
 * 4. Update lastLoginAt
 * 5. Ambil profil sesuai role
 * 6. Generate token pair
 *
 * Pesan error untuk email/password salah dibuat SAMA SENGAJA
 * agar tidak bisa ditebak apakah email terdaftar atau tidak (user enumeration).
 *
 * @param {{ email: string, password: string }} dto
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
async function login(dto) {
  const { email, password } = dto;

  const GENERIC_ERROR = 'Email atau password salah.';

  // Cari user — sertakan passwordHash untuk verifikasi
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // User tidak ditemukan — error sama dengan password salah (anti-enumeration)
  if (!user) {
    const error = new Error(GENERIC_ERROR);
    error.statusCode = 401;
    throw error;
  }

  // Akun dinonaktifkan
  if (!user.isActive) {
    const error = new Error('Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan.');
    error.statusCode = 403;
    throw error;
  }

  // Verifikasi password
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error(GENERIC_ERROR);
    error.statusCode = 401;
    throw error;
  }

  // Update lastLoginAt (fire and forget)
  prisma.user
    .update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    .catch((err) => console.error('[Auth] Failed to update lastLoginAt:', err.message));

  // Ambil profil sesuai role
  let profile = null;
  if (user.role === 'client') {
    profile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
    });
  } else if (user.role === 'freelancer') {
    profile = await prisma.freelancerProfile.findUnique({
      where: { userId: user.id },
    });
  }

  const tokens = generateTokenPair(user);

  return {
    user: formatUserResponse(user, profile),
    ...tokens,
  };
}

/**
 * Ambil data user yang sedang login beserta profilnya.
 * Dipanggil dari endpoint GET /auth/me (sudah melewati authenticate middleware).
 *
 * @param {string} userId - Dari req.user.id (JWT payload)
 * @returns {Promise<object>}
 */
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clientProfile: true,
      freelancerProfile: {
        include: {
          skills: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Akun Anda telah dinonaktifkan.');
    error.statusCode = 403;
    throw error;
  }

  const safeUser = excludeFields(user, ['passwordHash']);

  return safeUser;
}

/**
 * Ganti password user yang sedang login.
 *
 * Alur:
 * 1. Ambil user dengan passwordHash dari DB
 * 2. Verifikasi currentPassword
 * 3. Hash newPassword
 * 4. Update ke DB
 *
 * Service ini membutuhkan currentPassword sebagai verifikasi eksplisit
 * bahwa yang mengganti adalah pemilik akun (bukan token yang dicuri).
 *
 * @param {string} userId
 * @param {{ currentPassword: string, newPassword: string }} dto
 * @returns {Promise<void>}
 */
async function changePassword(userId, dto) {
  const { currentPassword, newPassword } = dto;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    const error = new Error('User tidak ditemukan atau akun tidak aktif.');
    error.statusCode = 404;
    throw error;
  }

  // Verifikasi password lama
  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    const error = new Error('Password saat ini tidak sesuai.');
    error.statusCode = 401;
    throw error;
  }

  // Hash dan simpan password baru
  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  // Export helper agar bisa dipakai module lain jika perlu
  hashPassword,
  verifyPassword,
};
