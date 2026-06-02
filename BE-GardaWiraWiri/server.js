'use strict';

// Load env PERTAMA KALI sebelum apapun, termasuk sebelum import lain
require('dotenv').config();

const app = require('./src/app');
const env = require('./src/config/env');
const { connectDatabase, disconnectDatabase } = require('./src/config/prisma')

// =============================================
// Startup
// =============================================
async function start() {
  try {
    // 1. Koneksi ke database
    await connectDatabase();

    // 2. Jalankan Express server
    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════╗');
      console.log('║     🛡️  GARDA WIRA WIRI API SERVER        ║');
      console.log('╠═══════════════════════════════════════════╣');
      console.log(`║  Status    : Running                      ║`);
      console.log(`║  Port      : ${env.PORT}                          ║`);
      console.log(`║  Env       : ${env.NODE_ENV.padEnd(10)}                 ║`);
      console.log(`║  API       : http://localhost:${env.PORT}${env.API_PREFIX} ║`);
      console.log(`║  Health    : http://localhost:${env.PORT}/health   ║`);
      console.log('╚═══════════════════════════════════════════╝');
      console.log('');
    });

    // =============================================
    // Graceful Shutdown
    // Tutup koneksi dengan bersih saat menerima sinyal OS
    // =============================================
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('🔒 HTTP server closed');

        try {
          await disconnectDatabase();
          console.log('✅ Graceful shutdown complete');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during shutdown:', err);
          process.exit(1);
        }
      });

      // Force exit setelah 10 detik jika shutdown macet
      setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // =============================================
    // Unhandled promise rejection — tangkap error async yang tidak di-catch
    // =============================================
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Promise Rejection at:', promise);
      console.error('   Reason:', reason);
      // Di production sebaiknya shutdown dan restart via process manager
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
