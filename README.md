# AzykSowda — onlaýn azyk dükany

Go (Fiber) backend + Next.js 16 frontend. Türkmen dilinde, mobil görnüşe çenli taýýar e-commerce:
katalog (14 kategoriýa, 240+ hakyky haryt), sebet, sargyt, ulanyjy hasaby, admin panel, hereket loglary.

```
azyksowda/
├─ backend/        Go 1.27 + Fiber v2 + GORM (SQLite default, Postgres opsiýa)
├─ frontend/       Next.js 16 (App Router) + Tailwind v4 + zustand
├─ deploy/         nginx + SSL (azyksowda.com.tm) + skriptler
├─ docker-compose.yml
├─ run-dev.ps1 / run-dev.sh   (ýerli işletmek)
└─ azyksowda-static/          (köne statik görnüş — salgylanma)
```

## Ýerli işletmek (Windows)

```powershell
.\run-dev.ps1
```

ýa-da iki terminalda:

```bash
cd backend  && go run ./cmd/server      # http://localhost:8080
cd frontend && npm install && npm run dev   # http://localhost:3000
```

| Näme        | Salgy                                   |
|-------------|-----------------------------------------|
| Saýt        | http://localhost:3000                   |
| Admin panel | http://localhost:3000/admin             |
| API health  | http://localhost:8080/api/health        |

**Synag hasaplary** (SEED=true bolanda ilkinji işe girizilende döredilýär):

| Rol    | E-poçta               | Parol    |
|--------|-----------------------|----------|
| Admin  | admin@azyksowda.com   | admin123 |
| Müşderi| test@azyksowda.com    | test123  |

Maglumat bazasyny täzeden doldurmak üçin `backend/data/azyksowda.db` faýlyny pozup, serweri täzeden işlediň.

## Backend (Go Fiber)

`backend/.env` (nusga: `.env.example`):

| Üýtgeýän           | Default                 | Düşündiriş                                   |
|--------------------|-------------------------|----------------------------------------------|
| PORT               | 8080                    |                                              |
| JWT_SECRET         | dev secret              | **Production-da hökman üýtgediň**            |
| DB_DRIVER          | sqlite                  | `sqlite` ýa-da `postgres`                    |
| DATABASE_URL       | ./data/azyksowda.db     | postgres üçin DSN                            |
| UPLOAD_DIR         | ./uploads               | haryt suratlary                              |
| LOG_DIR            | ./logs                  | `app.log` + `access.log`                     |
| FRONTEND_URL       | http://localhost:3000   | CORS (wergül bilen birnäçe)                  |
| DELIVERY_FEE       | 10                      | eltip bermek bahasy (manat)                  |
| FREE_DELIVERY_FROM | 200                     | şundan ýokary — mugt                         |
| SEED               | true                    | boş bazany test maglumatlary bilen doldur    |

### API

| Metod | Ýol                               | Kim      | Düşündiriş                                  |
|-------|-----------------------------------|----------|---------------------------------------------|
| POST  | /api/auth/register                | hemmeler | hasap açmak                                 |
| POST  | /api/auth/login                   | hemmeler | giriş → JWT                                 |
| GET   | /api/auth/me                      | ulanyjy  | profil                                      |
| PUT   | /api/auth/profile                 | ulanyjy  | profil/parol täzelemek                      |
| GET   | /api/categories, /:slug           | hemmeler | kategoriýalar (haryt sany bilen)            |
| GET   | /api/products                     | hemmeler | `q, category, sort, page, limit, featured, discount, in_stock, min_price, max_price, brand` |
| GET   | /api/products/suggest?q=          | hemmeler | gözleg maslahatlary                         |
| GET   | /api/products/:slug               | hemmeler | haryt + meňzeşler                           |
| POST  | /api/orders                       | ulanyjy  | sargyt (stok barlanýar, baha serwerde)      |
| GET   | /api/orders, /:id                 | ulanyjy  | öz sargytlary                               |
| POST  | /api/orders/:id/cancel            | ulanyjy  | garaşylýan sargydy ýatyrmak                 |
| GET   | /api/admin/stats                  | admin    | dashboard                                   |
| CRUD  | /api/admin/products, /categories  | admin    |                                             |
| GET   | /api/admin/orders, PUT /:id/status| admin    |                                             |
| GET   | /api/admin/users, PUT /:id        | admin    | rol / bloklamak                             |
| GET   | /api/admin/logs                   | admin    | hereket loglary (süzgüçli)                  |
| POST  | /api/admin/upload                 | admin    | surat (jpg/png/webp/gif/svg, ≤5MB)          |

Jogap formaty: `{ "success": true, "data": ..., "meta": {page,limit,total,total_pages} }`,
ýalňyşlyk: `{ "success": false, "message": "...", "errors": {field: msg} }`.

### Loglar

* `logs/access.log` — her HTTP sorag (wagt, status, latency, IP, URL, request-id)
* `logs/app.log` — programma loglary (seed, panic, DB)
* `activity_logs` tablisasy — giriş/çykyş, nädogry giriş synanyşyklary, sargyt döretme/ýatyrma/status,
  haryt we kategoriýa CRUD, ulanyjy üýtgetmeleri, surat ýükleme — admin paneliň **Loglar** bölüminde görünýär.

## Frontend (Next.js)

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080   # brauzer → API
API_URL=http://localhost:8080               # server komponentler → API
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sahypalar: `/` baş sahypa · `/catalog` (süzgüç, tertip, sahypalama) · `/product/[slug]` · `/cart` · `/checkout` ·
`/login` `/register` · `/account` (profil, sargytlar) · `/contact` · `/admin/*` (dashboard, harytlar, kategoriýalar,
sargytlar, ulanyjylar, loglar). Favicon/ikonlar: `src/app/icon.svg`, `favicon.ico`, `apple-icon.tsx`, OG surat, PWA manifest.

`node scripts/make-favicon.mjs` — logodan favicon.ico we PNG ikonlary täzeden döredýär.

## Production (azyksowda.com.tm)

### Docker (maslahat berilýär)

```bash
# serwerde
git clone <repo> /opt/azyksowda && cd /opt/azyksowda
cp /path/to/azyksowda.com.tm.crt /path/to/ca_bundle.crt /path/to/private.key deploy/ssl/
sudo ./deploy/deploy.sh
```

`deploy.sh`: docker gurnaýar, `.env` (JWT_SECRET, admin parol) döredýär, `install-ssl.sh` bilen sertifikaty
barlap `fullchain.crt` ýasaýar, `backend + frontend + nginx` konteýnerlerini işledýär (80/443).

### Docker-syz (nginx + systemd)

```bash
sudo ./deploy/install-ssl.sh --nginx --api 127.0.0.1:8080 --web 127.0.0.1:3000
cd backend  && go build -o /opt/azyksowda/server ./cmd/server   # APP_ENV=production, JWT_SECRET=...
cd frontend && npm ci && npm run build && npm start              # NEXT_PUBLIC_API_URL=https://azyksowda.com.tm
```

### SSL

`deploy/install-ssl.sh` sertifikaty (Sectigo DV, `azyksowda.com.tm` + `www`) barlaýar: açar gabat gelýärmi,
zynjyr dogrumy, möhleti. Häzirki sertifikat **2026-12-10** çenli. Täzesi gelende 3 faýly `deploy/ssl/` içine
goýuň we skripti täzeden işlediň (`docker compose restart nginx`).

`deploy/ssl/` git-e girmeýär (`.gitignore`).
# azyksowda
