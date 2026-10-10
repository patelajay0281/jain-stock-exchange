-- JAIN STOCK EXCHANGE (JSE) v272
-- 001a_upgrades.sql: additive schema changes applied right after 001_schema.
-- Every statement is idempotent, so the file is safe to re-run on existing databases.

-- IPO listing: confidential listing price saved by the Controller, applied at listing time
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listing_price  numeric(12,2);
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listed_at      timestamptz;
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listing_set_at timestamptz;
ALTER TABLE securities ADD COLUMN IF NOT EXISTS listing_set_by text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'securities_listing_price_chk') THEN
    ALTER TABLE securities ADD CONSTRAINT securities_listing_price_chk
      CHECK (listing_price IS NULL OR (listing_price > 0 AND kind = 'IPO'));
  END IF;
END $$;

-- list IPOs automatically when the Controller presses START EVENT
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS auto_list_ipos boolean NOT NULL DEFAULT true;

-- price history source LISTING = the IPO listing-day price
ALTER TABLE price_history DROP CONSTRAINT IF EXISTS price_history_source_check;
ALTER TABLE price_history ADD CONSTRAINT price_history_source_check
  CHECK (source IN ('TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN','LISTING'));

-- undo/redo journal: IPO_LISTING entries
ALTER TABLE action_journal DROP CONSTRAINT IF EXISTS action_journal_action_check;
ALTER TABLE action_journal ADD CONSTRAINT action_journal_action_check
  CHECK (action IN ('EXCHANGE_DECISION','BANK_SETTLE','BANK_REJECT','MARKET_NEWS','EVENT_STATUS','IPO_LISTING'));

INSERT INTO schema_migrations(version) VALUES ('001a_upgrades');
