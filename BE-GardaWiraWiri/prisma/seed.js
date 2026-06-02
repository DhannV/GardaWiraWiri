'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * Seed data untuk development & testing.
 * Jalankan dengan: npm run db:seed
 *
 * CATATAN: Script ini akan diperbarui setelah model database dibuat.
 * Saat ini hanya berisi struktur placeholder.
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // ---- Seed akan diisi setelah schema.prisma lengkap ----
  // Contoh yang akan ditambahkan:
  // - 1 admin user
  // - 2 client users
  // - 3 freelancer users dengan profil lengkap
  // - Sample projects, bids, contracts

  console.log('⚠️  Seed belum diimplementasikan. Tunggu tahap pembuatan model database.');
  console.log('✅ Seed selesai.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
