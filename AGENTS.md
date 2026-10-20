# NSB: agent guide

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first. Key rules:

- **Scope:** build only what the Phase-1 roadmap lists (see "Phase-1 scope guard" in the architecture doc). Propose extras; do not build them.
- **Contracts:** request schemas and response types live in `packages/shared`. Change them there first. The API validates with `ZodPipe`, and the web app imports the types.
- **API:** NestJS 12, ESM, so relative imports need `.js`. Admin routes go under `/api/admin/*` with `AdminGuard`. Never return a vendor's email or phone from public routes.
- **DB:** after editing `apps/api/src/db/schema.ts`, run `npm run db:generate` and commit the SQL in `apps/api/drizzle/`.
- **Web:** Next.js 16. See the block below.
- **Verify:** run `npm run typecheck`, `npm test`, and `npm run test:e2e -w @nsb/api` (needs `npm run db:up`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
