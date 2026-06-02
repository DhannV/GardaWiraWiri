'use strict';

const { body, query, param } = require('express-validator');

// =============================================================================
// FREELANCERS VALIDATION
// =============================================================================

/**
 * Query validator GET /freelancers (list + filter + sort + pagination)
 */
const listFreelancersValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page harus bilangan bulat >= 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit harus bilangan bulat 1–100.')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('search maksimal 100 karakter.'),

  query('skill')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('skill maksimal 100 karakter.'),

  query('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('location maksimal 100 karakter.'),

  query('isAvailable')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isAvailable harus "true" atau "false".'),

  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('minRating harus angka antara 0–5.')
    .toFloat(),

  query('maxHourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxHourlyRate harus angka positif.')
    .toFloat(),

  query('sortBy')
    .optional()
    .isIn(['avgRating', 'completedJobs', 'totalEarned', 'createdAt', 'hourlyRate'])
    .withMessage('sortBy tidak valid.'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder harus "asc" atau "desc".'),
];

/**
 * Param :id validator
 */
const freelancerIdValidators = [
  param('id')
    .isUUID(4)
    .withMessage('ID freelancer tidak valid.'),
];

/**
 * PATCH /freelancers/profile — update profil freelancer sendiri
 */
const updateFreelancerProfileValidators = [
  body('bio')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('bio maksimal 2000 karakter.'),

  body('location')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('location maksimal 150 karakter.'),

  body('hourlyRate')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('hourlyRate harus angka positif.')
    .toFloat(),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable harus boolean.')
    .toBoolean(),

  // Skills: array of { skillName, level }
  body('skills')
    .optional()
    .isArray()
    .withMessage('skills harus berupa array.'),

  body('skills.*.skillName')
    .if(body('skills').exists())
    .trim()
    .notEmpty()
    .withMessage('Setiap skill harus memiliki skillName.')
    .isLength({ max: 100 })
    .withMessage('skillName maksimal 100 karakter.'),

  body('skills.*.level')
    .if(body('skills').exists())
    .optional()
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('level harus salah satu dari: beginner, intermediate, expert.'),

  // Portfolio: array of { title, description?, imageUrl?, projectUrl? }
  body('portfolio')
    .optional()
    .isArray()
    .withMessage('portfolio harus berupa array.'),

  body('portfolio.*.title')
    .if(body('portfolio').exists())
    .trim()
    .notEmpty()
    .withMessage('Setiap item portfolio harus memiliki title.')
    .isLength({ max: 200 })
    .withMessage('title portfolio maksimal 200 karakter.'),

  body('portfolio.*.description')
    .if(body('portfolio').exists())
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('description portfolio maksimal 1000 karakter.'),

  body('portfolio.*.imageUrl')
    .if(body('portfolio').exists())
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('imageUrl harus URL yang valid.'),

  body('portfolio.*.projectUrl')
    .if(body('portfolio').exists())
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('projectUrl harus URL yang valid.'),
];

/**
 * Query validator GET /freelancers/:id/reviews
 */
const listReviewsValidators = [
  ...freelancerIdValidators,

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page harus bilangan bulat >= 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit harus bilangan bulat 1–50.')
    .toInt(),

  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('minRating harus integer 1–5.')
    .toInt(),
];

module.exports = {
  listFreelancersValidators,
  freelancerIdValidators,
  updateFreelancerProfileValidators,
  listReviewsValidators,
};
