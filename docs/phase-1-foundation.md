# JAIN STOCK EXCHANGE — Phase 1 Foundation

## Target repository

patelajay0281/jain-stock-exchange

Phase 1 establishes the canonical database model for the rebuild. The legacy runtime remains untouched until later phases.

## Target repository shape

    /
    ├── database/
    │   ├── schema.sql
    │   └── seed.sql
    ├── functions/
    │   └── api/
    ├── lib/
    ├── public/
    ├── tests/
    ├── loadtest/
    ├── scripts/
    ├── _headers
    ├── wrangler.toml
    ├── package.json
    └── docs/
        └── phase-1-foundation.md

## Money representation

All monetary values are integer paise in PostgreSQL BIGINT.

Examples:
- ₹20,00,000 = 200000000 paise
- ₹5,00,000 = 50000000 paise
- ₹20,000 = 2000000 paise

Rates are stored as basis points:
- 0.5% brokerage = 50 bps
- 2% loan interest = 200 bps

This removes floating-point arithmetic from money-moving operations.

## Core integrity guarantees

- Order state transitions are enforced by a PostgreSQL trigger.
- Event lifecycle transitions are enforced by a PostgreSQL trigger.
- Orders cannot be created unless the event is LIVE.
- Order economics are immutable after creation.
- Settlement rows have UNIQUE(order_id), preventing a second settlement record.
- Settlement undo/redo is represented by one settlement row plus append-only settlement actions.
- Broker commission rows have UNIQUE(order_id).
- Audit log, team cash ledger, institutional cash ledger and settlement actions are append-only.
- Deferred reconciliation triggers guarantee that cached team/institution cash equals ledger cash at transaction commit.
- Idempotency keys are uniquely scoped to actor + route.
- All financial fields avoid floating-point types.

## Seed contents

- 10 brokers: BROKER-01 through BROKER-10.
- 100 teams: TEAM-001 through TEAM-100.
- 4 IPOs shown first in display order.
- 49 listed stocks.
- INST-01 with ₹2,00,00,000 initial cash.
- ₹20,00,000 participant base capital.
- ₹5,00,000 team loan limit.
- 2% loan interest.
- 0.5% brokerage.
- ₹20,000 topper minimum cash buffer.
- 50-share seeded lot size.
- CMS INDEX base value of 89,890.00.

The seed uses insert-only conflict handling for editable reference data, so rerunning it does not overwrite administrator price edits.
