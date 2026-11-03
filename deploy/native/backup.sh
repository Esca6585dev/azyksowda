#!/usr/bin/env bash
# Daily backup of the SQLite database (online, consistent) + weekly uploads archive.
# Installed by install.sh as /etc/cron.daily/azyksowda-backup.
set -euo pipefail

DATA_DIR="${DATA_DIR:-/var/lib/azyksowda}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/azyksowda}"
KEEP_DAYS="${KEEP_DAYS:-14}"
DB="$DATA_DIR/data/azyksowda.db"
STAMP=$(date +%Y%m%d-%H%M)

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

if [[ -f "$DB" ]]; then
  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB" ".backup '$BACKUP_DIR/db-$STAMP.db'"
  else
    cp "$DB" "$BACKUP_DIR/db-$STAMP.db"
  fi
  gzip -f "$BACKUP_DIR/db-$STAMP.db"
fi

# uploads once a week (Sunday)
if [[ "$(date +%u)" == "7" && -d "$DATA_DIR/uploads" ]]; then
  tar -C "$DATA_DIR" -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" uploads
fi

find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete
