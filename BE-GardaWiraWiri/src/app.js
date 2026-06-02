'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// ---- Import Routes ----
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const clientRoutes = require('./modules/clients/clients.routes');
const freelancerRoutes = require('./modules/freelancers/freelancers.routes');
const projectRoutes = require('./modules/projects/projects.routes');
const bidRoutes = require('./modules/bids/bids.routes');
const contractRoutes = require('./modules/contracts/contracts.routes');
const reviewRoutes = require('./modules/reviews/reviews.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const adminRoutes = require('./modules/admin/admin.routes');

// =============================================
// Inisialisasi Express App
// =============================================
const app = express();

// =============================================
// Security Middleware
// =============================================

// Helmet: set berbagai HTTP security headers (XSS, clickjacking, dll)
app.use(helmet());

// CORS: izinkan request dari origin yang terdaftar
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (Postman, curl, mobile app)
      if (!origin) return callback(null, true);

      if (env.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS policy.`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Rate Limiting: batasi jumlah request per IP per window
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi nanti.',
  },
  skip: (req) => {
    // Skip rate limiting untuk health check endpoint
    return req.path === '/health';
  },
});

app.use(limiter);

// =============================================
// General Middleware
// =============================================

// Parse JSON body (max 10mb untuk upload data besar)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded body (form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Kompresi response (gzip)
app.use(compression());

// HTTP request logger (hanya di development)
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  // Di production, log format lebih compact
  app.use(morgan('combined'));
}

// =============================================
// Health Check Endpoint
// Digunakan oleh load balancer / monitoring tool
// =============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Garda Wira Wiri API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// =============================================
// API Routes
// Semua route di-prefix dengan /api/v1
// =============================================
const API = env.API_PREFIX; // default: /api/v1

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/clients`, clientRoutes);
app.use(`${API}/freelancers`, freelancerRoutes);
app.use(`${API}/projects`, projectRoutes);
app.use(`${API}/bids`, bidRoutes);
app.use(`${API}/contracts`, contractRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/admin`, adminRoutes);

// =============================================
// 404 Handler — HARUS setelah semua route
// =============================================
app.use(notFoundHandler);

// =============================================
// Global Error Handler — HARUS paling terakhir
// =============================================
app.use(errorHandler);

module.exports = app;
