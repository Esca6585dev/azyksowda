# AzykSowda — onlaýn azyk dükany

Go (Fiber) backend + Next.js 16 frontend. Türkmen dilinde, mobil görnüşe çenli taýýar e-commerce:
katalog (14 kategoriýa, 257 hakyky haryt, 229-y surat bilen), sebet, sargyt, ulanyjy hasaby, admin panel,
hereket loglary, ak/gara tema.

```
azyksowda/
├─ backend/        Go 1.27 + Fiber v2 + GORM (SQLite default, Postgres opsiýa)
├─ frontend/       Next.js 16 (App Router) + Tailwind v4 + zustand
├─ deploy/         nginx + SSL + Docker-syz serwer gurnamasy (deploy/native)
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

### Seed harytlary

`backend/internal/seed/data/` içinde (`go:embed` bilen binara girýär, internet gerek däl):

* `products.json` — 257 haryt: Aşgabadyň onlaýn bazaryndaky (ynamdar.com) azyk bölümlerinden 224 haryt
  hakyky ady, markasy, bahasy we köne bahasy (arzanladyş) bilen, üstesine häzirki azyksowda.com.tm saýtyndaky 38 haryt.
* `images/` — 400×400 haryt suratlary (229 sany). Ilkinji işe girizilende `UPLOAD_DIR/seed/` içine göçürilýär.

azyksowda.com.tm harytlarynyň 28-siniň suraty ýok, sebäbi saýtdaky `assets/product/...` faýllary serwerde ýok (404).
Olar emoji plitkasy bilen görünýär. Admin paneliň **Harytlar** bölüminden surat ýükläp bilersiňiz.

> Seed suratlary we bahalary demo/synag üçin. Production-da öz suratlaryňyzy ýa-da üpjün edijiden
> rugsat alnan suratlary ulanyň.

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
NEXT_PUBLIC_API_URL=                        # brauzer → API (boş = şol domen, /api we /uploads Next rewrites arkaly backend-e geçýär)
API_URL=http://localhost:8080               # server komponentler → API
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sahypalar: `/` baş sahypa · `/catalog` (süzgüç, tertip, sahypalama) · `/product/[slug]` · `/cart` · `/checkout` ·
`/login` `/register` · `/account` (profil, sargytlar) · `/contact` · `/admin/*` (dashboard, harytlar, kategoriýalar,
sargytlar, ulanyjylar, loglar). Favicon/ikonlar: `src/app/icon.svg`, `favicon.ico`, `apple-icon.tsx`, OG surat, PWA manifest.

`node scripts/make-favicon.mjs` — logodan favicon.ico we PNG ikonlary täzeden döredýär.

**Ak/gara tema:** sazlamada ulgamyň temasyny (prefers-color-scheme) alýar, sözbaşydaky Aý/Gün düwmesi bilen
üýtgedilýär we `localStorage`-da (`az-theme`) ýatda saklanýar. Reňkler `globals.css`-daky tokenlerde
(`--color-card`, `--color-surface`, `--color-ink`, `--color-line` ...) we `.dark` blokunda kesgitlenen.

## Production (azyksowda.com.tm) — Docker-syz

Serwerde Docker ulanylmaýar. Ähli zat ulgamyň asyl paketlerinden gurulýar:

| Bölek | Nireden | Nirede işleýär |
|-------|---------|----------------|
| nginx, git, sqlite3, logrotate | `apt` (Ubuntu/Debian) | 80/443 |
| Go | go.dev resmi arhiwi, sha256 barlagy bilen | diňe gurmak üçin |
| Node.js 24 | nodejs.org resmi arhiwi, sha256 barlagy bilen | `azyksowda-web` |
| Backend | Go binar `api/azyksowda-api` | systemd `azyksowda-api`, 127.0.0.1:8080 |
| Frontend | Next.js standalone `web/server.js` | systemd `azyksowda-web`, 127.0.0.1:3000 |

### Kompýuterden ýerleşdirmek — `deploy/push.sh` (esasy ýol)

Serwerden github.com açylmaýar, şonuň üçin `git pull` işlemeýär. Reliz şu kompýuterde gurulýar
(Go linux binar + Next.js standalone) we SSH bilen iberilýär:

```bash
bash deploy/push.sh            # gur -> iber -> serwerde update.sh (barlag şowsuz bolsa öňki wersiýa gaýdýar)
bash deploy/push.sh --hook     # mundan beýläk `git push` (main) serwere hem ýerleşdirýär
NO_DEPLOY=1 git push           # bir gezek ýerleşdirmezden push
```

Gerek: `~/.ssh/config` içinde `azyksowda` hosty (açar bilen giriş) we serwerde parolsyz `sudo`.
Ilkinji gezek serwerde gurnama ýok bolsa, `push.sh` özi `install.sh` işledýär we SSL faýllaryny äkidýär.

### Ilkinji gurnama (serwerde GitHub açylýan bolsa)

```bash
# serwerde (root)
git clone https://github.com/Esca6585dev/azyksowda.git /opt/azyksowda
# kompýuteriňizden SSL faýllaryny göçüriň:
#   scp deploy/ssl/{azyksowda.com.tm.crt,ca_bundle.crt,private.key} root@SERWER:/opt/azyksowda/deploy/ssl/
cd /opt/azyksowda
sudo bash deploy/native/install.sh
```

Skript ahyrynda admin e-poçtasyny we awtomatik döredilen paroly görkezýär (`/etc/azyksowda/api.env`).

### Täzelemek we yza gaýtarmak

```bash
sudo bash /opt/azyksowda/deploy/native/update.sh     # git pull + täze reliz + barlag
sudo bash /opt/azyksowda/deploy/native/rollback.sh   # öňki relize gaýt
sudo bash /opt/azyksowda/deploy/native/rollback.sh --list
```

Her täzeleme `/opt/azyksowda-app/releases/<wagt>/` içine aýratyn gurulýar we `current` baglanyşygy bilen geçirilýär.
Barlag şowsuz bolsa, skript öňki relize özi gaýdýar. Soňky 5 reliz saklanýar.

### Faýllar

| Ýol | Näme |
|-----|------|
| `/etc/azyksowda/api.env`, `web.env` | sazlamalar (JWT_SECRET, admin, portlar) |
| `/var/lib/azyksowda/data/azyksowda.db` | SQLite baza |
| `/var/lib/azyksowda/uploads/` | haryt suratlary |
| `/var/log/azyksowda/` | `app.log`, `access.log` (logrotate 14 gün) |
| `/var/backups/azyksowda/` | gündelik baza nusgasy, hepdelik suratlar (14 gün) |

```bash
systemctl status azyksowda-api azyksowda-web nginx
journalctl -u azyksowda-api -f
tail -f /var/log/azyksowda/access.log
```

### Internet çäkli bolsa

```bash
# mirrorlar bilen
sudo GOPROXY=https://goproxy.io,direct NPM_REGISTRY=https://registry.npmmirror.com bash deploy/native/install.sh
# öňünden ýüklenen resmi arhiwler bilen
sudo GO_TARBALL=/root/go1.27.0.linux-amd64.tar.gz NODE_TARBALL=/root/node-v24-linux-x64.tar.xz bash deploy/native/install.sh
```

Ýa-da interneti bar Linux/WSL kompýuterde taýýar reliz guruň we serwere göçüriň (serwerde Go we npm gerek däl):

```bash
bash deploy/native/build-release.sh                       # dist/azyksowda-release-<commit>.tar.gz
scp dist/azyksowda-release-*.tar.gz root@SERWER:/root/
sudo bash deploy/native/install.sh --release /root/azyksowda-release-<commit>.tar.gz
sudo bash deploy/native/update.sh  --release /root/azyksowda-release-<commit>.tar.gz   # soňky gezekler
```

### SSL

`deploy/install-ssl.sh` sertifikaty (Sectigo DV, `azyksowda.com.tm` + `www`) barlaýar: açar gabat gelýärmi,
zynjyr dogrumy, möhleti. Häzirki sertifikat **2026-12-10** çenli. Täzesi gelende 3 faýly `deploy/ssl/` içine
goýuň we `sudo bash deploy/install-ssl.sh --nginx` işlediň. nginx 1.18/1.24 (Ubuntu 22.04/24.04) we IPv6-syz
serwerler üçin konfig awtomatik uýgunlaşdyrylýar.

`deploy/ssl/` git-e girmeýär (`.gitignore`).

`docker-compose.yml` we `Dockerfile`-lar islege görä galdyryldy, olar zerur däl.

# azyksowda
