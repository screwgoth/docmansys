# Multi-stage build for Document Management System
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Development dependencies (for build stage)
FROM base AS deps-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Production image
FROM base AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 docman

# Copy node_modules from deps stage
COPY --from=deps --chown=docman:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --chown=docman:nodejs . .

# Switch to non-root user
USER docman

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/index.js"]
