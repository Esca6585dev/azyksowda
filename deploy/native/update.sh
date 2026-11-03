#!/usr/bin/env bash
# =============================================================================
#  AzykSowda — täzelemek (Docker-syz)
#    git pull -> täze reliz gur -> geçir -> hyzmatlary täzeden başlat -> barla
#  Barlag şowsuz bolsa öňki relize awtomatik gaýdýar. Baza we suratlar degilmeýär.
#
#    sudo bash deploy/native/update.sh                 # GitHub-dan soňky kod
#    sudo bash deploy/native/update.sh --no-pull       # häzirki kod bilen täzeden gur
#    sudo bash deploy/native/update.sh --release /root/azyksowda-release.tar.gz
# =============================================================================
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PULL=1
RELEASE_ARCHIVE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-pull) PULL=0 ;;
    --release) RELEASE_ARCHIVE="$2"; PULL=0; shift ;;
    -h | --help) sed -n '2,10p' "$0"; exit 0 ;;
    *) die "näbelli parametr: $1" ;;
  esac
  shift
done

need_root "$@"
[[ -f /etc/systemd/system/azyksowda-api.service ]] || die "ilki gurnamaly: sudo bash $NATIVE_DIR/install.sh"

if [[ $PULL == 1 ]]; then
  step "Kod täzelenýär (git pull)"
  # per-command safe.directory: the checkout may belong to another user
  git -c safe.directory="$SRC_DIR" -C "$SRC_DIR" pull --ff-only
  c_green "   ✓ $(git -c safe.directory="$SRC_DIR" -C "$SRC_DIR" log -1 --format='%h %s')"
  # this script may itself have changed; re-exec the fresh copy once
  if [[ -z "${AZ_REEXEC:-}" ]]; then
    AZ_REEXEC=1 exec bash "$NATIVE_DIR/update.sh" --no-pull
  fi
fi

PREV=$(current_release)
RELEASE_DIR="$APP_ROOT/releases/$(date +%Y%m%d-%H%M%S)"

if [[ -n "$RELEASE_ARCHIVE" ]]; then
  step "Taýýar reliz açylýar"
  mkdir -p "$RELEASE_DIR"
  if [[ -d "$RELEASE_ARCHIVE" ]]; then cp -a "$RELEASE_ARCHIVE"/. "$RELEASE_DIR/"; else tar -C "$RELEASE_DIR" --strip-components=1 -xzf "$RELEASE_ARCHIVE"; fi
  [[ -x "$RELEASE_DIR/api/azyksowda-api" && -f "$RELEASE_DIR/web/server.js" ]] || die "reliz arhiwi doly däl"
else
  step "Gurallar barlanýar"
  install_node
  install_go
  build_release "$RELEASE_DIR"
fi
chown -R "$APP_USER:$APP_USER" "$RELEASE_DIR"

step "Täze reliz işe girizilýär: $(basename "$RELEASE_DIR")"
activate_release "$RELEASE_DIR"
restart_services
if ! health_check; then
  if [[ -n "$PREV" && -d "$PREV" ]]; then
    c_yellow "   Öňki relize gaýdylýar: $(basename "$PREV")"
    activate_release "$PREV"
    restart_services
    health_check || true
  fi
  die "täzeleme şowsuz — öňki wersiýa işleýär. Ýalňyş: journalctl -u azyksowda-api -u azyksowda-web -n 100"
fi

systemctl reload nginx 2>/dev/null || true
prune_releases
c_green "✅ Täzelendi: $(head -1 "$RELEASE_DIR/VERSION") -> $SITE_URL"
