'use strict';

const { forbidden } = require('../utils/response');

/**
 * Middleware RBAC (Role-Based Access Control).
 *
 * Dipanggil SETELAH authenticate middleware.
 * Menerima satu atau lebih role yang diizinkan.
 *
 * Penggunaan:
 *   router.post('/projects', authenticate, authorize('client'), createProject)
 *   router.get('/admin/users', authenticate, authorize('admin'), getUsers)
 *   router.get('/contracts/:id', authenticate, authorize('client', 'freelancer', 'admin'), getContract)
 *
 * @param {...string} allowedRoles - Role yang diizinkan mengakses endpoint
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Autentikasi diperlukan.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return forbidden(
        res,
        `Akses ditolak. Hanya ${allowedRoles.join(' atau ')} yang dapat mengakses endpoint ini.`
      );
    }

    return next();
  };
}

module.exports = { authorize };
