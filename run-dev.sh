#!/usr/bin/env bash
# AzykSowda — ýerli (dev) işletmek (Linux/macOS/Git Bash)
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$ROOT/backend/.env" ]] || cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
[[ -d "$ROOT/frontend/node_modules" ]] || (cd "$ROOT/frontend" && npm install)

(cd "$ROOT/backend" && go run ./cmd/server) &
BACK=$!
sleep 2
(cd "$ROOT/frontend" && npm run dev) &
FRONT=$!

echo
echo "Saýt:        http://localhost:3000"
echo "Admin panel: http://localhost:3000/admin   (admin@azyksowda.com / admin123)"
echo "API:         http://localhost:8080/api/health"
trap "kill $BACK $FRONT 2>/dev/null" EXIT
wait
