'use strict';

const { PrismaClient } = require('@prisma/client');
const env = require('./env');

/**
 * Singleton Prisma Client.
 *
 * Di production: satu instance dipakai sepanjang lifetime aplikasi.
 * Di development: cegah hot-reload nodemon membuat koneksi baru tiap save
 * dengan menyimpan instance di global object.
 *
 * Logging:
 *  - development: log query, error, warn
 *  - production : hanya log error
 */

const logLevels = env.isDevelopment
  ? ['query', 'info', 'warn', 'error']
  : ['error'];

let prisma;

if (env.isProduction) {
  prisma = new PrismaClient({ log: logLevels });
} else {
  // Simpan di global agar tidak multiply saat nodemon hot-reload
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ log: logLevels });
  }
  prisma = global.__prisma;
}

/**
 * Test koneksi database. Dipanggil saat startup.
 * Jika gagal, aplikasi tidak akan jalan.
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    throw error;
  }
}

/**
 * Tutup koneksi secara graceful. Dipanggil saat SIGINT/SIGTERM.
 */
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

module.exports = { prisma, connectDatabase, disconnectDatabase };
