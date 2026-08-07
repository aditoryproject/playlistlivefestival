# Panduan Rilis VPS & Keamanan Server (Playlist Web)

Panduan langkah demi langkah untuk melakukan deploy aplikasi `playlistweb` ke server VPS (Ubuntu / Debian / CentOS) dengan database MySQL, Nginx Reverse Proxy, SSL HTTPS, dan pengerasan keamanan dari Hacker & DDoS.

---

## 1. Environment Variables (`.env.local` atau `.env`)

Buat file `.env.local` pada direktori utama aplikasi di VPS:

```env
# Port Aplikasi Next.js
PORT=3000

# Password Admin Dashboard CMS (Ganti dengan password acak yang kuat)
ADMIN_PASSCODE=PlaylistAdmin2026!Secure

# Konfigurasi Koneksi Database MySQL
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=playlist_user
MYSQL_PASSWORD=PasswordMySQL_SangatAman123!
MYSQL_DATABASE=playlistweb
```

---

## 2. Setup Database MySQL di VPS

Jalankan perintah SQL berikut di MySQL VPS Anda (atau jalankan file `src/lib/schema.sql`):

```sql
CREATE DATABASE IF NOT EXISTS `playlistweb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'playlist_user'@'localhost' IDENTIFIED BY 'PasswordMySQL_SangatAman123!';
GRANT ALL PRIVILEGES ON `playlistweb`.* TO 'playlist_user'@'localhost';
FLUSH PRIVILEGES;

USE `playlistweb`;

CREATE TABLE IF NOT EXISTS `site_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(50) NOT NULL UNIQUE DEFAULT 'default_config',
  `config_json` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `buy_now_analytics` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `clicked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `user_agent` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45) NULL,
  INDEX `idx_clicked_at` (`clicked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Build & Jalankan Aplikasi dengan PM2

```bash
# 1. Install dependencies
npm install

# 2. Build aplikasi produksi
npm run build

# 3. Install PM2 global (jika belum ada)
npm install -g pm2

# 4. Jalankan aplikasi di background
pm2 start npm --name "playlistweb" -- start -- -p 3000

# 5. Simpan status PM2 agar otomatis jalan saat VPS reboot
pm2 save
pm2 startup
```

---

## 4. Konfigurasi Nginx Reverse Proxy & Proteksi Rate Limiting

Buat file konfigurasi Nginx di `/etc/nginx/sites-available/playlistweb`:

```nginx
# Rate Limit Zone untuk Mitigasi DDoS Layer 7
limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=20r/s;

server {
    server_name domainanda.com www.domainanda.com;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    location / {
        limit_req zone=req_limit_per_ip burst=30 nodelay;

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proteksi khusus endpoint upload & auth
    location /api/upload {
        limit_req zone=req_limit_per_ip burst=5 nodelay;
        client_max_body_size 6M;
        proxy_pass http://127.0.0.1:3000;
    }
}
```

Aktifkan Nginx & SSL HTTPS Certbot:

```bash
sudo ln -s /etc/nginx/sites-available/playlistweb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL Gratis dari Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domainanda.com -d www.domainanda.com
```

---

## 5. Rekomendasi Fitur Keamanan Cloudflare (Anti-DDoS)

1. Arahkan DNS domain Anda ke **Cloudflare Free DNS**.
2. Aktifkan **Orange Cloud (Proxied)** pada A Record domain Anda.
3. Aktifkan **Bot Fight Mode** di Cloudflare (Security > Bots) untuk memblokir bot malware otomatis.
4. Set SSL/TLS mode ke **Full (Strict)**.
