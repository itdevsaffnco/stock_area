# Desain Sistem Aplikasi Stock Area

## 1. Arsitektur Project
Sistem menggunakan arsitektur **Headless** dengan pemisahan antara Frontend dan Backend.
- **Frontend**: React.js (Single Page Application)
- **Backend**: Laravel (REST API)
- **Komunikasi**: JSON via HTTP/HTTPS
- **Autentikasi**: Laravel Sanctum (Token Based / JWT)

### Struktur Folder
```
stock-area/
├── frontend/       # Source code React
│   ├── src/
│   │   ├── components/ # Komponen UI reusable
│   │   ├── pages/      # Halaman aplikasi
│   │   ├── api/        # Konfigurasi Axios & endpoint
│   │   └── context/    # State management (Auth)
│   └── public/
└── backend/        # Source code Laravel
    ├── app/
    │   ├── Http/Controllers/API/ # Controller API
    │   └── Models/               # Eloquent Models
    ├── routes/
    │   └── api.php               # Definisi Route API
    └── database/                 # Migrations & Seeds
```

## 2. User & Role Management
Sistem memiliki 2 role utama:
1.  **Admin**: Akses penuh ke seluruh data dan manajemen user.
2.  **Staff**: Akses terbatas hanya untuk input dan melihat data store sendiri.

## 3. Alur Sistem (User Flow)

### Flow Staff
1.  **Login**: Staff memasukkan email & password.
2.  **Redirect**: Jika sukses, diarahkan ke halaman **Input Stok**.
3.  **Input Data**: Mengisi form (Store, Lokasi, Sales Type, Produk, Qty).
4.  **View Data**: Melihat list stok yang *hanya* diinput oleh store tersebut (berdasarkan `store_id` yang terhubung dengan user staff).

### Flow Admin
1.  **Login**: Admin memasukkan email & password.
2.  **Redirect**: Jika sukses, diarahkan ke **Dashboard Admin**.
3.  **Monitoring**: Melihat tabel seluruh stok dari semua store.
4.  **Filtering**: Melakukan filter data berdasarkan Store, Lokasi, Produk, atau Sales Type.
5.  **Management**: Edit atau Hapus data stok jika ada kesalahan.
6.  **Export**: Mengunduh laporan dalam format Excel/CSV.

## 4. Struktur Database
Berikut adalah skema database relasional yang digunakan:

### Tabel `users`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | BIGINT (PK) | ID User |
| `name` | VARCHAR | Nama User |
| `email` | VARCHAR | Email (Unique) |
| `password` | VARCHAR | Password (Hashed) |
| `role` | ENUM | 'admin', 'staff' |
| `store_id` | BIGINT (FK) | (Optional) Nullable, relasi ke `stores` jika role staff |
| `timestamps` | DATETIME | created_at, updated_at |

### Tabel `stores`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | BIGINT (PK) | ID Store |
| `store_name` | VARCHAR | Nama Toko |
| `location` | VARCHAR | Lokasi Toko |
| `timestamps` | DATETIME | created_at, updated_at |

### Tabel `products`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | BIGINT (PK) | ID Produk |
| `product_name` | VARCHAR | Nama Produk |
| `timestamps` | DATETIME | created_at, updated_at |

### Tabel `stocks`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | BIGINT (PK) | ID Stok |
| `store_id` | BIGINT (FK) | Relasi ke `stores` |
| `product_id` | BIGINT (FK) | Relasi ke `products` |
| `sales_type` | ENUM | 'online', 'offline' |
| `qty` | INTEGER | Jumlah Stok |
| `created_by` | BIGINT (FK) | Relasi ke `users` (pencatat) |
| `timestamps` | DATETIME | created_at, updated_at |

## 5. Spesifikasi API Endpoint (Backend)

### Authentication
- `POST /api/login` : Login user, return token.
- `POST /api/logout` : Logout user (revoke token).
- `GET /api/user` : Get data user yang sedang login.

### Stock Management
- `GET /api/stocks` : List data stok.
    - *Query Params*: `store_id`, `location`, `product_id`, `sales_type`.
    - *Middleware*: Jika Admin return all, jika Staff return own store only.
- `POST /api/stocks` : Create data stok baru.
- `GET /api/stocks/{id}` : Detail stok.
- `PUT /api/stocks/{id}` : Update stok (Admin only).
- `DELETE /api/stocks/{id}` : Delete stok (Admin only).

### Master Data (Support)
- `GET /api/stores` : List semua store (untuk dropdown).
- `GET /api/products` : List semua produk (untuk dropdown).

### Export
- `GET /api/stocks/export` : Download Excel/CSV berdasarkan filter.

## 6. Contoh Response API

**Request**: `GET /api/stocks`
**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "store_name": "Store Jakarta Pusat",
      "location": "Jakarta",
      "product_name": "Sepatu Running X",
      "sales_type": "offline",
      "qty": 50,
      "created_at": "2024-01-20T10:00:00Z"
    },
    {
      "id": 2,
      "store_name": "Store Surabaya",
      "location": "Surabaya",
      "product_name": "Kaos Polos",
      "sales_type": "online",
      "qty": 100,
      "created_at": "2024-01-20T11:30:00Z"
    }
  ],
  "links": {
    "first": "...",
    "last": "..."
  },
  "meta": {
    "current_page": 1,
    "total": 2
  }
}
```

## 7. Rekomendasi Tech Stack & Library

### Backend (Laravel)
- **Laravel Sanctum**: Untuk autentikasi API yang ringan.
- **Maatwebsite/Laravel-Excel**: Untuk fitur export Excel/CSV.
- **Spatie/Laravel-Permission** (Opsional): Untuk manajemen role yang lebih kompleks jika diperlukan.

### Frontend (React)
- **Axios**: HTTP Client untuk request ke API.
- **React Router DOM**: Manajemen navigasi halaman.
- **Tailwind CSS**: Framework CSS untuk styling modern & cepat.
- **React Hook Form**: Manajemen form input.
- **TanStack Query (React Query)**: Manajemen server state (fetching, caching).
