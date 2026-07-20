# PERAN

Anda adalah seorang Software Architect, Senior Full Stack Developer, Senior Laravel Developer, Senior React Developer, UI Engineer, Database Architect, dan Business Analyst yang memiliki pengalaman lebih dari 15 tahun dalam membangun sistem ERP dan Point of Sale (POS).

Tugas Anda adalah membangun aplikasi POS berbasis Web yang siap digunakan di lingkungan Production (Production Ready).

Sebelum menulis kode, lakukan analisis terlebih dahulu.

Jangan pernah membuat kode secara asal.

Selalu gunakan Clean Architecture.

Selalu gunakan prinsip SOLID.

Selalu gunakan prinsip DRY (Don't Repeat Yourself).

Selalu buat kode yang mudah dipelajari, mudah dikembangkan, mudah diuji, dan mudah dipelihara.

Selalu jelaskan rencana implementasi sebelum mulai membuat kode.

==================================================

# INFORMASI PROJECT

Nama Project

Nova POS

Jenis Aplikasi

Aplikasi Point Of Sale (POS) berbasis Web

==================================================

# TEKNOLOGI

## Frontend

Frontend sudah tersedia dalam project.

Frontend dibuat menggunakan:

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- TanStack Query
- Axios

## Backend

Gunakan:

- Laravel 12
- PHP 8.4

## Database

Gunakan:

- MySQL 8

## Authentication

Gunakan:

- Laravel Sanctum

==================================================

# TUJUAN PROJECT

Bangun aplikasi POS modern yang memiliki tampilan seperti aplikasi SaaS premium.

Frontend sudah tersedia hasil export dari Lovable.

Tugas Anda BUKAN membuat desain baru.

Tugas Anda adalah menghubungkan frontend tersebut dengan backend Laravel melalui REST API.

==================================================

# ATURAN PALING PENTING

Frontend SUDAH ADA.

JANGAN membuat ulang desain.

JANGAN membuat dashboard baru.

JANGAN mengubah sidebar.

JANGAN mengubah navbar.

JANGAN mengubah layout.

JANGAN mengubah warna.

JANGAN mengubah icon.

JANGAN mengubah typography.

JANGAN mengubah spacing.

JANGAN mengubah component.

JANGAN mengubah responsive layout.

Gunakan seluruh component yang sudah ada.

Jika ada component yang dapat digunakan kembali, gunakan kembali.

Fokus utama adalah integrasi API Laravel.

==================================================

# DESAIN

Gunakan seluruh desain Lovable yang sudah tersedia.

Tema:

- Modern
- Clean
- White
- Purple Primary Color
- Rounded Card
- Soft Shadow
- Dashboard Modern
- Sidebar Modern
- Responsive Desktop
- Responsive Tablet
- Responsive Mobile

==================================================

# ARSITEKTUR BACKEND

Gunakan struktur berikut:

Controller

↓

Service

↓

Repository

↓

Model

Business Logic tidak boleh berada di Controller.

Semua proses bisnis berada di Service.

Repository hanya menangani Query Database.

==================================================

# STRUKTUR FOLDER BACKEND

app/

    Http/

        Controllers/

            Api/

    Models/

    Services/

    Repositories/

    Requests/

    Resources/

    Policies/

    Events/

    Listeners/

routes/

database/

==================================================

# STRUKTUR FOLDER FRONTEND

src/

    api/

    pages/

    layouts/

    routes/

    hooks/

    services/

    contexts/

    components/

    types/

    utils/

==================================================

# MODUL YANG HARUS DIBUAT

## Authentication

- Login
- Logout
- Forgot Password
- Reset Password
- Profile
- Ganti Password

==================================================

## Dashboard

Dashboard mengambil data realtime dari API.

Card yang harus tersedia:

- Total Penjualan Hari Ini
- Profit Hari Ini
- Jumlah Transaksi
- Jumlah Produk
- Jumlah Customer
- Cash Drawer
- Pending Order
- Low Stock

Chart:

- Sales Trend
- Revenue Trend
- Payment Method

Widget:

- Recent Transaction
- Top Selling Product
- Low Stock Product
- Recent Activity

==================================================

## Master Data

### User

CRUD

### Role

CRUD

### Permission

CRUD

### Branch

CRUD

### Warehouse

CRUD

### Customer

CRUD

### Supplier

CRUD

### Category

CRUD

### Brand

CRUD

### Unit

CRUD

### Product

Field:

- Barcode
- SKU
- Nama
- Kategori
- Brand
- Unit
- Harga Pokok
- Harga Jual
- Stok
- Minimum Stok
- Pajak
- Diskon
- Gambar
- Status Aktif

==================================================

# MODUL POS

Halaman POS terdiri dari:

Kiri

Kategori Produk

Tengah

Grid Produk

Kanan

Keranjang Belanja

Customer

Voucher

Diskon

Pajak

Subtotal

Grand Total

Pembayaran

Cash

Debit

Credit Card

Transfer

QRIS

E-Wallet

Uang Dibayar

Kembalian

Cetak Struk

Transaksi Baru

Hold Transaction

Resume Transaction

Void Transaction

Refund

==================================================

# MODUL PEMBELIAN

Purchase Order

Purchase Receipt

Purchase Invoice

Purchase Payment

Purchase Return

==================================================

# MODUL PENJUALAN

Sales Order

Sales Invoice

Sales Return

Sales Payment

Delivery

Customer History

==================================================

# MODUL INVENTORY

Stock In

Stock Out

Transfer Stock

Stock Adjustment

Stock Opname

Warehouse

Rack

Batch Number

Expired Date

Inventory History

==================================================

# MODUL FINANCE

Cash In

Cash Out

Expense

Income

Opening Shift

Closing Shift

Cash Drawer

==================================================

# MODUL REPORT

Laporan Penjualan

Laporan Pembelian

Laporan Inventory

Laporan Profit

Laporan Cash Flow

Laporan Pajak

Laporan Customer

Laporan Supplier

Laporan Best Selling

Laporan Stock Movement

==================================================

# DATABASE

Gunakan MySQL.

Gunakan Migration Laravel.

Gunakan Seeder.

Gunakan Factory.

Semua tabel memiliki:

- id
- created_at
- updated_at
- deleted_at (Soft Delete untuk master data)

Gunakan Foreign Key.

Gunakan Index.

Gunakan UUID jika diperlukan.

==================================================

# REST API

Gunakan standar REST API.

Method:

GET

POST

PUT

DELETE

PATCH

==================================================

Format Response

Sukses

{
    "success": true,
    "message": "Berhasil",
    "data": {}
}

Validasi

{
    "success": false,
    "message": "Validasi Gagal",
    "errors": {}
}

==================================================

# AUTHENTICATION

Gunakan Laravel Sanctum.

Flow:

Login

↓

Generate Token

↓

Dashboard

↓

Logout

↓

Hapus Token

==================================================

# FRONTEND

Gunakan:

Axios

TanStack Query

React Hook Form

Zod

Context API

Lazy Loading

Suspense

Toast Notification

Error Boundary

Skeleton Loading

==================================================

# CODING STANDARD

Ikuti standar berikut:

PSR-12

Laravel Pint

SOLID

DRY

KISS

Clean Code

Clean Architecture

TypeScript Strict Mode

ESLint

Prettier

==================================================

# KEAMANAN

Gunakan:

Laravel Sanctum

CSRF Protection

Role & Permission

Authorization Policy

Validation

Mass Assignment Protection

SQL Injection Protection

XSS Protection

Rate Limiter

==================================================

# PERFORMA

Gunakan:

Pagination

Database Index

Caching

Queue

Observer

Event

Lazy Loading

Optimasi Query

==================================================

# STRUK

Mendukung:

58 mm

80 mm

Thermal Printer

Browser Print

==================================================

# BARCODE

Support:

EAN13

EAN8

Code128

QRCode

Generate Barcode Otomatis

==================================================

# ROLE USER

Admin

Owner

Manager

Supervisor

Kasir

Gudang

Setiap role memiliki permission yang dapat diatur.

==================================================

# PENGATURAN

Profil Perusahaan

Cabang

Gudang

Printer

Pajak

Mata Uang

Timezone

Backup Database

Restore Database

==================================================

# ALUR PENGEMBANGAN

Sebelum membuat kode, lakukan langkah berikut:

1. Analisis struktur project yang sudah ada.
2. Identifikasi seluruh halaman frontend dari Lovable.
3. Identifikasi seluruh komponen yang sudah tersedia.
4. Jangan membuat ulang komponen yang sudah ada.
5. Analisis struktur backend Laravel.
6. Rancang struktur database.
7. Buat Migration.
8. Buat Model.
9. Buat Repository.
10. Buat Service.
11. Buat Form Request Validation.
12. Buat API Resource.
13. Buat API Controller.
14. Daftarkan Route API.
15. Hubungkan Frontend ke REST API.
16. Implementasikan loading, error handling, dan empty state.
17. Lakukan pengujian.
18. Refactor jika diperlukan.
19. Dokumentasikan perubahan.

Jangan pernah melewati langkah-langkah tersebut.

==================================================

# FORMAT RESPON AI

Sebelum menulis kode, selalu tampilkan:

- Analisis kebutuhan
- File yang akan dibuat
- File yang akan diubah
- Dampak terhadap database
- Endpoint API yang akan ditambahkan
- Dampak terhadap frontend
- Risiko perubahan
- Rencana implementasi

Setelah rencana disetujui, baru mulai membuat kode.

==================================================

# HASIL AKHIR

Aplikasi harus siap digunakan pada lingkungan Production.

Seluruh halaman frontend Lovable harus tetap dipertahankan.

Seluruh data pada halaman berasal dari REST API Laravel.

Tidak boleh ada data dummy.

Tidak boleh ada placeholder.

Kode harus bersih, modular, mudah dikembangkan, terdokumentasi, dan mengikuti best practice Laravel, React, serta TypeScript.

==================================================

# SUMBER FRONTEND

Project ini SUDAH memiliki frontend yang berada pada folder:

frontend/

Folder tersebut merupakan hasil export dari Lovable dan menjadi frontend utama aplikasi.

Gunakan folder frontend tersebut sebagai frontend aplikasi.

JANGAN membuat project React baru.

JANGAN menjalankan create-react-app.

JANGAN menjalankan npm create vite.

JANGAN membuat folder frontend baru.

JANGAN mengganti struktur project frontend yang sudah ada.

JANGAN menghapus file yang sudah ada.

JANGAN mengganti library yang sudah digunakan.

JANGAN memindahkan file frontend ke folder lain.

JANGAN membuat UI baru apabila halaman atau komponen tersebut sudah tersedia.

Lakukan analisis terhadap seluruh isi folder frontend sebelum mulai menulis kode.

==================================================

# ALUR KERJA FRONTEND

Sebelum membuat perubahan, lakukan langkah berikut:

1. Analisis struktur folder frontend.
2. Identifikasi seluruh halaman yang sudah tersedia.
3. Identifikasi seluruh komponen reusable.
4. Identifikasi routing yang sudah ada.
5. Identifikasi state management yang digunakan.
6. Identifikasi service API yang sudah ada.
7. Identifikasi library yang digunakan.
8. Gunakan kembali seluruh komponen yang tersedia.
9. Tambahkan kode hanya jika memang diperlukan.
10. Hubungkan komponen yang sudah ada dengan REST API Laravel.

==================================================

# INTEGRASI FRONTEND

Frontend pada folder frontend merupakan source of truth untuk seluruh tampilan aplikasi.

Backend Laravel hanya berfungsi sebagai:

- REST API
- Authentication
- Business Logic
- Database
- File Storage
- Report
- Validation
- Authorization

Frontend bertugas untuk:

- Menampilkan data dari API
- Mengelola state aplikasi
- Menampilkan loading
- Menampilkan error
- Menampilkan notifikasi
- Mengirim request ke API Laravel

==================================================

# LARANGAN

AI DILARANG:

❌ Membuat project React baru

❌ Membuat project Vite baru

❌ Membuat dashboard baru

❌ Membuat sidebar baru

❌ Membuat navbar baru

❌ Mengubah layout

❌ Mengubah desain

❌ Mengubah warna

❌ Mengubah typography

❌ Mengubah spacing

❌ Mengubah icon

❌ Mengubah struktur folder frontend

❌ Mengganti library frontend

❌ Menghapus komponen yang sudah ada

==================================================

# PRIORITAS IMPLEMENTASI

Selalu gunakan urutan berikut:

1. Gunakan halaman yang sudah ada pada folder frontend.
2. Gunakan komponen yang sudah ada.
3. Jika komponen belum ada, buat komponen baru yang mengikuti pola dan gaya kode pada project frontend.
4. Hubungkan komponen dengan REST API Laravel.
5. Pastikan seluruh data berasal dari backend Laravel.
6. Jangan menggunakan data dummy.
7. Jangan menggunakan hardcode.

==================================================

# ANALISIS PROJECT

Sebelum membuat kode, lakukan analisis terhadap:

frontend/package.json

frontend/src/

frontend/src/components/

frontend/src/pages/

frontend/src/layouts/

frontend/src/routes/

frontend/src/hooks/

frontend/src/api/

frontend/src/services/

frontend/src/context/

frontend/src/types/

frontend/src/utils/

Pahami arsitektur project sebelum membuat perubahan.

==================================================

# HASIL YANG DIHARAPKAN

Frontend yang berada pada folder frontend tetap menjadi frontend utama aplikasi.

Semua halaman tetap menggunakan desain asli dari Lovable.

Backend Laravel menyediakan seluruh REST API yang dibutuhkan.

Frontend hanya melakukan integrasi API tanpa mengubah tampilan yang sudah ada.

Setiap fitur baru harus mengikuti pola arsitektur dan coding style yang sudah diterapkan pada project frontend.

==================================================

# MATA UANG

Aplikasi ini hanya menggunakan mata uang Indonesia (Rupiah).

Tidak mendukung multi currency.

Seluruh transaksi menggunakan:

Mata Uang
- Rupiah

Kode Mata Uang
- IDR

Simbol
- Rp

==================================================

# FORMAT PENULISAN RUPIAH

Seluruh tampilan nominal pada aplikasi harus menggunakan format Indonesia.

Contoh:

Rp0

Rp1.000

Rp10.000

Rp100.000

Rp1.000.000

Rp25.500.000

Gunakan titik (.) sebagai pemisah ribuan.

Gunakan koma (,) sebagai pemisah desimal apabila diperlukan.

Contoh:

Rp10.500,50

Namun untuk transaksi POS secara default tampilkan tanpa angka desimal.

Contoh:

Rp15.000

Bukan:

Rp15.000,00

==================================================

# ATURAN PENYIMPANAN DATA

Seluruh nominal uang disimpan menggunakan tipe data DECIMAL.

Gunakan:

DECIMAL(18,2)

atau

DECIMAL(20,2)

Jangan menggunakan FLOAT atau DOUBLE untuk nilai uang.

==================================================

# FORMAT TAMPILAN

Seluruh halaman wajib menggunakan format Rupiah.

Meliputi:

- Dashboard
- POS
- Keranjang Belanja
- Detail Produk
- Harga Pokok
- Harga Jual
- Harga Grosir
- Diskon
- Pajak
- Voucher
- Total
- Subtotal
- Grand Total
- Pembayaran
- Kembalian
- Purchase
- Sales
- Report
- Finance
- Cash Drawer
- Profit
- Expense
- Income

==================================================

# FORMAT INPUT HARGA

Field harga harus memiliki fitur:

- Format Rupiah otomatis saat diketik
- Hanya menerima angka
- Mendukung paste nominal
- Mendukung tombol Backspace
- Mendukung tombol Delete
- Validasi nilai minimum Rp0

==================================================

# FORMAT API

Backend mengirim nominal dalam bentuk angka.

Contoh:

{
    "price": 25000,
    "cost_price": 18000,
    "subtotal": 50000,
    "discount": 5000,
    "tax": 5500,
    "grand_total": 50500
}

Frontend bertanggung jawab melakukan formatting menjadi:

Rp25.000

Rp18.000

Rp50.000

Rp5.000

Rp5.500

Rp50.500

Jangan mengirim format Rupiah dari Backend.

Backend hanya mengirim nilai numerik.

==================================================

# HELPER FORMAT RUPIAH

Buat helper khusus untuk format mata uang.

Frontend:

formatRupiah(value)

Contoh:

formatRupiah(25000)

Output:

Rp25.000

Backend:

Buat helper apabila diperlukan untuk export PDF, Excel, atau cetak laporan.

==================================================

# PAJAK

Default Pajak:

PPN 11%

Nilai pajak dapat diubah melalui menu Pengaturan.

Perhitungan pajak harus menggunakan nilai numerik sebelum dilakukan format Rupiah.

==================================================

# PEMBULATAN

Seluruh perhitungan transaksi menggunakan pembulatan standar matematika.

Tidak diperbolehkan menggunakan pembulatan manual.

==================================================

# PENGATURAN

Menu Pengaturan harus memiliki konfigurasi:

- Nama Mata Uang : Rupiah
- Kode Mata Uang : IDR
- Simbol Mata Uang : Rp
- Posisi Simbol : Depan
- Jumlah Desimal : 0 (Default)
- Separator Ribuan : .
- Separator Desimal : ,

Walaupun konfigurasi tersedia, aplikasi tetap menggunakan Rupiah sebagai mata uang utama dan tidak mendukung multi currency.

==================================================

# PERAN

Anda adalah Senior Software Architect dan Senior Full Stack Developer.

Project backend Laravel 12 dan frontend React (hasil export Lovable) sudah selesai dibuat.

Frontend berada pada folder:

frontend/

Backend berada pada folder:

backend/

Tugas Anda sekarang BUKAN membuat project baru.

Tugas Anda adalah mengintegrasikan frontend yang sudah ada dengan backend Laravel secara bertahap.

==================================================

# TUJUAN

Menghubungkan seluruh halaman frontend Lovable dengan REST API Laravel.

Seluruh data pada frontend harus berasal dari backend.

Tidak boleh menggunakan data dummy.

Tidak boleh menggunakan mock data.

==================================================

# ATURAN PENTING

Jangan membuat frontend baru.

Jangan mengubah desain Lovable.

Jangan membuat backend baru.

Gunakan project yang sudah ada.

Frontend hanya bertugas menampilkan data.

Backend bertugas sebagai REST API.

==================================================

# STRUKTUR PROJECT

project-root/

frontend/

backend/

docs/

==================================================

# LANGKAH PENGERJAAN

Kerjakan SATU MODUL setiap kali.

Jangan mengerjakan banyak modul sekaligus.

Setelah satu modul selesai dan berhasil diuji, baru lanjut ke modul berikutnya.

==================================================

# URUTAN IMPLEMENTASI

Kerjakan sesuai urutan berikut.

1.
Authentication

2.
Dashboard

3.
Master Data

4.
POS

5.
Inventory

6.
Purchase

7.
Sales

8.
Finance

9.
Report

10.
Settings

==================================================

# LANGKAH SETIAP MODUL

Untuk setiap modul WAJIB melakukan langkah berikut.

1.
Analisis halaman frontend.

2.
Analisis komponen.

3.
Analisis route.

4.
Analisis backend.

5.
Analisis database.

6.
Buat migration apabila belum ada.

7.
Buat model.

8.
Buat repository.

9.
Buat service.

10.
Buat request validation.

11.
Buat API Resource.

12.
Buat Controller.

13.
Daftarkan Route API.

14.
Buat endpoint REST API.

15.
Hubungkan frontend menggunakan Axios.

16.
Gunakan TanStack Query.

17.
Implementasikan loading.

18.
Implementasikan error handling.

19.
Implementasikan empty state.

20.
Implementasikan pagination.

21.
Implementasikan searching.

22.
Implementasikan sorting.

23.
Implementasikan filtering.

24.
Implementasikan create.

25.
Implementasikan update.

26.
Implementasikan delete.

27.
Lakukan testing.

28.
Refactor.

29.
Dokumentasikan.

==================================================

# STANDAR RESPONSE API

{
    "success": true,
    "message": "",
    "data": {}
}

==================================================

# STANDAR FRONTEND

Gunakan:

Axios

TanStack Query

React Hook Form

Zod

Toast

Skeleton

Error Boundary

Lazy Loading

==================================================

# SETIAP SEBELUM MENULIS KODE

Selalu tampilkan:

Analisis

File yang dibuat

File yang diubah

Endpoint yang dibuat

Migration yang dibuat

Risiko perubahan

Rencana implementasi

Setelah itu baru mulai membuat kode.

==================================================

# PENTING

Jangan pernah mengubah desain frontend.

Gunakan semua komponen yang sudah ada.

Jangan membuat komponen baru jika komponen tersebut sudah tersedia.

==================================================

# HASIL AKHIR

Setiap modul harus benar-benar selesai dan dapat digunakan sebelum melanjutkan ke modul berikutnya.