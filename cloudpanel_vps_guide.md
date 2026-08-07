# Panduan Lengkap Deploy di VPS CloudPanel

Panduan langkah demi langkah untuk melakukan deploy aplikasi **Playlist Rewind** ke VPS menggunakan **CloudPanel** dengan Subdomain: `playlistlivefestival.lestplaymaker.com`.

---

## 📍 Ringkasan Perubahan Keamanan Baru:
- **Tautan Admin di Footer**: Sudah **DITIADAKAN / DIHAPUS**.
- **URL Admin Rahasia**: Akses `/admin` lama sudah diubah menjadi **404 Not Found**. URL Admin baru adalah:
  👉 **`https://playlistlivefestival.lestplaymaker.com/play`**
- **Passcode Default Baru**: **`PlaymakerSecret2026!`** *(dapat diubah via `.env.local`)*.

---

## 🚀 Langkah 1: Buat Site Node.js di CloudPanel

1. Login ke **Dashboard CloudPanel** VPS Anda.
2. Klik tombol **+ Add Site** -> Pilih **Create a Node.js Site**.
3. Isi form berikut:
   - **Domain Name**: `playlistlivefestival.lestplaymaker.com`
   - **Node.js Version**: Pilih **Node.js 20.x** atau **Node.js 22.x**.
   - **App Port**: `3000` (atau port kosong lainnya).
4. Klik **Create Site**.

---

## 🗄️ Langkah 2: Buat Database MySQL di CloudPanel

1. Di CloudPanel, masuk ke menu **Database** pada domain `playlistlivefestival.lestplaymaker.com`.
2. Klik **+ Add Database**.
3. Isi data database:
   - **Database Name**: `playlist_db`
   - **Database User**: `playlist_user`
   - **Database Password**: *(Buat password aman, contoh: `PlaymakerDb2026!Sec`)*
4. Klik **Create Database**.

---

## 📁 Langkah 3: Upload File Source Code ke CloudPanel

1. Buka SSH / Terminal ke VPS Anda:
   ```bash
   ssh root@ip_vps_anda
   ```
2. Masuk ke direktori website CloudPanel:
   ```bash
   cd /home/cloudpanel/htdocs/playlistlivefestival.lestplaymaker.com
   ```
3. Clone atau upload seluruh source code aplikasi ke dalam folder ini.

---

## ⚙️ Langkah 4: Konfigurasi Environment Variables (`.env.local`)

Buat file `.env.local` di root folder proyek (`/home/cloudpanel/htdocs/playlistlivefestival.lestplaymaker.com/.env.local`):

```env
# Port Aplikasi Next.js
PORT=3000

# Password Login Dashboard CMS (Bisa Anda ganti sesuka hati)
ADMIN_PASSCODE=PlaymakerSecret2026!

# Konfigurasi Database MySQL CloudPanel
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=playlist_user
MYSQL_PASSWORD=PlaymakerDb2026!Sec
MYSQL_DATABASE=playlist_db
```

---

## 🔨 Langkah 5: Install, Build & Jalankan Aplikasi

Jalankan perintah berikut di SSH terminal:

```bash
cd /home/cloudpanel/htdocs/playlistlivefestival.lestplaymaker.com

# 1. Install dependencies
npm install

# 2. Build aplikasi produksi Next.js
npm run build

# 3. Jalankan PM2 Process Manager
npm install -g pm2
pm2 start npm --name "playlist-web" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## 🔒 Langkah 6: Aktifkan SSL HTTPS (Let's Encrypt) di CloudPanel

1. Di **CloudPanel**, buka tab **SSL/TLS** untuk site `playlistlivefestival.lestplaymaker.com`.
2. Klik **+ New Certificate** -> Pilih **Let's Encrypt Certificate**.
3. Klik **Create and Install**.
4. Website Anda sekarang sudah live dan terlindungi SSL HTTPS di:
   🌐 **`https://playlistlivefestival.lestplaymaker.com`**
   🔒 **`https://playlistlivefestival.lestplaymaker.com/play`**
