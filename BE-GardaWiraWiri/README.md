# 🛡️ Garda Wira Wiri — Backend API

Backend REST API untuk marketplace jasa suruhan **Garda Wira Wiri**.

---

## 🧰 Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express.js | 4.x | HTTP Framework |
| Prisma ORM | 5.x | Database ORM & Migrations |
| PostgreSQL | (via Supabase) | Database |
| JWT | 9.x | Autentikasi |
| bcrypt | 5.x | Hash password |
| express-validator | 7.x | Validasi input |
| helmet | 7.x | Security headers |
| cors | 2.x | CORS policy |

---

## 🚀 Cara Menjalankan Project

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/garda-wira-wiri.git
cd garda-wira-wiri
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Buka `.env` dan isi nilai-nilainya:

```env
# Ambil dari Supabase Dashboard → Project Settings → Database → Connection string
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"

JWT_SECRET="isi-dengan-random-string-minimal-32-karakter"
JWT_REFRESH_SECRET="isi-dengan-random-string-lain"
```

> 💡 **Cara dapat URL Supabase:**
> 1. Buka [supabase.com](https://supabase.com) → Login → Pilih project
> 2. Klik **Settings** → **Database**
> 3. Scroll ke **Connection string** → pilih tab **URI**
> 4. Salin URL-nya (ganti `[YOUR-PASSWORD]` dengan password project)

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Jalankan Migration (setelah model database dibuat)

```bash
npm run db:migrate
```

### 5. Seed Database (opsional)

```bash
npm run db:seed
```

### 6. Jalankan Server

```bash
# Development (dengan hot-reload)
npm run dev

# Production
npm start
```

Server berjalan di: `http://localhost:3000`
Health check: `http://localhost:3000/health`
API base URL: `http://localhost:3000/api/v1`

---

## 📁 Struktur Folder

```
garda-wira-wiri/
├── prisma/
│   ├── schema.prisma          # Database schema (Prisma)
│   ├── seed.js                # Seed data
│   └── migrations/            # Auto-generated migration files
│
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client singleton
│   │   ├── env.js             # Env validation & export
│   │   └── constants.js       # Konstanta global (enum, dll)
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── role.middleware.js    # RBAC authorization
│   │   ├── validate.middleware.js # express-validator handler
│   │   └── error.middleware.js   # Global error & 404 handler
│   │
│   ├── modules/
│   │   ├── auth/              # Login, register, refresh token
│   │   ├── users/             # CRUD user, ganti password
│   │   ├── freelancers/       # Profil, skills, portfolio
│   │   ├── projects/          # CRUD project, filter
│   │   ├── bids/              # Bid management
│   │   ├── contracts/         # Contract lifecycle
│   │   ├── reviews/           # Rating & review
│   │   ├── notifications/     # Notifikasi user
│   │   └── admin/             # Dashboard & manajemen admin
│   │
│   ├── utils/
│   │   ├── response.js        # Format response standar
│   │   ├── jwt.js             # Generate & verify token
│   │   ├── pagination.js      # Helper pagination
│   │   └── notification.helper.js # Trigger notifikasi
│   │
│   └── app.js                 # Express setup & middleware
│
├── server.js                  # Entry point (start server)
├── .env                       # Environment variables (jangan di-commit!)
├── .env.example               # Template .env
├── .gitignore
└── package.json
```

---

## 🔐 Koneksi Prisma ke Supabase

Prisma menggunakan dua URL koneksi berbeda:

| URL | Port | Digunakan untuk |
|---|---|---|
| `DATABASE_URL` | 6543 | Runtime query (via PgBouncer connection pooling) |
| `DIRECT_URL` | 5432 | `prisma migrate` (butuh direct connection, tidak via pooler) |

> **Penting:** `?pgbouncer=true` wajib ada di `DATABASE_URL` agar Prisma tahu
> bahwa koneksi melalui pooler dan menyesuaikan perilakunya.

---

## 📋 NPM Scripts

| Script | Perintah | Keterangan |
|---|---|---|
| `npm run dev` | nodemon server.js | Development dengan hot-reload |
| `npm start` | node server.js | Production |
| `npm run db:migrate` | prisma migrate dev | Buat & jalankan migration baru |
| `npm run db:migrate:deploy` | prisma migrate deploy | Deploy migration ke production |
| `npm run db:generate` | prisma generate | Generate Prisma Client |
| `npm run db:seed` | node prisma/seed.js | Isi data awal |
| `npm run db:studio` | prisma studio | GUI database di browser |
| `npm run db:reset` | prisma migrate reset | Reset DB + jalankan ulang semua migration |

---

## 🧩 Roles

| Role | Kemampuan |
|---|---|
| `client` | Buat project, review bid, konfirmasi selesai, beri review |
| `freelancer` | Bid ke project, update progress, submit hasil |
| `admin` | Kelola semua data, suspend user, lihat statistik |

---

## 📌 Tahap Development

- [x] Fase 1 — Setup project & konfigurasi
- [ ] Fase 2 — Model database (schema.prisma)
- [ ] Fase 3 — Auth & Users
- [ ] Fase 4 — Core business flow (Projects, Bids, Contracts)
- [ ] Fase 5 — Supporting features (Reviews, Notifications)
- [ ] Fase 6 — Admin & Polish
