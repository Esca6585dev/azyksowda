#!/usr/bin/env bash
# =============================================================================
#  AzykSowda — şu kompýuterden serwere ýerleşdirmek. Serwere GitHub gerek däl.
#
#    bash deploy/push.sh              # gur -> serwere iber -> gurna ýa-da täzele -> barla
#    bash deploy/push.sh --hook       # mundan beýläk `git push` (main) serwere hem ýerleşdirýär
#    bash deploy/push.sh --unhook     # git push hook-y aýyr
#    bash deploy/push.sh --no-build   # şu commit üçin dist/ içinde gurlan arhiwi ulan
#    SSH_HOST=ubuntu@216.250.10.109 SSH_PORT=2222 bash deploy/push.sh
#
#  Reliz şu ýerde gurulýar (Go linux binary + Next.js standalone) we scp bilen
#  iberilýär. Serwerde ilkinji gezek install.sh, soň update.sh --release
#  işleýär; barlag şowsuz bolsa öňki wersiýa özi gaýdýar. Serwerde Node.js 24
#  ýok bolsa we nodejs.org açylmasa, resmi arhiw şu ýerden äkidilýär.
#  Gerek: açar bilen ssh (~/.ssh/config içinde "azyksowda"), serwerde sudo.
# =============================================================================
source "$(dirname "${BASH_SOURCE[0]}")/native/lib.sh"

SSH_HOST="${SSH_HOST:-azyksowda}"
STAGE="${REMOTE_STAGE:-azyksowda-deploy}" # under the remote user's home
SSH_OPTS=(-o ConnectTimeout=20 -o ServerAliveInterval=30)
SCP_OPTS=(-q -o ConnectTimeout=20)
if [[ -n "${SSH_PORT:-}" ]]; then
  SSH_OPTS+=(-p "$SSH_PORT")
  SCP_OPTS+=(-P "$SSH_PORT")
fi
ALLOW_DIRTY=0
BUILD=1

for arg in "$@"; do case "$arg" in
  --hook)
    git -C "$SRC_DIR" config core.hooksPath .githooks
    c_green "✅ git push (main) indi serwere hem ýerleşdirýär. Bir gezek geçmek: NO_DEPLOY=1 git push"
    exit 0 ;;
  --unhook)
    git -C "$SRC_DIR" config --unset core.hooksPath || true
    c_green "✅ git push hook-y aýryldy"
    exit 0 ;;
  --allow-dirty) ALLOW_DIRTY=1 ;;
  --no-build) BUILD=0 ;; # reuse the dist/ archive of the current commit
  -h | --help) sed -n '2,16p' "$0"; exit 0 ;;
  *) die "näbelli parametr: $arg" ;;
esac; done

rssh() { ssh "${SSH_OPTS[@]}" "$SSH_HOST" "$@"; }
rscp() { scp "${SCP_OPTS[@]}" "$@"; }

# ---------------------------------------------------------------------------
step "Barlag"
if [[ $ALLOW_DIRTY == 0 && -n "$(git -C "$SRC_DIR" status --porcelain -- backend frontend deploy)" ]]; then
  git -C "$SRC_DIR" status --short -- backend frontend deploy
  die "commit edilmedik üýtgeşmeler bar. Ilki commit ediň (ýa-da: bash deploy/push.sh --allow-dirty)"
fi
if ! ssh -o BatchMode=yes "${SSH_OPTS[@]}" "$SSH_HOST" true 2>/dev/null; then
  pub=$(cat ~/.ssh/id_ed25519.pub 2>/dev/null || cat ~/.ssh/id_rsa.pub 2>/dev/null || echo "<~/.ssh/*.pub>")
  die "serwere açar bilen girip bolmady: $SSH_HOST
   Serwerde bir gezek işlediň:
     mkdir -p ~/.ssh && echo '$pub' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
fi

# arch | node version | installed? | passwordless sudo? | nodejs.org reachable?
mapfile -t INFO < <(rssh 'uname -m
  node -v 2>/dev/null || echo none
  test -f /etc/systemd/system/azyksowda-api.service && echo installed || echo fresh
  sudo -n true 2>/dev/null && echo sudo || echo sudo-password
  curl -fsI -m 8 https://nodejs.org/dist/ >/dev/null 2>&1 && echo online || echo offline')
case "${INFO[0]}" in
  x86_64 | amd64) ARCH=amd64 NODE_ARCH=x64 ;;
  aarch64 | arm64) ARCH=arm64 NODE_ARCH=arm64 ;;
  *) die "goldanmaýan arhitektura: ${INFO[0]}" ;;
esac
REMOTE_NODE="${INFO[1]}" MODE="${INFO[2]}" SUDO="${INFO[3]}" NET="${INFO[4]}"
c_green "   ✓ $SSH_HOST: linux/$ARCH, node $REMOTE_NODE, $MODE, $SUDO, internet: $NET"
if [[ $MODE == fresh ]]; then
  for f in "$DOMAIN.crt" ca_bundle.crt private.key; do
    [[ -s "$DEPLOY_DIR/ssl/$f" ]] || die "ilkinji gurnama üçin SSL faýly gerek: deploy/ssl/$f"
  done
fi

# ---------------------------------------------------------------------------
NAME="azyksowda-release-$(git -C "$SRC_DIR" rev-parse --short HEAD)"
ARCHIVE="$SRC_DIR/dist/$NAME.tar.gz"
if [[ $BUILD == 1 || ! -f "$ARCHIVE" ]]; then
  TARGET_ARCH=$ARCH bash "$NATIVE_DIR/build-release.sh"
else
  c_green "   gurlan arhiw ulanylýar: dist/$NAME.tar.gz"
fi
[[ -f "$ARCHIVE" ]] || die "arhiw tapylmady: $ARCHIVE"
rm -rf "${ARCHIVE%.tar.gz}"
{ ls -1t "$SRC_DIR"/dist/azyksowda-release-*.tar.gz 2>/dev/null || true; } | tail -n +4 | xargs -r rm -f

NODE_FILE=""
if [[ $MODE == fresh && "${REMOTE_NODE#v}" != "$NODE_MAJOR".* && $NET == offline ]]; then
  step "Node.js $NODE_MAJOR arhiwi (serwerde nodejs.org açylmaýar)"
  base="$NODE_DL_BASE/latest-v$NODE_MAJOR.x"
  sums=$(curl -fsSL --retry 3 "$base/SHASUMS256.txt") || die "Node.js sanawy alynmady: $base"
  file=$(echo "$sums" | awk -v a="linux-$NODE_ARCH.tar.xz" '$2 ~ a"$" {print $2; exit}')
  [[ -n "$file" ]] || die "Node.js linux-$NODE_ARCH tapylmady"
  NODE_FILE="$SRC_DIR/dist/$file"
  [[ -f "$NODE_FILE" ]] || download "$base/$file" "$NODE_FILE"
  (cd "$SRC_DIR/dist" && echo "$sums" | awk -v f="$file" '$2==f' | sha256sum -c --quiet -) || die "Node.js sha256 gabat gelmedi"
  c_green "   ✓ $file (sha256 barlandy)"
fi

# ---------------------------------------------------------------------------
step "Serwere iberilýär ($(du -h "$ARCHIVE" | cut -f1))"
rssh "mkdir -p ~/$STAGE/ssl && chmod 700 ~/$STAGE"
rscp "$ARCHIVE" "$SSH_HOST:$STAGE/release.tar.gz"
[[ -n "$NODE_FILE" ]] && rscp "$NODE_FILE" "$SSH_HOST:$STAGE/node.tar.xz"
if [[ $MODE == fresh ]]; then
  rscp "$DEPLOY_DIR/ssl/$DOMAIN.crt" "$DEPLOY_DIR/ssl/ca_bundle.crt" "$DEPLOY_DIR/ssl/private.key" "$SSH_HOST:$STAGE/ssl/"
fi
c_green "   ✓ iberildi"

REMOTE_SCRIPT=$(mktemp)
cat >"$REMOTE_SCRIPT" <<EOF
set -euo pipefail
cd ~/$STAGE
chmod 600 ssl/* 2>/dev/null || true
rm -rf release && mkdir release
tar -C release --strip-components=1 --no-same-owner -xzf release.tar.gz
chmod 755 release/api/azyksowda-api # archives made on Windows lose the exec bit
if [[ "$MODE" == fresh ]]; then
  cp ssl/* release/deploy/ssl/
  NODE_ARG=()
  [[ -f node.tar.xz ]] && NODE_ARG=(NODE_TARBALL="\$PWD/node.tar.xz")
  sudo env "\${NODE_ARG[@]}" bash release/deploy/native/install.sh --release "\$PWD/release"
else
  sudo bash release/deploy/native/update.sh --release "\$PWD/release"
fi
EOF
rscp "$REMOTE_SCRIPT" "$SSH_HOST:$STAGE/run.sh"
rm -f "$REMOTE_SCRIPT"

step "Serwerde $([[ $MODE == fresh ]] && echo "gurnalýar (install.sh)" || echo "täzelenýär (update.sh)")"
TTY=()
[[ -t 0 && $SUDO != sudo ]] && TTY=(-t) # let sudo ask for the password
status=0
ssh "${TTY[@]}" "${SSH_OPTS[@]}" "$SSH_HOST" "bash ~/$STAGE/run.sh" || status=$?
# never leave the private key or the unpacked release in the staging folder
rssh "rm -rf ~/$STAGE/ssl/* ~/$STAGE/release ~/$STAGE/release.tar.gz ~/$STAGE/node.tar.xz ~/$STAGE/run.sh" || true
[[ $status == 0 ]] || die "serwerde ýalňyşlyk (ýokarky loga serediň)"

rssh "sudo -n journalctl -u azyksowda-api -n 300 --no-pager 2>/dev/null | grep -E '\\[SEED\\]' | tail -3" || true
c_green "✅ $SITE_URL — $(git -C "$SRC_DIR" log -1 --format='%h %s')"
