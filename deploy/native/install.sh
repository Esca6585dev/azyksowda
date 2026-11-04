#!/usr/bin/env bash
# =============================================================================
#  AzykSowda — Docker-SYZ serwer gurnamasy (Ubuntu 22.04 / 24.04, Debian 12)
#
#  Näme edýär (bir gezek, root bilen):
#    1. apt: nginx, curl, git, sqlite3, logrotate ... (ulgamyň asyl paketleri)
#    2. Node.js (nodejs.org) we Go (go.dev) resmi arhiwlerini ýükläp, sha256 barlap gurnaýar
#    3. "azyksowda" ulanyjysyny, /var/lib/azyksowda, /var/log/azyksowda bukjalaryny döredýär
#    4. /etc/azyksowda/api.env we web.env (JWT_SECRET, admin paroly awtomatik)
#    5. Backend (Go binar) we frontend (Next.js standalone) gurýar -> /opt/azyksowda-app/releases/<id>
#    6. systemd hyzmatlary: azyksowda-api (127.0.0.1:8080), azyksowda-web (127.0.0.1:3000)
#    7. nginx + SSL (deploy/ssl/ içindäki sertifikat), logrotate, gündelik DB ätiýaçlyk nusgasy
#
#  Ulanylyşy (serwerde):
#    git clone https://github.com/Esca6585dev/azyksowda.git /opt/azyksowda
#    # SSL faýllaryny göçüriň: deploy/ssl/{azyksowda.com.tm.crt,ca_bundle.crt,private.key}
#    cd /opt/azyksowda && sudo bash deploy/native/install.sh
#
#  Internet çäkli bolsa (mirror):
#    sudo GOPROXY=https://goproxy.io,direct NPM_REGISTRY=https://registry.npmmirror.com \
#         bash deploy/native/install.sh
#    ýa-da öňünden ýüklenen arhiwler:  GO_TARBALL=/root/go.tar.gz NODE_TARBALL=/root/node.tar.xz
#    ýa-da başga ýerde gurlan reliz:  sudo bash deploy/native/install.sh --release /root/azyksowda-release.tar.gz
# =============================================================================
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

RELEASE_ARCHIVE=""
SKIP_NGINX="${SKIP_NGINX:-0}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@azyksowda.com}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --release) RELEASE_ARCHIVE="$2"; shift ;;
    --skip-nginx) SKIP_NGINX=1 ;;
    --admin-email) ADMIN_EMAIL="$2"; shift ;;
    -h | --help) sed -n '2,25p' "$0"; exit 0 ;;
    *) die "näbelli parametr: $1" ;;
  esac
  shift
done

need_root "$@"
command -v apt-get >/dev/null || die "bu skript Ubuntu/Debian (apt) üçin"
command -v systemctl >/dev/null || die "systemd tapylmady"

if [[ "$SKIP_NGINX" != 1 ]]; then
  for f in "$DOMAIN.crt" ca_bundle.crt private.key; do
    [[ -s "$DEPLOY_DIR/ssl/$f" ]] || die "SSL faýly ýok: $DEPLOY_DIR/ssl/$f
   Kompýuteriňizden göçüriň:
     scp deploy/ssl/{$DOMAIN.crt,ca_bundle.crt,private.key} root@SERWER:$DEPLOY_DIR/ssl/
   ýa-da SSL-siz synag üçin: --skip-nginx"
  done
fi

# ---------------------------------------------------------------------------
step "1/8 Ulgam paketleri (apt)"
missing=()
for c in nginx curl xz tar openssl envsubst sqlite3 logrotate; do
  command -v "$c" >/dev/null 2>&1 || missing+=("$c")
done
[[ -d /etc/cron.daily ]] || missing+=(cron)
if [[ ${#missing[@]} -eq 0 ]]; then
  # servers with a filtered uplink may not reach the apt mirrors at all
  c_green "   gerekli paketler eýýäm bar, apt geçildi"
else
  echo "   ýok: ${missing[*]}"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq nginx curl ca-certificates xz-utils tar openssl gettext-base git sqlite3 logrotate cron >/dev/null
fi
c_green "   ✓ nginx $(nginx -v 2>&1 | sed 's#.*/##'), sqlite3, logrotate"

# ---------------------------------------------------------------------------
step "2/8 Node.js (resmi arhiw)"
install_node
if [[ -z "$RELEASE_ARCHIVE" ]]; then
  step "2b/8 Go (resmi arhiw)"
  install_go
fi

# ---------------------------------------------------------------------------
step "3/8 Ulanyjy we bukjalar"
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --home-dir "$DATA_DIR" --shell /usr/sbin/nologin "$APP_USER"
  c_green "   ✓ ulanyjy döredildi: $APP_USER"
fi
install -d -m 750 -o "$APP_USER" -g "$APP_USER" "$DATA_DIR" "$DATA_DIR/data" "$DATA_DIR/uploads" "$LOG_DIR"
install -d -m 755 "$APP_ROOT" "$APP_ROOT/releases"
install -d -m 750 -o root -g "$APP_USER" "$ENV_DIR"
install -d -m 700 "$BACKUP_DIR"
c_green "   ✓ $DATA_DIR, $LOG_DIR, $APP_ROOT, $ENV_DIR"

# ---------------------------------------------------------------------------
step "4/8 Konfigurasiýa ($ENV_DIR)"
if [[ ! -f "$ENV_DIR/api.env" ]]; then
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-14)}"
  cat >"$ENV_DIR/api.env" <<EOF
# AzykSowda API — production
APP_ENV=production
HOST=127.0.0.1
PORT=$API_PORT
PROXY_HEADER=X-Real-IP
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE_HOURS=168
DB_DRIVER=sqlite
DATABASE_URL=$DATA_DIR/data/azyksowda.db
UPLOAD_DIR=$DATA_DIR/uploads
LOG_DIR=$LOG_DIR
FRONTEND_URL=$SITE_URL,https://www.$DOMAIN
DELIVERY_FEE=10
FREE_DELIVERY_FROM=200
SEED=true
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF
  c_green "   ✓ api.env döredildi (täze JWT_SECRET we admin paroly)"
else
  c_yellow "   api.env eýýäm bar — üýtgedilmedi"
fi
if [[ ! -f "$ENV_DIR/web.env" ]]; then
  cat >"$ENV_DIR/web.env" <<EOF
# AzykSowda web — production
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=$WEB_PORT
API_URL=http://127.0.0.1:$API_PORT
NEXT_PUBLIC_API_URL=$SITE_URL
NEXT_PUBLIC_SITE_URL=$SITE_URL
NEXT_TELEMETRY_DISABLED=1
EOF
  c_green "   ✓ web.env döredildi"
fi
chown root:"$APP_USER" "$ENV_DIR"/*.env
chmod 640 "$ENV_DIR"/*.env

# ---------------------------------------------------------------------------
step "5/8 Reliz"
RELEASE_ID=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="$APP_ROOT/releases/$RELEASE_ID"
if [[ -n "$RELEASE_ARCHIVE" ]]; then
  [[ -e "$RELEASE_ARCHIVE" ]] || die "reliz tapylmady: $RELEASE_ARCHIVE"
  mkdir -p "$RELEASE_DIR"
  if [[ -d "$RELEASE_ARCHIVE" ]]; then
    cp -a "$RELEASE_ARCHIVE"/. "$RELEASE_DIR/"
  else
    tar -C "$RELEASE_DIR" --strip-components=1 -xzf "$RELEASE_ARCHIVE"
  fi
  [[ -x "$RELEASE_DIR/api/azyksowda-api" && -f "$RELEASE_DIR/web/server.js" ]] || die "reliz arhiwi doly däl"
  c_green "   ✓ taýýar reliz açyldy: $(head -1 "$RELEASE_DIR/VERSION" 2>/dev/null || echo '?')"
else
  build_release "$RELEASE_DIR"
fi
chown -R "$APP_USER:$APP_USER" "$RELEASE_DIR"

# ---------------------------------------------------------------------------
step "6/8 systemd hyzmatlary"
render_unit() { # src dest
  sed -e "s#/opt/azyksowda-app#$APP_ROOT#g" -e "s#/var/lib/azyksowda#$DATA_DIR#g" \
    -e "s#/var/log/azyksowda#$LOG_DIR#g" -e "s#/etc/azyksowda#$ENV_DIR#g" \
    -e "s#^User=azyksowda#User=$APP_USER#" -e "s#^Group=azyksowda#Group=$APP_USER#" "$1" >"$2"
}
render_unit "$NATIVE_DIR/azyksowda-api.service" /etc/systemd/system/azyksowda-api.service
render_unit "$NATIVE_DIR/azyksowda-web.service" /etc/systemd/system/azyksowda-web.service
activate_release "$RELEASE_DIR"
systemctl daemon-reload
systemctl enable azyksowda-api azyksowda-web >/dev/null 2>&1
restart_services
health_check || die "hyzmatlar başlamady (ýokardaky loglara serediň)"

# ---------------------------------------------------------------------------
step "7/8 nginx + SSL"
if [[ "$SKIP_NGINX" == 1 ]]; then
  c_yellow "   --skip-nginx: geçildi. Synag: curl http://127.0.0.1:$WEB_PORT/"
else
  bash "$DEPLOY_DIR/install-ssl.sh" --nginx --api "127.0.0.1:$API_PORT" --web "127.0.0.1:$WEB_PORT"
  systemctl enable nginx >/dev/null 2>&1 || true
  if command -v ufw >/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
    ufw allow 'Nginx Full' >/dev/null && c_green "   ✓ ufw: 80/443 açyldy"
  fi
fi

# ---------------------------------------------------------------------------
step "8/8 Loglar we ätiýaçlyk nusga"
sed -e "s#/var/log/azyksowda#$LOG_DIR#g" -e "s#su azyksowda azyksowda#su $APP_USER $APP_USER#" \
  "$NATIVE_DIR/logrotate.conf" >/etc/logrotate.d/azyksowda
install -m 755 "$NATIVE_DIR/backup.sh" /etc/cron.daily/azyksowda-backup
c_green "   ✓ /etc/logrotate.d/azyksowda, /etc/cron.daily/azyksowda-backup -> $BACKUP_DIR"
prune_releases

# ---------------------------------------------------------------------------
ADMIN_LINE=$(grep -E '^ADMIN_(EMAIL|PASSWORD)=' "$ENV_DIR/api.env" | tr '\n' ' ')
echo
c_green "✅ AzykSowda gurnaldy: $SITE_URL"
cat <<EOF

  Admin panel:  $SITE_URL/admin
  Admin:        $ADMIN_LINE
                (parol diňe boş baza ilkinji gezek doldurylanda ulanylýar — soň admin paneliňizden üýtgediň)

  Hyzmatlar:    systemctl status azyksowda-api azyksowda-web nginx
  Loglar:       journalctl -u azyksowda-api -f     |  tail -f $LOG_DIR/access.log
  Täzelemek:    sudo bash $NATIVE_DIR/update.sh
  Yza gaýtar:   sudo bash $NATIVE_DIR/rollback.sh
  Maglumatlar:  $DATA_DIR (baza + suratlar), ätiýaçlyk: $BACKUP_DIR
EOF
