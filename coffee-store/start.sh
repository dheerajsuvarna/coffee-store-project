#!/bin/bash
set -e

echo "=========================================="
echo "  Bergkraft Backend Starting..."
echo "=========================================="

echo ""
echo "Waiting for database and running migrations..."
until npx medusa db:migrate; do
  echo "Migration failed or DB not ready. Retrying in 5 seconds..."
  sleep 5
done
echo "Migrations completed successfully!"

# Auto-seed on first run: set SEED_ON_START=true to enable.
# After the first successful seed, unset the variable to avoid re-seeding.
if [ "${SEED_ON_START}" = "true" ]; then
  echo ""
  echo "SEED_ON_START=true detected — running seed script..."
  npx medusa exec ./src/scripts/seed.ts || echo "Seed completed (or data already exists — this is normal on restart)."

  echo ""
  echo "Creating admin user..."
  npx medusa user -e "${ADMIN_EMAIL:-admin@bergkraft.com}" -p "${ADMIN_PASSWORD:-BergkraftAdmin123!}" || echo "Admin user already exists — skipping."
fi

echo ""
echo "=========================================="
echo "  Starting Medusa server on port 9000..."
echo "=========================================="

# Run medusa start from the compiled output directory so it finds admin files
# at .medusa/server/public/admin/ (not the project-root /public/admin/).
exec sh -c "cd /app/.medusa/server && exec npx medusa start"
