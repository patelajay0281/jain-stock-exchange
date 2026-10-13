# v272 Roster + IPO Change Backup / Restore Guide

Backup directory created before the targeted roster/IPO work.

## Exact original file copies

| Original path | Backup copy | Original blob SHA |
|---|---|---|
| `public/admin.html` | `backups/v272-2026-10-13-before-roster-ipo/public/admin.html` | `d65b5afb3728f1c00fc92bdb84c0a6555d69ffd7` |
| `backend/src/server.ts` | `backups/v272-2026-10-13-before-roster-ipo/backend/src/server.ts` | `8509f07e67a7745e04215e8461644680347b7125` |
| `backend/src/db.ts` | `backups/v272-2026-10-13-before-roster-ipo/backend/src/db.ts` | `dc63f70d85d683933dea8b1bae35c016be443e8b` |
| `backend/dist/app.mjs` | `backups/v272-2026-10-13-before-roster-ipo/backend/dist/app.mjs` | `78b8083de2ccfcc61276c7b2cddd7f3127740508` |
| `IMPLEMENTATION_PROGRESS.md` | `backups/v272-2026-10-13-before-roster-ipo/IMPLEMENTATION_PROGRESS.md` | `41e16978a26288979e0706c69741b5036495a829` |

These copies contain the original file contents, without a header added to the source file.

## New file

`db/migrations/011_roster_ipo.sql` did not exist before this work. To revert the code change, remove that file and restore the five originals listed above. Do not drop the new database tables/functions blindly if the feature has been deployed or used; review the database first.

## What was intentionally changed

- Existing roster importer gains a separate five-column Team/Broker Assignment mode; existing Teams, Brokers and manual IPO allotment imports remain.
- New independent IPO Random Allotment & Share Issuance, Company & Base Price Import, and IPO Issue Size & Inventory Management panels.
- New backend routes and additive migration only.
- No existing financial records were changed by validation tests; those tests ran inside a savepoint and were rolled back.
