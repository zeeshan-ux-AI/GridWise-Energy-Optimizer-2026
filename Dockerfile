# ==============================================================================
# GridWise Energy Optimizer - Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Build Stage
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Install all dependencies including build tools
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and build script
COPY src ./src
COPY build.mjs ./

# Compile and bundle the application
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime Stage
# ------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled standalone distribution from builder
COPY --from=builder /app/dist ./dist

# Secure permissions for non-root execution
RUN chown -R node:node /app

# Switch to unprivileged user
USER node

EXPOSE 8080

# Native container healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the optimized Node server
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
