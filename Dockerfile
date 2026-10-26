# =========================
# Rolluck Frontend
# Node.js 22.7.5
# =========================

FROM node:22.23.3-bookworm-slim AS builder

WORKDIR /app

# Disable Husky during Docker build
ENV HUSKY=0

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# =========================
# Next.js build arguments
# =========================

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_PASSWORD_SECRET
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_ANALYTICS_DEBUG
ARG NEXT_PUBLIC_SOKETI_APP_KEY
ARG NEXT_PUBLIC_SOKETI_HOST
ARG NEXT_PUBLIC_SOKETI_PORT
ARG NEXT_PUBLIC_SOKETI_USE_TLS
ARG NEXT_PUBLIC_TELEGRAM_BOT_ID
ARG NEXT_PUBLIC_INTERCOM_APP_ID

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_PASSWORD_SECRET=${NEXT_PUBLIC_PASSWORD_SECRET}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_CLARITY_PROJECT_ID=${NEXT_PUBLIC_CLARITY_PROJECT_ID}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV NEXT_PUBLIC_ANALYTICS_DEBUG=${NEXT_PUBLIC_ANALYTICS_DEBUG}
ENV NEXT_PUBLIC_SOKETI_APP_KEY=${NEXT_PUBLIC_SOKETI_APP_KEY}
ENV NEXT_PUBLIC_SOKETI_HOST=${NEXT_PUBLIC_SOKETI_HOST}
ENV NEXT_PUBLIC_SOKETI_PORT=${NEXT_PUBLIC_SOKETI_PORT}
ENV NEXT_PUBLIC_SOKETI_USE_TLS=${NEXT_PUBLIC_SOKETI_USE_TLS}
ENV NEXT_PUBLIC_TELEGRAM_BOT_ID=${NEXT_PUBLIC_TELEGRAM_BOT_ID}
ENV NEXT_PUBLIC_INTERCOM_APP_ID=${NEXT_PUBLIC_INTERCOM_APP_ID}
# Build Next.js application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# =========================
# Production image
# =========================

FROM node:22.23.3-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5173
ENV HOSTNAME=0.0.0.0

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 5173

CMD ["npm", "run", "start"]