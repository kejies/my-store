# API Toko Top-Up

API Backend sederhana untuk layanan top-up voucher. Project ini dibuat menggunakan **NestJS**.

## Fitur Utama
- **Autentikasi**: Login & Register menggunakan JWT, serta Role (User & Admin).
- **Manajemen Voucher**: Create, Read, Update, dan Delete data category & voucher (Admin Only).
- **Sistem Top-Up & pembelian voucher**: Menggunakan Payment Gateway Midtrans.
- **History Transaksi**: Catatan riwayat pembelian & kode unik voucher yang di generate otomatis.
- **Validasi Data**: Menggunakan `class-validator` untuk memastikan input data aman.

## Tech Stack
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Dokumentasi API**: Swagger UI [http://localhost:3000/documentation](http://localhost:3000/documentation)
- **Language**: TypeScript
