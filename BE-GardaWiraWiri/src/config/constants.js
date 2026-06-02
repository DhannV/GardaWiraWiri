'use strict';

/**
 * Konstanta global aplikasi.
 * Sentralisasi di sini agar tidak ada "magic string" berserakan di codebase.
 */

// ---- ROLES ----
const ROLES = Object.freeze({
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  ADMIN: 'admin',
});

// ---- PROJECT STATUS ----
const PROJECT_STATUS = Object.freeze({
  OPEN: 'open',           // Menerima bid
  IN_PROGRESS: 'in_progress', // Bid diterima, contract aktif
  COMPLETED: 'completed', // Client konfirmasi selesai
  CANCELLED: 'cancelled', // Dibatalkan
  CLOSED: 'closed',       // Deadline lewat, tidak ada bid
});

// ---- BID STATUS ----
const BID_STATUS = Object.freeze({
  PENDING: 'pending',     // Menunggu review client
  ACCEPTED: 'accepted',   // Dipilih client
  REJECTED: 'rejected',   // Ditolak client
  WITHDRAWN: 'withdrawn', // Ditarik oleh freelancer
});

// ---- CONTRACT STATUS ----
const CONTRACT_STATUS = Object.freeze({
  ACTIVE: 'active',         // Contract berjalan
  COMPLETED: 'completed',   // Selesai dikonfirmasi client
  CANCELLED: 'cancelled',   // Dibatalkan
  DISPUTED: 'disputed',     // Dalam sengketa
});

// ---- MILESTONE STATUS ----
const MILESTONE_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',   // Freelancer klaim selesai
  COMPLETED: 'completed',   // Client konfirmasi
  REJECTED: 'rejected',
});

// ---- SKILL LEVELS ----
const SKILL_LEVEL = Object.freeze({
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert',
});

// ---- NOTIFICATION TYPES ----
const NOTIFICATION_TYPE = Object.freeze({
  NEW_BID: 'new_bid',
  BID_ACCEPTED: 'bid_accepted',
  BID_REJECTED: 'bid_rejected',
  CONTRACT_CREATED: 'contract_created',
  CONTRACT_COMPLETED: 'contract_completed',
  CONTRACT_CANCELLED: 'contract_cancelled',
  WORK_SUBMITTED: 'work_submitted',
  REVIEW_RECEIVED: 'review_received',
  MILESTONE_COMPLETED: 'milestone_completed',
});

// ---- PAGINATION ----
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

// ---- PROJECT CATEGORIES ----
const PROJECT_CATEGORY = Object.freeze({
  ANTAR_JEMPUT: 'antar_jemput',
  BELANJA: 'belanja',
  PINDAHAN: 'pindahan',
  KEBERSIHAN: 'kebersihan',
  PERBAIKAN: 'perbaikan',
  TITIP_ANTRIAN: 'titip_antrian',
  ADMINISTRASI: 'administrasi',
  LAINNYA: 'lainnya',
});

module.exports = {
  ROLES,
  PROJECT_STATUS,
  BID_STATUS,
  CONTRACT_STATUS,
  MILESTONE_STATUS,
  SKILL_LEVEL,
  NOTIFICATION_TYPE,
  PAGINATION,
  PROJECT_CATEGORY,
};
