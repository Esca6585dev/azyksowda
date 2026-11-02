#!/usr/bin/env bash
# =============================================================================
#  AzykSowda — serwere doly ýerleşdirmek (Ubuntu 22.04/24.04, Docker)
#
#  1) Kody serwere göçüriň:  git clone ... /opt/azyksowda   (ýa-da scp/rsync)
#  2) SSL faýllaryny goýuň:  /opt/azyksowda/deploy/ssl/{azyksowda.com.tm.crt,ca_bundle.crt,private.key}
#  3) Işlediň:               cd /opt/azyksowda && sudo ./deploy/deploy.sh
#
#  Skript: docker gurnaýar (ýok bolsa), .env döredýär, SSL barlaýar,
#  3 konteýneri (backend, frontend, nginx) gurup işledýär.
# =============================================================================
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }

if ! command -v docker >/dev/null; then
  yellow "Docker gurnalýar..."
  curl -fsSL https://get.docker.com | sh
fi
docker compose version >/dev/null 2>&1 || { yellow "docker compose plugin gurnalýar..."; apt-get install -y docker-compose-plugin; }

if [[ ! -f .env ]]; then
  SECRET=$(openssl rand -hex 32)
  cat > .env <<EOF
# --- AzykSowda production ---
DOMAIN=azyksowda.com.tm
SITE_URL=https://azyksowda.com.tm
JWT_SECRET=$SECRET
ADMIN_EMAIL=admin@azyksowda.com
ADMIN_PASSWORD=$(openssl rand -base64 12 | tr -d '/+=' | cut -c1-12)
SEED=true
EOF
  green ".env döredildi — ADMIN_PASSWORD-y ýazyp alyň:"
  grep ADMIN_PASSWORD .env
fi

chmod +x deploy/install-ssl.sh
./deploy/install-ssl.sh

green "Konteýnerler gurulýar (ilkinji gezek 3-6 minut)..."
docker compose pull nginx
docker compose up -d --build

sleep 3
docker compose ps
echo
green "✅ Taýýar: https://azyksowda.com.tm"
echo "Loglar:        docker compose logs -f"
echo "Täzelemek:     git pull && docker compose up -d --build"
echo "SSL täzelemek: täze faýllary deploy/ssl/ içine goýuň -> ./deploy/install-ssl.sh && docker compose restart nginx"
