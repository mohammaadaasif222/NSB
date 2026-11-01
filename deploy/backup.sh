#!/usr/bin/env bash
# Nightly backup of the database and local images to ~/backups, keeping 14 days. With BACKUP_REMOTE
# set in deploy/.env (an rclone destination, e.g. r2:nsb-backups) it also copies them off the server,
# which is what protects against losing the server. See docs/DEPLOY.md "Backups".
set -euo pipefail

cd ~/nsb/deploy
out=~/backups
stamp=$(date +%F)
mkdir -p "$out"

# Written to a temporary name first, so a failed run never leaves a broken file that looks finished.
docker compose exec -T postgres pg_dump -U nsb -Fc nsb > "$out/.nsb-$stamp.dump"
docker compose exec -T api tar -czf - -C /repo/apps/api uploads > "$out/.nsb-uploads-$stamp.tgz"
mv "$out/.nsb-$stamp.dump" "$out/nsb-$stamp.dump"
mv "$out/.nsb-uploads-$stamp.tgz" "$out/nsb-uploads-$stamp.tgz"
find "$out" -name 'nsb-*' -mtime +14 -delete

remote=$(sed -n 's/^BACKUP_REMOTE=//p' .env)
if [ -n "$remote" ]; then
  rclone copy "$out/nsb-$stamp.dump" "$remote"
  rclone copy "$out/nsb-uploads-$stamp.tgz" "$remote"
  echo "Backed up to $remote"
else
  echo "WARNING: BACKUP_REMOTE is not set, so this backup exists only on this server." >&2
fi
