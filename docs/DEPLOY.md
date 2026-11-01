# Deploying NSB

The production stack is [deploy/docker-compose.yml](../deploy/docker-compose.yml): Caddy, API, web and Postgres on one Docker host. Any Ubuntu server works.

- **Free staging now:** an Oracle Cloud Always Free ARM VM. Do steps 1 to 7.
- **Production later:** a Hostinger KVM VPS. Do [Hostinger setup](#hostinger-setup), then steps 3 to 7, then follow [Moving servers](#moving-servers) to bring the data across.

## Hostinger setup

1. In hPanel, pick **Ubuntu 24.04** as the OS (plain, without a control panel). Set the root password, or add the public half of your SSH key under **SSH keys**. Note the server IP from the VPS overview page.
2. Log in as `root`: `ssh root@<server-ip>`. Hostinger's Ubuntu image has no firewall rules of its own, so ports 80 and 443 are already open. If you enable the hPanel **Firewall** later, allow TCP 22, 80 and 443 there.
3. **KVM1 (1 vCPU, 4 GB) only:** add swap before the first build. The Next.js build can briefly need more than 4 GB, and without swap the kernel kills it with no useful error:

   ```bash
   fallocate -l 3G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   free -h   # Swap line should show 3.0Gi
   ```

   Expect the first build to take 8–12 minutes on 1 vCPU. The running site is unaffected by this.
4. Steps 3 to 7 use `ubuntu@` and `-i $HOME\.ssh\oracle.key`; on Hostinger use `root@<server-ip>` instead, with no `-i` if you chose a password. `sudo` is not needed as root, but it does no harm.

## 1. Create the VM (Oracle only)

1. Sign up at cloud.oracle.com. A card is asked for verification only. Choose a home region near Noida (Mumbai or Hyderabad). The home region can't be changed later.
2. Go to **Compute › Instances › Create instance**.
   - **Image:** Canonical Ubuntu 24.04 (the aarch64 build is picked automatically for ARM).
   - **Shape:** Ampere `VM.Standard.A1.Flex`, 2 OCPU and 12 GB. The Always Free allowance is 4 OCPU and 24 GB in total. Don't use the 1 GB AMD micro shape: it is too small to build the web image.
   - **SSH keys:** "Generate a key pair for me" and download the private key, for example to `C:\Users\<you>\.ssh\oracle.key`.
   - **Boot volume:** the default 50 GB is fine. Up to 200 GB is free.
3. If you see "Out of capacity", try another availability domain or try again later.
4. The public IP shown on the instance page stays the same when the VM is stopped, started or rebooted. It is lost only if the instance is terminated. A reserved IP survives that too, but switching to one gives a **new** address. To switch, open **Attached VNICs › the VNIC › IPv4 addresses**, edit the address and choose **Reserved public IP**. This is optional for staging.
5. Oracle may reclaim Always Free VMs that stay idle for a week. A staging site with little traffic can count as idle. Upgrading the account to **Pay As You Go** stops this, and Always Free resources still cost nothing.

## 2. Open ports 80 and 443 (Oracle only)

Two firewalls need to allow the ports.

1. **Cloud firewall:** go to **Networking › Virtual cloud networks › your VCN › Security Lists › Default Security List › Add Ingress Rules**. Add source `0.0.0.0/0`, TCP, destination port `80`. Add the same rule again for `443`.
2. **Server firewall:** Oracle's Ubuntu image rejects everything except SSH. SSH in and run the following. It inserts the rules just above the `REJECT` rule, because rules placed below it never apply:

   ```bash
   N=$(sudo iptables -L INPUT --line-numbers | awk '/REJECT/{print $1; exit}')
   sudo iptables -I INPUT $N -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo iptables -I INPUT $N -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo netfilter-persistent save
   sudo iptables -L INPUT -n --line-numbers   # 80 and 443 must be listed above REJECT
   ```

## 3. Install Docker

SSH in from PowerShell. The user is `ubuntu` on Oracle and `root` on Hostinger.

```powershell
ssh -i $HOME\.ssh\oracle.key ubuntu@<server-ip>
```

If ssh says the key is "unprotected", run `icacls $HOME\.ssh\oracle.key /inheritance:r /grant:r "$($env:USERNAME):R"` once.

On the server:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit   # log in again so the docker group applies
```

## 4. Upload the code

This folder is not a git repo, so pack it on Windows and copy it up. Run in PowerShell from the repo root:

```powershell
tar -czf $env:TEMP\nsb.tgz --exclude=node_modules --exclude=dist --exclude=.next --exclude=uploads --exclude=.env --exclude=*.tsbuildinfo --exclude=assets --exclude=cred.txt .
scp -i $HOME\.ssh\oracle.key $env:TEMP\nsb.tgz ubuntu@<server-ip>:~
```

On the server:

```bash
mkdir -p ~/nsb && tar -xzf ~/nsb.tgz -C ~/nsb && rm ~/nsb.tgz
```

The archive leaves out local secrets (`apps/api/.env`), build output and local uploads. If the code moves to a private GitHub repo later, `git clone` and `git pull` replace this step.

## 5. Configure

```bash
cd ~/nsb/deploy
cp .env.example .env
openssl rand -hex 24      # use for POSTGRES_PASSWORD (hex keeps the database URL valid)
openssl rand -hex 32      # use for JWT_SECRET
openssl rand -hex 32      # use for SETTINGS_ENCRYPTION_KEY
nano .env
```

| Variable | Value |
|---|---|
| `SITE_ADDRESS` | No domain yet: `<ip-with-dashes>.sslip.io`, e.g. `140-238-1-2.sslip.io`. It resolves to the IP, and Caddy gets a real HTTPS certificate for it. With a domain: `staging.noidasuperbazaar.com`, with an A record pointing to the IP. |
| `SITE_URL` | `https://` + the same address |
| `POSTGRES_PASSWORD`, `JWT_SECRET`, `SETTINGS_ENCRYPTION_KEY` | The generated values. **Save them somewhere safe.** The encrypted settings (Cloudinary, Firebase and SMTP secrets) can only be read with the same key, so the move to Hostinger must reuse it. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | The first admin login. The password needs at least 12 characters and cannot be the example value. |
| `COOKIE_SECURE` | Keep `true`. |

## 6. Start

```bash
docker compose up -d --build                   # first build takes a few minutes
docker compose exec api node dist/db/seed.js   # first deploy only: categories + admin login
docker compose ps                              # all four services should be "running"/"healthy"
```

Optional demo vendors for staging: `docker compose exec api node dist/db/seed-demo.js`. Add `--remove` to delete them before launch.

## 7. Check

- Open `https://<SITE_ADDRESS>/api/health`. It should return `{"status":"ok"}`, which means the API can reach the database.
- Open `https://<SITE_ADDRESS>/admin` and sign in.
- In **Admin › Settings**, choose image storage. Local disk works on a VPS. Cloudinary's free tier keeps images off the server. Then enter the SMTP details and send a test email.
- Logs: `docker compose logs -f api` (or `web`, `caddy`). If HTTPS fails, the Caddy log usually shows a port 80/443 that is still blocked.

## Updating

Four commands. The first two run on your PC in PowerShell from the repo root, the last two on the server. Replace `root@200.234.37.125` with `ubuntu@92.4.76.205` for Oracle.

```powershell
tar -czf $env:TEMP\nsb.tgz --exclude=node_modules --exclude=dist --exclude=.next --exclude=uploads --exclude=.env --exclude=*.tsbuildinfo --exclude=assets --exclude=cred.txt .
scp -i $HOME\.ssh\oracle.key $env:TEMP\nsb.tgz root@200.234.37.125:~/
ssh -i $HOME\.ssh\oracle.key root@200.234.37.125
```

```bash
tar -xzOf ~/nsb.tgz ./deploy/update.sh > ~/update.sh && bash ~/update.sh
```

[deploy/update.sh](../deploy/update.sh) backs up the database to `~/backups/`, unpacks the code into a fresh folder (so files deleted on the PC disappear on the server too), keeps `deploy/.env`, builds, applies database migrations, moves the old code to `~/nsb.prev`, restarts, and waits for the API's health check. The old code and containers stay in place until then, so a failed build or migration leaves the site running as it was. The script exits with an error if any step fails, and prints Done only on success. The API is down for a few seconds during the restart. Run `npm run db:generate` before packing if `schema.ts` changed. Migrations run in one transaction, so an index on a large table blocks writes while it builds: once a table has hundreds of thousands of rows, create the index by hand first with `CREATE INDEX CONCURRENTLY`, and write the migration with `IF NOT EXISTS`.

### Rollback

On the server, to go back to the code that ran before the last update:

```bash
rm -rf ~/nsb.bad && mv ~/nsb ~/nsb.bad && mv ~/nsb.prev ~/nsb
cd ~/nsb/deploy && docker compose up -d --build
```

If the update also ran a migration that the old code can't handle, restore the pre-deploy dump as well:

```bash
cd ~/nsb/deploy && docker compose stop api web
docker compose exec -T postgres pg_restore -U nsb -d nsb --clean --if-exists --no-owner < ~/backups/<the predeploy dump>
docker compose start api web
```

## Backups

The database and locally stored images live in Docker volumes (`nsb_pgdata`, `nsb_uploads`). [deploy/backup.sh](../deploy/backup.sh) saves both to `~/backups` and keeps 14 days.

**Off-server copies are what protect you if the server is lost.** Install [rclone](https://rclone.org/install/), run `rclone config` to add object storage such as Cloudflare R2 or Backblaze B2, then set `BACKUP_REMOTE` in `deploy/.env`, e.g. `BACKUP_REMOTE=r2:nsb-backups`. Without it the script warns that the backup exists only on the server.

To run it every night at 03:00, run `crontab -e` and add:

```cron
0 3 * * * bash ~/nsb/deploy/backup.sh >> ~/backups/backup.log 2>&1
```

Keep `deploy/.env` somewhere safe as well. Without the same `JWT_SECRET` or `SETTINGS_ENCRYPTION_KEY`, a restored database cannot read its saved secrets.

Test a restore once a month, so you know the files work. This restores the database into a separate scratch database, leaving the live one alone:

```bash
cd ~/nsb/deploy
docker compose exec -T postgres createdb -U nsb restore_test
docker compose exec -T postgres pg_restore -U nsb -d restore_test --no-owner < ~/backups/nsb-<date>.dump
docker compose exec -T postgres psql -U nsb -d restore_test -c 'select count(*) from enquiries'
docker compose exec -T postgres dropdb -U nsb restore_test
```

## Monitoring

Add a free external uptime check, such as UptimeRobot or Better Stack, on both `https://<SITE_ADDRESS>/api/health` and the home page, with alerts to your phone. Nothing on the server can warn you when the server itself is down.

Docker restarts a container that crashes, but not one that is running and unhealthy. `docker compose ps` shows which is which.

## Moving servers

To move from one server to another (done Oracle → Hostinger on 2026-10-19):

1. **On the old server**, make a backup:

   ```bash
   cd ~/nsb/deploy
   docker compose exec -T postgres pg_dump -U nsb -Fc nsb > ~/nsb.dump
   docker run --rm -v nsb_uploads:/u -v ~:/b alpine tar czf /b/uploads.tgz -C /u .
   ```

   Copy `~/nsb.dump`, `~/uploads.tgz` and `deploy/.env` to your PC with `scp`.
2. **On the new server**, do steps 3 to 5. Reuse the old `.env`: the same `POSTGRES_PASSWORD`, `JWT_SECRET` and `SETTINGS_ENCRYPTION_KEY`. Change only `SITE_ADDRESS` and `SITE_URL`. Upload the two backup files to `~`.
3. **Start the stack and restore the data** (don't seed):

   ```bash
   cd ~/nsb/deploy
   docker compose up -d --build
   docker compose stop api web
   docker compose exec -T postgres pg_restore -U nsb -d nsb --clean --if-exists < ~/nsb.dump
   docker run --rm -v nsb_uploads:/u -v ~:/b alpine sh -c "tar xzf /b/uploads.tgz -C /u && chown -R 1000:1000 /u"
   docker compose start api web
   ```

4. Point the domain's A record at the new IP. Caddy issues the certificate on the first request.

Locally stored images are saved as `/api/uploads/...` paths without the domain, and Cloudinary URLs are absolute, so all images keep working after the move.
