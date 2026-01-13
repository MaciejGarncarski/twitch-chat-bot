# syntax=docker/dockerfile:1

FROM oven/bun:1.3.6-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps

# Copy root workspace files
COPY package.json bun.lock ./

# Copy workspace package.json files
COPY backend/package.json ./backend/
COPY packages/types/package.json ./packages/types/
COPY packages/eden-rpc/package.json ./packages/eden-rpc/
COPY frontend/package.json ./frontend/

# Install all workspace dependencies
RUN bun install --frozen-lockfile --production

# Production image
FROM base AS production
ENV NODE_ENV=production

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules

# Copy workspace package files
COPY package.json ./
COPY packages/types ./packages/types
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 3302

CMD ["bun", "run", "src/index.ts"]
