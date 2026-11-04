#!/usr/bin/env bash
# Shared helpers for the Docker-free AzykSowda deployment (Ubuntu/Debian, systemd).
# Sourced by install.sh / update.sh / rollback.sh / build-release.sh.

set -euo pipefail

# ---------- layout (override via environment if needed) ----------
DOMAIN="${DOMAIN:-azyksowda.com.tm}"
SITE_URL="${SITE_URL:-https://$DOMAIN}"
APP_USER="${APP_USER:-azyksowda}"
APP_ROOT="${APP_ROOT:-/opt/azyksowda-app}"      # releases/<id> + current -> releases/<id>
DATA_DIR="${DATA_DIR:-/var/lib/azyksowda}"       # sqlite db + uploaded images
LOG_DIR="${LOG_DIR:-/var/log/azyksowda}"
ENV_DIR="${ENV_DIR:-/etc/azyksowda}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/azyksowda}"
API_PORT="${API_PORT:-8080}"
WEB_PORT="${WEB_PORT:-3000}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

# toolchains ("original packages" from the official vendors)
NODE_MAJOR="${NODE_MAJOR:-24}"
NODE_DL_BASE="${NODE_DL_BASE:-https://nodejs.org/dist}"
GO_DL_BASE="${GO_DL_BASE:-https://dl.google.com/go}"
NODE_HOME="/usr/local/lib/nodejs"
GO_HOME="/usr/local/go"

NATIVE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$NATIVE_DIR/.." && pwd)"
SRC_DIR="${SRC_DIR:-$(cd "$DEPLOY_DIR/.." && pwd)}"

# ---------- output ----------
c_green() { printf '\033[32m%s\033[0m\n' "$*"; }
c_red() { printf '\033[31m%s\033[0m\n' "$*" >&2; }
c_yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
die() { c_red "XATA: $*"; exit 1; }

need_root() { [[ $EUID -eq 0 ]] || die "root gerek: sudo $0 $*"; }

arch_go() {
  case "$(uname -m)" in
    x86_64 | amd64) echo amd64 ;;
    aarch64 | arm64) echo arm64 ;;
    *) die "goldanmaýan arhitektura: $(uname -m)" ;;
  esac
}
arch_node() {
  case "$(uname -m)" in
    x86_64 | amd64) echo x64 ;;
    aarch64 | arm64) echo arm64 ;;
    *) die "goldanmaýan arhitektura: $(uname -m)" ;;
  esac
}

# "1.2.3" < "1.10.0" using sort -V
ver_lt() { [[ "$1" != "$2" && "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -n1)" == "$1" ]]; }

download() { # url dest
  curl -fL --retry 3 --retry-delay 2 --connect-timeout 20 -o "$2" "$1"
}

# ---------- Go (official tarball, sha256 verified) ----------
required_go_version() {
  local v
  v=$(awk '/^go [0-9]/{print $2; exit}' "$SRC_DIR/backend/go.mod")
  [[ "$v" =~ ^[0-9]+\.[0-9]+$ ]] && v="$v.0"
  echo "$v"
}

install_go() {
  local want have arch tgz url
  want="${GO_VERSION:-$(required_go_version)}"
  if [[ -x "$GO_HOME/bin/go" ]]; then
    have=$("$GO_HOME/bin/go" env GOVERSION 2>/dev/null | sed 's/^go//')
    if [[ -n "$have" ]] && ! ver_lt "$have" "$want"; then
      c_green "   Go $have eýýäm gurnalan"
      return
    fi
  fi
  arch=$(arch_go)
  tgz=$(mktemp --suffix=.tar.gz)
  if [[ -n "${GO_TARBALL:-}" ]]; then
    cp "$GO_TARBALL" "$tgz"
    c_yellow "   Go ýerli faýldan: $GO_TARBALL"
  else
    url="$GO_DL_BASE/go$want.linux-$arch.tar.gz"
    echo "   Go $want ýüklenýär: $url"
    download "$url" "$tgz"
    local sum
    sum=$(curl -fsSL --retry 3 "$url.sha256" 2>/dev/null | awk '{print $1}' || true)
    if [[ -n "$sum" ]]; then
      echo "$sum  $tgz" | sha256sum -c --quiet - || die "Go sha256 gabat gelmedi"
      c_green "   ✓ sha256 barlandy"
    else
      c_yellow "   ! sha256 faýly alynmady, barlag geçirilmedi"
    fi
  fi
  rm -rf "$GO_HOME"
  tar -C /usr/local -xzf "$tgz"
  rm -f "$tgz"
  ln -sf "$GO_HOME/bin/go" /usr/local/bin/go
  ln -sf "$GO_HOME/bin/gofmt" /usr/local/bin/gofmt
  c_green "   ✓ $("$GO_HOME/bin/go" version)"
}

# ---------- Node.js (official tarball, sha256 verified) ----------
install_node() {
  local have arch base sums file tgz
  if command -v node >/dev/null 2>&1; then
    have=$(node -v | sed 's/^v//')
    if [[ "${have%%.*}" == "$NODE_MAJOR" ]]; then
      c_green "   Node.js v$have eýýäm gurnalan"
      return
    fi
  fi
  arch=$(arch_node)
  tgz=$(mktemp --suffix=.tar.xz)
  if [[ -n "${NODE_TARBALL:-}" ]]; then
    cp "$NODE_TARBALL" "$tgz"
    c_yellow "   Node.js ýerli faýldan: $NODE_TARBALL"
  else
    base="$NODE_DL_BASE/latest-v$NODE_MAJOR.x"
    sums=$(curl -fsSL --retry 3 "$base/SHASUMS256.txt") || die "Node.js sanawy alynmady: $base"
    file=$(echo "$sums" | awk -v a="linux-$arch.tar.xz" '$2 ~ a"$" {print $2; exit}')
    [[ -n "$file" ]] || die "Node.js v$NODE_MAJOR linux-$arch tapylmady"
    echo "   Node.js ýüklenýär: $base/$file"
    download "$base/$file" "$tgz"
    echo "$(echo "$sums" | awk -v f="$file" '$2==f{print $1}')  $tgz" | sha256sum -c --quiet - || die "Node.js sha256 gabat gelmedi"
    c_green "   ✓ sha256 barlandy"
  fi
  rm -rf "$NODE_HOME"
  mkdir -p "$NODE_HOME"
  tar -C "$NODE_HOME" --strip-components=1 -xJf "$tgz"
  rm -f "$tgz"
  for b in node npm npx corepack; do ln -sf "$NODE_HOME/bin/$b" "/usr/local/bin/$b"; done
  c_green "   ✓ Node.js $(node -v), npm $(npm -v)"
}

# ---------- build one release into $1 ----------
build_release() {
  local dest="$1"
  mkdir -p "$dest/api" "$dest/web"

  step "Backend gurulýar (Go)"
  (
    cd "$SRC_DIR/backend"
    export PATH="$GO_HOME/bin:$PATH" CGO_ENABLED=0 GOFLAGS="${GOFLAGS:-} -trimpath"
    [[ -n "${GOPROXY:-}" ]] && echo "   GOPROXY=$GOPROXY"
    go build -ldflags="-s -w" -o "$dest/api/azyksowda-api" ./cmd/server
  )
  c_green "   ✓ api/azyksowda-api ($(du -h "$dest/api/azyksowda-api" | cut -f1))"

  step "Frontend gurulýar (Next.js)"
  (
    cd "$SRC_DIR/frontend"
    local reg=()
    [[ -n "${NPM_REGISTRY:-}" ]] && reg=(--registry "$NPM_REGISTRY") && echo "   npm registry: $NPM_REGISTRY"
    # npm writes node_modules/.package-lock.json on install; newer than the
    # lockfile means the tree is current (and a running `next dev` keeps its files)
    if [[ "${NPM_CI:-auto}" == auto && node_modules/.package-lock.json -nt package-lock.json ]]; then
      echo "   node_modules häzirki package-lock.json bilen gabat gelýär"
    else
      npm ci --no-audit --no-fund "${reg[@]}"
    fi
    # .next/dev belongs to a running `next dev`; only drop the previous output
    rm -rf .next/standalone
    NEXT_PUBLIC_API_URL="$SITE_URL" NEXT_PUBLIC_SITE_URL="$SITE_URL" NEXT_TELEMETRY_DISABLED=1 npm run build
    [[ -f .next/standalone/server.js ]] || die "standalone çykyşy tapylmady (next.config: output: \"standalone\")"
    cp -a .next/standalone/. "$dest/web/"
    mkdir -p "$dest/web/.next"
    cp -a .next/static "$dest/web/.next/static"
    cp -a public "$dest/web/public"
  )
  [[ "$(uname -s)" == Linux ]] || portable_web "$dest/web"
  c_green "   ✓ web/ ($(du -sh "$dest/web" | cut -f1))"

  (cd "$SRC_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "local") > "$dest/VERSION"
  date -u +%Y-%m-%dT%H:%M:%SZ >> "$dest/VERSION"
}

# A standalone build made on Windows/macOS carries that OS's sharp binary and
# its absolute build path in the embedded config; make it Linux-clean.
portable_web() { # web dir
  local web="$1"
  rm -rf "$web"/node_modules/@img/sharp-win32-* "$web"/node_modules/@img/sharp-darwin-* \
    "$web"/node_modules/@img/sharp-libvips-darwin-*
  (cd "$SRC_DIR/frontend" && node -e '
    const fs = require("fs"), path = require("path");
    const web = process.argv[1];
    const esc = JSON.stringify(process.cwd()).slice(1, -1); // as written inside JSON
    for (const f of ["server.js", ".next/required-server-files.json"]) {
      const p = path.join(web, f);
      if (fs.existsSync(p)) fs.writeFileSync(p, fs.readFileSync(p, "utf8").split(esc).join("/srv/azyksowda/frontend"));
    }' "$web")
  c_yellow "   $(uname -s) gurluşy Linux üçin arassalandy (sharp binary, ýollar)"
}

# ---------- releases ----------
current_release() { readlink -f "$APP_ROOT/current" 2>/dev/null || true; }

activate_release() { # path
  ln -sfn "$1" "$APP_ROOT/current.new"
  mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
}

prune_releases() {
  local keep="$KEEP_RELEASES" cur
  cur=$(current_release)
  { ls -1dt "$APP_ROOT"/releases/*/ 2>/dev/null || true; } | tail -n +$((keep + 1)) | while read -r d; do
    d="${d%/}"
    [[ "$d" == "$cur" ]] && continue
    rm -rf "$d" && echo "   köne reliz pozuldy: $(basename "$d")"
  done
  return 0
}

restart_services() {
  systemctl daemon-reload
  systemctl restart azyksowda-api
  systemctl restart azyksowda-web
}

health_check() {
  local i
  for i in $(seq 1 40); do
    if curl -fsS -m 3 "http://127.0.0.1:$API_PORT/api/health" >/dev/null 2>&1 &&
      curl -fsS -m 10 -o /dev/null "http://127.0.0.1:$WEB_PORT/" 2>/dev/null; then
      c_green "   ✓ API we saýt jogap berýär"
      return 0
    fi
    sleep 1.5
  done
  c_red "   API ýa-da saýt jogap bermedi"
  journalctl -u azyksowda-api -n 20 --no-pager || true
  journalctl -u azyksowda-web -n 20 --no-pager || true
  return 1
}
