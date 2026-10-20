# Noida Super Bazaar: Phase-1 Wedding MVP

A monorepo with a NestJS API, one Next.js app (public site and admin), and PostgreSQL. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requirements

Node 22 or later (24 recommended), npm 11, and Docker.

## First run

```bash
npm install
cp apps/api/.env.example apps/api/.env   # then set JWT_SECRET and SEED_ADMIN_PASSWORD
npm run db:up        # Postgres in Docker on localhost:5434
npm run db:migrate
npm run db:seed      # 5 wedding categories + the first admin user
npm run dev          # shared (watch) + API :4000 + web :3000
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- API: http://localhost:4000/api/health

## Scripts (repo root)

| Script | Does |
|---|---|
| `npm run dev` | Builds `@nsb/shared`, then runs the shared watcher, API and web together |
| `npm run build` | Production build of all three packages |
| `npm run typecheck` | Type-checks the API and web |
| `npm test` | API unit tests |
| `npm run test:e2e -w @nsb/api` | API end-to-end tests against the dev database |
| `npm run db:generate` | Generates a SQL migration after editing `apps/api/src/db/schema.ts` |
| `npm run db:migrate` / `db:seed` | Applies migrations / seeds |
| `npm run db:seed:demo` | Adds 20 demo wedding vendors (`-- --remove` deletes them) |

## Deploy (staging or production)

Full runbook, covering a free Oracle Cloud VM, Hostinger KVM, backups and moving servers: [docs/DEPLOY.md](docs/DEPLOY.md).

On the VPS, with Docker installed and DNS pointing at it:

```bash
cd deploy
cp .env.example .env     # set SITE_ADDRESS, POSTGRES_PASSWORD, JWT_SECRET, SEED_ADMIN_*
docker compose up -d --build
docker compose exec api node dist/db/seed.js    # first deploy only
```

Caddy gets the TLS certificate automatically. The API applies database migrations each time it starts.
