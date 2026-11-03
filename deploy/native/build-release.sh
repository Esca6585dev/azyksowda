#!/usr/bin/env bash
# =============================================================================
#  AzykSowda — taýýar reliz arhiwi (serwerde internet çäkli bolsa)
#
#  Interneti bar kompýuterde işlediň (Linux ýa-da Windows WSL maslahat berilýär;
#  Go we Node.js 24 gurnalan bolmaly):
#      bash deploy/native/build-release.sh            # linux/amd64
#      TARGET_ARCH=arm64 bash deploy/native/build-release.sh
#
#  Netije: dist/azyksowda-release-<commit>.tar.gz
#  Serwere: scp dist/azyksowda-release-*.tar.gz root@SERWER:/root/
#           sudo bash deploy/native/install.sh --release /root/azyksowda-release-*.tar.gz
#           (soňky gezekler: sudo bash deploy/native/update.sh --release ...)
#  Serwerde diňe Node.js runtime gerek (NODE_TARBALL=... bilen hem bolýar), Go gerek däl.
# =============================================================================
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

command -v go >/dev/null || die "Go gurnalmadyk"
command -v npm >/dev/null || die "Node.js/npm gurnalmadyk"
if [[ "$(uname -s)" != Linux ]]; then
  c_yellow "DUÝDURYŞ: Next.js standalone $(uname -s) ulgamynda gurulýar. Ygtybarly bolmagy üçin Linux/WSL ulanyň."
fi

export GOOS=linux GOARCH="${TARGET_ARCH:-amd64}"
REV=$(cd "$SRC_DIR" && git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)
NAME="azyksowda-release-$REV"
OUT="$SRC_DIR/dist/$NAME"
rm -rf "$OUT"
mkdir -p "$OUT"

build_release "$OUT"
cp -a "$DEPLOY_DIR" "$OUT/deploy"
rm -f "$OUT"/deploy/ssl/*.crt "$OUT"/deploy/ssl/*.key # never ship the private key inside the archive

step "Arhiw"
tar -C "$SRC_DIR/dist" -czf "$SRC_DIR/dist/$NAME.tar.gz" "$NAME"
c_green "✅ $SRC_DIR/dist/$NAME.tar.gz ($(du -h "$SRC_DIR/dist/$NAME.tar.gz" | cut -f1)) — $GOOS/$GOARCH"
