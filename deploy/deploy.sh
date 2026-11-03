#!/usr/bin/env bash
# AzykSowda — serwere ýerleşdirmek (Docker-SYZ).
# Ilkinji gezek gurnaýar, soňky gezekler täzeleýär.
#   cd /opt/azyksowda && sudo bash deploy/deploy.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f /etc/systemd/system/azyksowda-api.service ]]; then
  exec bash "$HERE/native/update.sh" "$@"
else
  exec bash "$HERE/native/install.sh" "$@"
fi
