#!/usr/bin/env bash
# Updates a running NSB server from ~/nsb.tgz (packed on the dev PC, see docs/DEPLOY.md "Updating").
#   tar -xzOf ~/nsb.tgz ./deploy/update.sh > ~/update.sh && bash ~/update.sh
# Keeps deploy/.env, backs up the database first, keeps the previous code in ~/nsb.prev,
# and leaves the old containers running until the new images are built.
set -euo pipefail
cd ~

[ -f nsb.tgz ] || { echo "~/nsb.tgz not found. Upload it first (see docs/DEPLOY.md)."; exit 1; }
[ -f nsb/deploy/.env ] || { echo "~/nsb/deploy/.env not found. This script is for updating an existing install."; exit 1; }

echo "== 1/5 backing up the database"
mkdir -p backups
(cd nsb/deploy && docker compose exec -T postgres pg_dump -U nsb -Fc nsb) > "backups/nsb-predeploy-$(date +%F-%H%M).dump"
find backups -name 'nsb-predeploy-*.dump' -mtime +14 -delete
ls -t backups | head -1

echo "== 2/5 unpacking the new code"
rm -rf nsb.new && mkdir nsb.new
tar -xzf nsb.tgz -C nsb.new
rm nsb.tgz
cp nsb/deploy/.env nsb.new/deploy/.env
rm -rf nsb.prev && mv nsb nsb.prev && mv nsb.new nsb

echo "== 3/5 building and restarting (a few minutes; the old site stays up meanwhile)"
cd nsb/deploy
docker compose up -d --build 2>&1 | grep -E 'Built|Recreated|Started|Healthy|error|Error|Killed' || true

echo "== 4/5 waiting for the API"
for i in $(seq 1 30); do
  if docker compose exec -T api wget -qO- http://127.0.0.1:4000/api/health 2>/dev/null | grep -q ok; then break; fi
  sleep 2
done
docker compose ps --format 'table {{.Service}}\t{{.Status}}'
docker compose logs api --since 3m 2>&1 | grep -E 'Migrations applied|successfully started|Error' | tail -3 || true

echo "== 5/5 cleaning up old images"
docker image prune -f >/dev/null
echo "Done. If something is wrong: see 'Rollback' in docs/DEPLOY.md"
