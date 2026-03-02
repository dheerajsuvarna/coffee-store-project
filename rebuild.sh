#!/bin/bash
set -e

echo "=========================================="
echo "  Bergkraft Docker Cleanup & Rebuild"
echo "=========================================="

# ── 1. Tear down ───────────────────────────────────────────────────────────────
echo ""
echo "[1/6] Stopping all containers and removing volumes..."
docker compose down -v 2>/dev/null || true

# ── 2. Remove stale images ────────────────────────────────────────────────────
echo ""
echo "[2/6] Removing old project images..."
docker rmi coffee-store-project-backend  2>/dev/null || true
docker rmi coffee-store-project-storefront 2>/dev/null || true
docker rmi coffee-store-project_backend  2>/dev/null || true
docker rmi coffee-store-project_storefront 2>/dev/null || true

# ── 3. Prune dangling build cache ─────────────────────────────────────────────
echo ""
echo "[3/6] Pruning Docker build cache..."
docker system prune -f

# ── 4. Build fresh images ─────────────────────────────────────────────────────
echo ""
echo "[4/6] Building images (this takes 5-15 min — grab a coffee!)..."
docker compose build --no-cache

# ── 5. Start infrastructure + backend ─────────────────────────────────────────
echo ""
echo "[5/6] Starting containers..."
docker compose up -d

echo ""
echo "Waiting for backend to become healthy (migrations run automatically)..."
echo "Polling http://localhost:9000/health ..."
until curl -sf http://localhost:9000/health > /dev/null 2>&1; do
  printf "."
  sleep 5
done
echo ""
echo "Backend is healthy!"

# ── 6. Seed database ──────────────────────────────────────────────────────────
echo ""
echo "[6/6] Seeding the database with demo data..."
docker compose exec backend npx medusa exec ./src/scripts/seed.ts

echo ""
echo "=========================================="
echo "  All done! Services are running:"
echo "    Storefront : http://localhost:3000"
echo "    Admin      : http://localhost:9000/app"
echo "    API        : http://localhost:9000"
echo "    PostgreSQL : localhost:5432"
echo ""
echo "  Next step: copy the Publishable API Key"
echo "  printed above into docker-compose.yml:"
echo "    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<key>"
echo "  Then restart the storefront:"
echo "    docker compose up -d --no-deps storefront"
echo "=========================================="

echo ""
echo "Tailing logs (Ctrl+C to exit)..."
docker compose logs -f
