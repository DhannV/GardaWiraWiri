'use strict';

const { PrismaClient, Prisma } = require('@prisma/client');
const env = require('./env');

// =============================================================================
// SINGLETON PRISMA CLIENT
// =============================================================================

/**
 * Konfigurasi logging Prisma.
 *
 * Di development: emit event query ke console agar bisa debug SQL yang dihasilkan.
 * Di production: hanya log error — query log bisa mengekspos data sensitif.
 *
 * Menggunakan format "event" bukan "stdout" agar kita bisa format sendiri
 * dan menambahkan konteks (durasi, file, dsb).
 */
const logConfig = env.isDevelopment
  ? [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ]
  : [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ];

/**
 * Factory: buat PrismaClient baru dengan semua konfigurasi terpasang.
 * Dipisah dari singleton agar bisa di-reuse (test, multi-tenant, dsb).
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: logConfig,
    errorFormat: env.isDevelopment ? 'pretty' : 'minimal',
  });

  // ---- Query logging (development only) ----
  if (env.isDevelopment) {
    client.$on('query', (e) => {
      // Tampilkan query dan durasi — berguna untuk mendeteksi N+1 dan slow query
      const duration = `${e.duration}ms`;
      const flag = e.duration > 500 ? '🐢 SLOW' : e.duration > 100 ? '⚠️ ' : '🔍';
      console.log(`${flag} [Prisma Query] ${duration}`);
      console.log(`   ${e.query}`);
      if (e.params !== '[]') console.log(`   Params: ${e.params}`);
    });

    client.$on('info', (e) => {
      console.info(`ℹ️  [Prisma] ${e.message}`);
    });
  }

  client.$on('warn', (e) => {
    console.warn(`⚠️  [Prisma Warning] ${e.message}`);
  });

  client.$on('error', (e) => {
    console.error(`❌ [Prisma Error] ${e.message}`);
  });

  return client;
}

/**
 * Singleton pattern:
 * - Production  : buat instance sekali, pakai selamanya.
 * - Development : simpan di global object agar nodemon hot-reload tidak
 *   membuat koneksi baru setiap kali file disimpan. Tanpa ini, setiap
 *   save membuka koneksi baru dan lama-kelamaan pool habis.
 */
let prisma;

if (env.isProduction) {
  prisma = createPrismaClient();
} else {
  if (!global.__prismaInstance) {
    global.__prismaInstance = createPrismaClient();
  }
  prisma = global.__prismaInstance;
}

// =============================================================================
// CONNECTION MANAGEMENT
// =============================================================================

/**
 * Tes koneksi ke database saat startup.
 * Menggunakan $queryRaw SELECT 1 karena lebih ringan dari $connect()
 * dan tetap membuktikan query bisa berjalan, bukan sekadar handshake.
 *
 * Jika gagal, lempar error agar server.js bisa menangkap dan exit.
 */
async function connectDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ [Database] Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ [Database] Connection failed:', error.message);
    throw error;
  }
}

/**
 * Tutup semua koneksi dengan bersih.
 * Dipanggil di graceful shutdown (SIGTERM / SIGINT) di server.js.
 */
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 [Database] Disconnected');
}

// =============================================================================
// TRANSACTION UTILITIES
// =============================================================================

/**
 * Jalankan beberapa operasi database dalam satu transaksi.
 * Jika salah satu operasi gagal, semua di-rollback otomatis.
 *
 * Wrapper ini menambahkan:
 * - Logging durasi transaksi
 * - Error wrapping yang konsisten
 *
 * @template T
 * @param {(tx: import('@prisma/client').PrismaClient) => Promise<T>} fn
 * @param {import('@prisma/client').Prisma.TransactionOptions} [options]
 * @returns {Promise<T>}
 *
 * @example
 * const result = await withTransaction(async (tx) => {
 *   const contract = await tx.contract.create({ data: contractData });
 *   await tx.project.update({ where: { id: projectId }, data: { status: 'in_progress' } });
 *   await tx.bid.update({ where: { id: bidId }, data: { status: 'accepted' } });
 *   return contract;
 * });
 */
async function withTransaction(fn, options = {}) {
  const start = Date.now();

  try {
    const result = await prisma.$transaction(fn, {
      maxWait: 5000,   // Tunggu max 5 detik untuk mendapat koneksi dari pool
      timeout: 10000,  // Transaksi harus selesai dalam 10 detik
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      ...options,
    });

    if (env.isDevelopment) {
      console.log(`✅ [Transaction] Completed in ${Date.now() - start}ms`);
    }

    return result;
  } catch (error) {
    if (env.isDevelopment) {
      console.error(`❌ [Transaction] Failed after ${Date.now() - start}ms:`, error.message);
    }
    throw error;
  }
}

/**
 * Jalankan batch operasi independen secara paralel dalam satu roundtrip.
 * Berbeda dengan withTransaction: tidak ada rollback jika salah satu gagal.
 * Gunakan untuk operasi read-only paralel atau write yang tidak saling dependen.
 *
 * @param {import('@prisma/client').PrismaPromise<any>[]} operations
 * @returns {Promise<any[]>}
 *
 * @example
 * const [users, projects, totalCount] = await batchQueries([
 *   prisma.user.findMany({ take: 10 }),
 *   prisma.project.findMany({ take: 10 }),
 *   prisma.user.count(),
 * ]);
 */
async function batchQueries(operations) {
  return prisma.$transaction(operations);
}

// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================

/**
 * Cek apakah error adalah Prisma Known Request Error (P2xxx).
 * Berguna di error handler untuk memberi response yang tepat.
 *
 * @param {unknown} error
 * @returns {error is Prisma.PrismaClientKnownRequestError}
 */
function isPrismaError(error) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Cek apakah error adalah "record not found" (P2025).
 * Gunakan ini agar tidak perlu hardcode string error code di tiap controller.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
function isNotFoundError(error) {
  return isPrismaError(error) && error.code === 'P2025';
}

/**
 * Cek apakah error adalah unique constraint violation (P2002).
 * Contoh: email sudah terdaftar, bid duplikat per project.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
function isUniqueConstraintError(error) {
  return isPrismaError(error) && error.code === 'P2002';
}

/**
 * Cek apakah error adalah foreign key constraint violation (P2003).
 * Contoh: project_id tidak ada di tabel projects.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
function isForeignKeyError(error) {
  return isPrismaError(error) && error.code === 'P2003';
}

/**
 * Ekstrak nama field yang melanggar unique constraint dari error Prisma.
 * Berguna untuk membuat pesan error yang informatif ("email sudah terdaftar").
 *
 * @param {Prisma.PrismaClientKnownRequestError} error
 * @returns {string}
 */
function getUniqueConstraintField(error) {
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.join(', ');
  if (typeof target === 'string') return target;
  return 'field';
}

// =============================================================================
// QUERY HELPERS
// =============================================================================

/**
 * Cek apakah sebuah record ada tanpa mengambil seluruh datanya.
 * Lebih efisien dari findUnique() karena SELECT hanya kolom id.
 *
 * @param {object} model - Prisma model delegate (e.g. prisma.user)
 * @param {object} where - Kondisi Prisma where
 * @returns {Promise<boolean>}
 *
 * @example
 * const exists = await recordExists(prisma.user, { email: 'test@mail.com' });
 */
async function recordExists(model, where) {
  const record = await model.findFirst({ where, select: { id: true } });
  return record !== null;
}

/**
 * Exclude field tertentu dari object hasil query Prisma.
 * Berguna untuk menghapus passwordHash dari response sebelum dikirim ke client.
 *
 * @template T
 * @template {keyof T} K
 * @param {T} obj
 * @param {K[]} keys
 * @returns {Omit<T, K>}
 *
 * @example
 * const user = await prisma.user.findUnique({ where: { id } });
 * return excludeFields(user, ['passwordHash']);
 */
function excludeFields(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Client
  prisma,

  // Connection
  connectDatabase,
  disconnectDatabase,

  // Transactions
  withTransaction,
  batchQueries,

  // Error classification
  isPrismaError,
  isNotFoundError,
  isUniqueConstraintError,
  isForeignKeyError,
  getUniqueConstraintField,

  // Query helpers
  recordExists,
  excludeFields,

  // Re-export Prisma namespace for type usage
  Prisma,
};
