'use strict';

const { validationResult } = require('express-validator');
const { unprocessable } = require('../utils/response');

/**
 * Middleware untuk menangkap hasil validasi express-validator.
 *
 * Diletakkan SETELAH array validator di route definition:
 *   router.post('/register', [...validators], validate, controller)
 *
 * Jika ada error validasi → 422 Unprocessable Entity dengan daftar error.
 * Jika bersih → lanjut ke controller.
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return unprocessable(res, 'Validasi gagal. Periksa kembali data yang dikirim.', formattedErrors);
  }

  return next();
}

module.exports = { validate };
