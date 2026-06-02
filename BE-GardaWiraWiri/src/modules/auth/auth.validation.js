'use strict';

const { body } = require('express-validator');

// =============================================================================
// AUTH VALIDATORS
// Setiap fungsi mengembalikan array rule yang siap dipakai di route definition.
// Diletakkan sebelum validate middleware dan controller.
//
// Pola penggunaan di route:
//   router.post('/register', registerValidators, validate, authController.register)
// =============================================================================

/**
 * Validator untuk POST /auth/register
 *
 * Aturan bisnis yang di-enforce di sini:
 * - role hanya boleh 'client' atau 'freelancer' (admin dibuat manual/seeder)
 * - password min 8 karakter, harus ada huruf besar, kecil, dan angka
 * - phone opsional tapi jika diisi harus format Indonesia (+62 atau 0)
 * - name tidak boleh hanya spasi (trim dulu, lalu cek panjang)
 */
const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama wajib diisi.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus antara 2–100 karakter.')
    .matches(/^[a-zA-Z\s.'"-]+$/)
    .withMessage('Nama hanya boleh berisi huruf, spasi, dan tanda baca umum.'),

  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email wajib diisi.')
    .isEmail()
    .withMessage('Format email tidak valid.')
    .isLength({ max: 255 })
    .withMessage('Email maksimal 255 karakter.'),

  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi.')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password harus antara 8–72 karakter.')
    .matches(/[A-Z]/)
    .withMessage('Password harus mengandung minimal satu huruf kapital.')
    .matches(/[a-z]/)
    .withMessage('Password harus mengandung minimal satu huruf kecil.')
    .matches(/[0-9]/)
    .withMessage('Password harus mengandung minimal satu angka.'),

  body('role')
    .notEmpty()
    .withMessage('Role wajib diisi.')
    .isIn(['client', 'freelancer'])
    .withMessage('Role hanya boleh "client" atau "freelancer".'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^(\+62|0)[0-9]{8,12}$/)
    .withMessage('Nomor telepon tidak valid. Gunakan format 08xx atau +628xx.'),
];

/**
 * Validator untuk POST /auth/login
 */
const loginValidators = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email wajib diisi.')
    .isEmail()
    .withMessage('Format email tidak valid.'),

  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi.'),
];

/**
 * Validator untuk PATCH /auth/change-password
 *
 * Membutuhkan currentPassword untuk verifikasi identitas,
 * lalu newPassword dengan aturan yang sama seperti register.
 * confirmPassword harus cocok dengan newPassword.
 */
const changePasswordValidators = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Password saat ini wajib diisi.'),

  body('newPassword')
    .notEmpty()
    .withMessage('Password baru wajib diisi.')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password baru harus antara 8–72 karakter.')
    .matches(/[A-Z]/)
    .withMessage('Password baru harus mengandung minimal satu huruf kapital.')
    .matches(/[a-z]/)
    .withMessage('Password baru harus mengandung minimal satu huruf kecil.')
    .matches(/[0-9]/)
    .withMessage('Password baru harus mengandung minimal satu angka.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Password baru tidak boleh sama dengan password saat ini.');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Konfirmasi password wajib diisi.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Konfirmasi password tidak cocok dengan password baru.');
      }
      return true;
    }),
];

module.exports = {
  registerValidators,
  loginValidators,
  changePasswordValidators,
};
