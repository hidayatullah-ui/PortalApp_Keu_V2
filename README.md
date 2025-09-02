# Portal Sulthan Group - Database Online

Aplikasi portal manajemen untuk Sulthan Group yang menggunakan database MySQL online alih-alih localStorage.

## Fitur

- **Manajemen Pengguna**: CRUD untuk user dengan berbagai role (Super admin, admin, manager, karyawan, marketing, mitra)
- **Manajemen Sertifikat**: Pengelolaan sertifikat SBU Konstruksi, SKK Konstruksi, dan SBU Konsultan
- **Manajemen Marketing**: Pengelolaan nama-nama marketing
- **Input Sertifikat**: Form input data sertifikat dengan perhitungan biaya otomatis
- **Manajemen Keuangan**: Entri transaksi dan laporan keuangan
- **Dashboard**: Visualisasi data dengan grafik dan statistik
- **Import/Export**: Backup dan restore data

## Setup Database

### 1. Buat Database MySQL

Jalankan file `database.sql` di MySQL server Anda:

```sql
mysql -u root -p < database.sql
```

Atau jalankan secara manual:

```sql
CREATE DATABASE sult_portal_db;
USE sult_portal_db;

CREATE TABLE kv_store (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    `value` LONGTEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (`key`),
    INDEX idx_updated_at (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Konfigurasi Database

Edit file `api/config.php` dan sesuaikan dengan konfigurasi database Anda:

```php
$DB_HOST = 'localhost'; // atau IP server database
$DB_NAME = 'sult_portal_db';
$DB_USER = 'sult_portal_user';
$DB_PASS = '#Kopi9976';
```

### 3. Buat User Database

```sql
CREATE USER 'sult_portal_user'@'localhost' IDENTIFIED BY '#Kopi9976';
GRANT ALL PRIVILEGES ON sult_portal_db.* TO 'sult_portal_user'@'localhost';
FLUSH PRIVILEGES;
```

## Struktur File

```
SERVER/
├── api/
│   ├── config.php          # Konfigurasi database dan CORS
│   ├── storage.php         # API key-value store
│   └── upload.php          # API upload file
├── image/                  # Gambar dan logo
├── index.html             # Aplikasi utama (sudah diubah ke database online)
├── database.sql           # Setup database
└── README.md              # Dokumentasi ini
```

## API Endpoints

### Storage API (`api/storage.php`)

- **GET** `?key=<key>` - Ambil data berdasarkan key
- **POST** - Simpan data dengan body JSON `{"key": "key", "value": "value"}`

### Upload API (`api/upload.php`)

- **POST** - Upload file bukti transaksi

## Cara Kerja

1. **Aplikasi menggunakan API `storage.php`** untuk menyimpan dan mengambil data dari database MySQL
2. **Data disimpan dalam format JSON** di tabel `kv_store`
3. **Setiap operasi CRUD** akan memanggil API database online
4. **Data tetap tersimpan** meskipun browser ditutup atau di-refresh

## Keuntungan Database Online

- **Data persisten** - tidak hilang saat browser ditutup
- **Multi-user** - bisa diakses dari berbagai perangkat
- **Backup otomatis** - data tersimpan di server database
- **Skalabilitas** - bisa menangani data yang lebih besar
- **Keamanan** - data tersimpan di server, bukan di browser

## Troubleshooting

### Error "DB connection failed"
- Pastikan MySQL server berjalan
- Periksa kredensial database di `api/config.php`
- Pastikan database `sult_portal_db` sudah dibuat

### Error "method not allowed"
- Pastikan request menggunakan method GET atau POST yang benar
- Periksa CORS settings jika frontend dan backend berbeda domain

### Data tidak tersimpan
- Periksa permission user database
- Pastikan tabel `kv_store` sudah dibuat
- Periksa error log PHP/MySQL

## Default Login

Setelah setup database, gunakan kredensial default:

- **Username**: `superadmin`
- **Password**: `superadmin123`

- **Username**: `admin`
- **Password**: `admin123`

## Backup dan Restore

Aplikasi memiliki fitur import/export data:
- **Export**: Download semua data dalam format JSON
- **Import**: Upload file JSON untuk restore data

## Support

Untuk bantuan teknis, hubungi tim IT Sulthan Group.
