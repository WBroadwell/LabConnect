# Build stage
FROM node:24-alpine3.21 AS builder

WORKDIR /app

# Install libc6-compat if needed
RUN apk add --no-cache libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build the Next.js app
COPY . .
ARG BACKEND_URL=http://localhost:5000
ENV BACKEND_URL=$BACKEND_URL
RUN npm run build

# Final stage: Node.js serving standalone output
FROM node:24-alpine3.21 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Healthcheck for Next.js server
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:80/ || exit 1

# Expose port 80
EXPOSE 80
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]