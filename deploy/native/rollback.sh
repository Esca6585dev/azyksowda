#!/usr/bin/env bash
# AzykSowda — öňki relize gaýtmak.
#   sudo bash deploy/native/rollback.sh            # bir öňki reliz
#   sudo bash deploy/native/rollback.sh --list     # relizleriň sanawy
#   sudo bash deploy/native/rollback.sh 20261103-120501
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need_root "$@"

CUR=$(current_release)
mapfile -t RELEASES < <(ls -1dt "$APP_ROOT"/releases/*/ 2>/dev/null | sed 's#/$##')
[[ ${#RELEASES[@]} -gt 0 ]] || die "reliz ýok"

if [[ "${1:-}" == "--list" ]]; then
  for r in "${RELEASES[@]}"; do
    mark="  "; [[ "$r" == "$CUR" ]] && mark="* "
    echo "$mark$(basename "$r")  $(head -1 "$r/VERSION" 2>/dev/null)"
  done
  exit 0
fi

TARGET=""
if [[ -n "${1:-}" ]]; then
  TARGET="$APP_ROOT/releases/$1"
  [[ -d "$TARGET" ]] || die "tapylmady: $1"
else
  for i in "${!RELEASES[@]}"; do
    if [[ "${RELEASES[$i]}" == "$CUR" && -n "${RELEASES[$((i + 1))]:-}" ]]; then
      TARGET="${RELEASES[$((i + 1))]}"
      break
    fi
  done
  [[ -n "$TARGET" ]] || die "öňki reliz ýok"
fi

step "Yza gaýdylýar: $(basename "$CUR") -> $(basename "$TARGET")"
activate_release "$TARGET"
restart_services
health_check || die "öňki reliz hem başlamady"
c_green "✅ Işleýän reliz: $(basename "$TARGET")"
