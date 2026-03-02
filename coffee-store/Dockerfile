# ===========================================
# Stage 1: Builder
# ===========================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Set environment variables needed for build
ENV DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa
ENV REDIS_URL=redis://localhost:6379
ENV JWT_SECRET=temporary_jwt_secret_for_build
ENV COOKIE_SECRET=temporary_cookie_secret_for_build

# Build the Medusa project
RUN npm run build

# ===========================================
# Stage 2: Production
# ===========================================
FROM node:20-slim AS production

WORKDIR /app

# Copy everything from builder (simpler approach)
COPY --from=builder /app /app

EXPOSE 9000

# Copy and use startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]