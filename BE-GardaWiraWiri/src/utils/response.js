'use strict';

/**
 * Helper untuk membuat response API yang konsisten.
 *
 * Format standar:
 * {
 *   success: boolean,
 *   message: string,
 *   data: any | null,
 *   meta: object | null,    // untuk pagination
 *   errors: array | null    // untuk validation errors
 * }
 */

/**
 * Response sukses
 * @param {import('express').Response} res
 * @param {object} options
 */
function successResponse(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
  const body = { success: true, message };

  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;

  return res.status(statusCode).json(body);
}

/**
 * Response error
 * @param {import('express').Response} res
 * @param {object} options
 */
function errorResponse(res, { statusCode = 500, message = 'Internal Server Error', errors = null } = {}) {
  const body = { success: false, message };

  if (errors !== null) body.errors = errors;

  return res.status(statusCode).json(body);
}

/**
 * Shorthand untuk response pagination
 */
function paginatedResponse(res, { message = 'Success', data, page, limit, total }) {
  const totalPages = Math.ceil(total / limit);

  return successResponse(res, {
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}

// ---- Shorthand status helpers ----

const ok = (res, data, message = 'Success') =>
  successResponse(res, { statusCode: 200, message, data });

const created = (res, data, message = 'Resource created successfully') =>
  successResponse(res, { statusCode: 201, message, data });

const noContent = (res) => res.status(204).send();

const badRequest = (res, message = 'Bad Request', errors = null) =>
  errorResponse(res, { statusCode: 400, message, errors });

const unauthorized = (res, message = 'Unauthorized') =>
  errorResponse(res, { statusCode: 401, message });

const forbidden = (res, message = 'Forbidden: access denied') =>
  errorResponse(res, { statusCode: 403, message });

const notFound = (res, message = 'Resource not found') =>
  errorResponse(res, { statusCode: 404, message });

const conflict = (res, message = 'Conflict') =>
  errorResponse(res, { statusCode: 409, message });

const unprocessable = (res, message = 'Unprocessable Entity', errors = null) =>
  errorResponse(res, { statusCode: 422, message, errors });

const serverError = (res, message = 'Internal Server Error') =>
  errorResponse(res, { statusCode: 500, message });

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  serverError,
};
