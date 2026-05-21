# ==========================================
# Stage 1: Build Environment
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install system dependencies needed for native modules / Prisma
RUN apk add --no-cache openssl

# Copy manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for compiling
RUN npm ci

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client and build TypeScript bundle
RUN npm run prisma:generate
RUN npm run build

# Prune node_modules to production-only
RUN npm prune --production

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000

# Copy production artifacts
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose port
EXPOSE 5000

# Run service
CMD ["node", "dist/app.js"]
