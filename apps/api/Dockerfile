# Build from the repo root:  docker build -f apps/api/Dockerfile .
FROM node:24-alpine AS base
WORKDIR /repo
# Every workspace manifest is needed for `npm ci` to accept the shared lockfile.
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

FROM base AS build
RUN npm ci -w @nsb/shared -w @nsb/api --include-workspace-root
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @nsb/shared && npm run build -w @nsb/api

FROM base AS runtime
ENV NODE_ENV=production
RUN npm ci --omit=dev -w @nsb/shared -w @nsb/api && npm cache clean --force
COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/apps/api/dist apps/api/dist
COPY apps/api/drizzle apps/api/drizzle
WORKDIR /repo/apps/api
# Mount point for the uploads volume; a new named volume copies this owner.
RUN mkdir uploads && chown node:node uploads
USER node
EXPOSE 4000
# Apply pending migrations, then start. Seed once with: docker compose exec api node dist/db/seed.js
CMD ["sh", "-c", "node dist/db/migrate.js && exec node dist/main.js"]
