#!/usr/bin/env bash
# =============================================================================
#  AzykSowda — SSL gurnamak skripti (azyksowda.com.tm)
#
#  Näme edýär:
#    1. deploy/ssl/ içindäki sertifikat, CA bundle we açary barlaýar
#       (açar sertifikata gabat gelýärmi, zynjyr dogrumy, möhleti haçan gutarýar)
#    2. nginx üçin fullchain.crt (domain cert + ca_bundle) döredýär
#    3. --nginx bilen: faýllary /etc/nginx/ssl/azyksowda.com.tm/ içine göçürýär,
#       nginx konfigini ýazýar, "nginx -t" barlap, nginx-i täzeden ýükleýär
#
#  Ulanylyşy:
#    ./deploy/install-ssl.sh                 # diňe barla + fullchain döret (docker üçin ýeterlik)
#    sudo ./deploy/install-ssl.sh --nginx    # serwerde nginx-e gurna
#    sudo ./deploy/install-ssl.sh --nginx --api 127.0.0.1:8080 --web 127.0.0.1:3000
#
#  Täze sertifikat gelende: 3 faýly deploy/ssl/ içine goýuň we skripti täzeden işlediň.
# =============================================================================
set -euo pipefail

DOMAIN="azyksowda.com.tm"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_SRC="${SSL_SRC:-$HERE/ssl}"
CERT="$SSL_SRC/$DOMAIN.crt"
BUNDLE="$SSL_SRC/ca_bundle.crt"
KEY="$SSL_SRC/private.key"
FULL="$SSL_SRC/fullchain.crt"

INSTALL_NGINX=0
API_UPSTREAM="127.0.0.1:8080"
WEB_UPSTREAM="127.0.0.1:3000"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --nginx) INSTALL_NGINX=1 ;;
    --api) API_UPSTREAM="$2"; shift ;;
    --web) WEB_UPSTREAM="$2"; shift ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Näbelli parametr: $1"; exit 1 ;;
  esac
  shift
done

green() { printf '\033[32m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }

command -v openssl >/dev/null || { red "openssl tapylmady. Gurnaň: apt install openssl"; exit 1; }

echo "== 1/3 Sertifikat faýllary barlanýar ($SSL_SRC)"
for f in "$CERT" "$BUNDLE" "$KEY"; do
  [[ -s "$f" ]] || { red "Faýl ýok ýa-da boş: $f"; exit 1; }
done

SUBJECT=$(openssl x509 -in "$CERT" -noout -subject | sed 's/^subject=//')
NOT_AFTER=$(openssl x509 -in "$CERT" -noout -enddate | cut -d= -f2)
SANS=$(openssl x509 -in "$CERT" -noout -ext subjectAltName 2>/dev/null | tail -n +2 | tr -d ' ' || true)
echo "   Subject : $SUBJECT"
echo "   SAN     : ${SANS:-?}"
echo "   Möhleti : $NOT_AFTER"

if ! openssl x509 -in "$CERT" -noout -checkend 0 >/dev/null; then
  red "   Sertifikatyň möhleti GUTARAN!"; exit 1
fi
if ! openssl x509 -in "$CERT" -noout -checkend $((30*24*3600)) >/dev/null; then
  yellow "   DUÝDURYŞ: möhleti 30 günden az galdy — täzesini sargyt ediň."
fi

CERT_MOD=$(openssl x509 -noout -modulus -in "$CERT" | openssl md5)
KEY_MOD=$(openssl rsa  -noout -modulus -in "$KEY" 2>/dev/null | openssl md5 || true)
if [[ -z "$KEY_MOD" || "$CERT_MOD" != "$KEY_MOD" ]]; then
  red "   private.key bu sertifikata GABAT GELMEÝÄR!"; exit 1
fi
green "   ✓ Açar sertifikata gabat gelýär"

if openssl verify -CAfile "$BUNDLE" "$CERT" >/dev/null 2>&1; then
  green "   ✓ CA zynjyry dogry ($(grep -c 'BEGIN CERTIFICATE' "$BUNDLE") ara sertifikat)"
else
  yellow "   ! Zynjyr doly barlanmady (ulgam CA ammary bolmazlygy mümkin) — dowam edilýär"
fi

echo "== 2/3 fullchain.crt döredilýär"
{ cat "$CERT"; echo; cat "$BUNDLE"; } | sed '/^$/d' > "$FULL"
chmod 644 "$FULL"
green "   ✓ $FULL ($(grep -c 'BEGIN CERTIFICATE' "$FULL") sertifikat)"

if [[ $INSTALL_NGINX -eq 0 ]]; then
  echo
  green "Taýýar. Docker bilen işletmek üçin: docker compose up -d --build"
  echo "Serwerde nginx-e gurnamak üçin: sudo $0 --nginx"
  exit 0
fi

echo "== 3/3 nginx-e gurnalýar"
[[ $EUID -eq 0 ]] || { red "--nginx üçin root gerek: sudo $0 --nginx"; exit 1; }
command -v nginx >/dev/null || { red "nginx gurnalmadyk: apt install nginx"; exit 1; }
command -v envsubst >/dev/null || { red "envsubst ýok: apt install gettext-base"; exit 1; }

DEST="/etc/nginx/ssl/$DOMAIN"
install -d -m 755 "$DEST"
install -m 644 "$FULL"   "$DEST/fullchain.crt"
install -m 644 "$BUNDLE" "$DEST/ca_bundle.crt"
install -m 600 "$KEY"    "$DEST/private.key"
green "   ✓ Sertifikatlar: $DEST"

install -d -m 755 /etc/nginx/snippets /var/www/html
install -m 644 "$HERE/nginx/snippets/azyksowda-ssl.conf" /etc/nginx/snippets/azyksowda-ssl.conf

CONF_DIR="/etc/nginx/sites-available"; ENABLED="/etc/nginx/sites-enabled"
if [[ ! -d "$CONF_DIR" ]]; then CONF_DIR="/etc/nginx/conf.d"; ENABLED=""; fi
export API_UPSTREAM WEB_UPSTREAM
envsubst '${API_UPSTREAM} ${WEB_UPSTREAM}' < "$HERE/nginx/templates/default.conf.template" > "$CONF_DIR/azyksowda.conf"

# nginx < 1.25.1 (Ubuntu 22.04 = 1.18, 24.04 = 1.24) has no "http2 on;" directive
NGX_VER=$(nginx -v 2>&1 | sed -n 's#.*nginx/\([0-9.]*\).*#\1#p')
if [[ -n "$NGX_VER" && "$(printf '%s\n%s\n' "$NGX_VER" 1.25.1 | sort -V | head -n1)" == "$NGX_VER" && "$NGX_VER" != 1.25.1 ]]; then
  sed -i -e '/^[[:space:]]*http2 on;/d' -e 's/listen \(\[::\]:\)\{0,1\}443 ssl;/listen \1443 ssl http2;/' "$CONF_DIR/azyksowda.conf"
  yellow "   (nginx $NGX_VER: 'listen ... ssl http2' görnüşi ulanyldy)"
fi
# servers without IPv6 cannot bind [::]
if [[ ! -f /proc/net/if_inet6 ]]; then
  sed -i '/listen \[::\]:/d' "$CONF_DIR/azyksowda.conf"
  yellow "   (IPv6 ýok: [::] listen setirleri aýryldy)"
fi
if [[ -n "$ENABLED" ]]; then
  ln -sf "$CONF_DIR/azyksowda.conf" "$ENABLED/azyksowda.conf"
  [[ -e "$ENABLED/default" ]] && rm -f "$ENABLED/default" && yellow "   (default saýt öçürildi)"
fi
green "   ✓ Konfig: $CONF_DIR/azyksowda.conf  (API=$API_UPSTREAM, WEB=$WEB_UPSTREAM)"

if nginx -t; then
  systemctl reload-or-restart nginx 2>/dev/null || nginx -s reload 2>/dev/null || nginx
  green "   ✓ nginx täzeden ýüklendi"
else
  red "   nginx konfig ýalňyş — ýokardaky habary okaň"; exit 1
fi

echo
green "✅ SSL gurnaldy: https://$DOMAIN  (möhleti: $NOT_AFTER)"
echo "Barlamak: curl -vI https://$DOMAIN 2>&1 | grep -E 'HTTP|expire|issuer'"
