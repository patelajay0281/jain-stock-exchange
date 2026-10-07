# JAIN STOCK EXCHANGE

Cloudflare Pages + Pages Functions + Neon PostgreSQL rebuild.

## Phase 1

- Canonical schema: `database/schema.sql`
- Seed data: `database/seed.sql`
- Architecture notes: `docs/phase-1-foundation.md`

## Planned runtime

- Frontend: vanilla HTML/CSS/JS under `public/`
- Backend: Cloudflare Pages Functions under `functions/api/*`
- Database: Neon PostgreSQL using the pooled connection string
- Secrets: Cloudflare environment variables only
- Repository: `patelajay0281/jain-stock-exchange`
- Production branch: `main`

The old Worker-era implementation remains in the branch history while the rebuild is completed phase by phase.
