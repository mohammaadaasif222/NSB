# Build from the repo root:  docker build -f apps/web/Dockerfile .
FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci -w @nsb/shared -w @nsb/web --include-workspace-root
COPY packages/shared packages/shared
COPY apps/web apps/web
# rewrites() in next.config.ts are fixed at build time. The image optimizer fetches locally
# stored uploads (/api/uploads/...) through them, so point them at the api container.
ARG API_INTERNAL_URL=http://api:4000/api
ENV NEXT_TELEMETRY_DISABLED=1 API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build -w @nsb/shared && npm run build -w @nsb/web

FROM node:24-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
# Standalone output mirrors the monorepo layout, so the server lives at apps/web/server.js.
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
