-- JAIN STOCK EXCHANGE (JSE) v311
-- 001a_upgrades.sql: additive schema changes applied right after 001_schema.
-- Every statement is idempotent, so the file is safe to re-run on existing databases.

-- ---------------------------------------------------------------------------
-- v272: IPO listing (confidential listing price saved by the Controller, applied at listing time)
-- ---------------------------------------------------------------------------
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
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS auto_list_ipos boolean NOT NULL DEFAULT true;

ALTER TABLE price_history DROP CONSTRAINT IF EXISTS price_history_source_check;
ALTER TABLE price_history ADD CONSTRAINT price_history_source_check
  CHECK (source IN ('TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN','LISTING'));

ALTER TABLE action_journal DROP CONSTRAINT IF EXISTS action_journal_action_check;
ALTER TABLE action_journal ADD CONSTRAINT action_journal_action_check
  CHECK (action IN ('EXCHANGE_DECISION','BANK_SETTLE','BANK_REJECT','MARKET_NEWS','EVENT_STATUS','IPO_LISTING'));

-- ---------------------------------------------------------------------------
-- v311: roles — dedicated Pit Manager role; broker accounts must name their broker
-- ---------------------------------------------------------------------------
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_role_check
  CHECK (role IN ('ADMIN','EXCHANGE','BANK','BROKER','PIT_MANAGER','INSTITUTIONAL','PARTICIPANT','VIEWER'));
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_users_broker_chk') THEN
    ALTER TABLE app_users ADD CONSTRAINT app_users_broker_chk CHECK (role <> 'BROKER' OR broker_id IS NOT NULL);
  END IF;
END $$;
-- PASSWORD = normal sign-in, CI = staging test sign-in with a GitHub OIDC token (set only by jse_ci_session)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'PASSWORD';

-- ---------------------------------------------------------------------------
-- v311: event configuration (one canonical source per rule)
-- ---------------------------------------------------------------------------
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS event_start_at timestamptz NOT NULL DEFAULT '2026-10-15 13:15:00+05:30';
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS ipo_application_hours numeric(6,2) NOT NULL DEFAULT 24
  CHECK (ipo_application_hours > 0 AND ipo_application_hours <= 48);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS min_buy_trades integer NOT NULL DEFAULT 5 CHECK (min_buy_trades >= 0 AND min_buy_trades <= 1000);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS min_sell_trades integer NOT NULL DEFAULT 5 CHECK (min_sell_trades >= 0 AND min_sell_trades <= 1000);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS loan_repayment_required boolean NOT NULL DEFAULT true;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_name_seed text;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_names_assigned_at timestamptz;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_names_locked_at timestamptz;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS team_names_locked_by text;

-- ---------------------------------------------------------------------------
-- v311: brokers — contact details communicated to participants in advance
-- ---------------------------------------------------------------------------
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS contact text;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS desk text;

-- ---------------------------------------------------------------------------
-- v311: securities — IPO code, CMS INDEX base for staged composition, last real price change
-- ---------------------------------------------------------------------------
ALTER TABLE securities ADD COLUMN IF NOT EXISTS ipo_code text;
ALTER TABLE securities ADD COLUMN IF NOT EXISTS index_base_price numeric(12,2);
ALTER TABLE securities ADD COLUMN IF NOT EXISTS last_price_change_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS securities_ipo_code_uq ON securities(ipo_code) WHERE ipo_code IS NOT NULL;

-- ---------------------------------------------------------------------------
-- v311: team identity — curated Indian Knowledge System name pool; team names unique
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_name_pool (
  id        serial PRIMARY KEY,
  name      text NOT NULL,
  category  text,
  meaning   text,
  active    boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS team_name_pool_name_uq ON team_name_pool(lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS teams_name_uq ON teams(lower(name));

-- ---------------------------------------------------------------------------
-- v311: order flow — PARTICIPANT INSTRUCTION → BROKER SUBMISSION → PIT MANAGER EXECUTION
--       → EXCHANGE REVIEW → BANK SETTLEMENT. One status column for the whole flow.
-- ---------------------------------------------------------------------------
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('PIT_PENDING','PIT_REJECTED','EXCHANGE_PENDING','EXCHANGE_APPROVED','EXCHANGE_REJECTED',
                    'BANK_PENDING','BANK_SETTLED','BANK_REJECTED'));
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'PIT_PENDING';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS instruction_id    bigint;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS brokerage_rate    numeric(8,6);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_by            integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_by_name       text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_at            timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pit_note          text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_at       timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_by       integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_by_name  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_price    numeric(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS executed_quantity integer;
DROP INDEX IF EXISTS orders_open_idx;
CREATE INDEX IF NOT EXISTS orders_open2_idx ON orders(team_id, security_id, side)
  WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING');
CREATE INDEX IF NOT EXISTS orders_pit_pending_idx ON orders(security_id, id) WHERE status = 'PIT_PENDING';
CREATE INDEX IF NOT EXISTS orders_executed_idx ON orders(executed_at DESC) WHERE executed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_updated_idx ON orders(updated_at DESC, id DESC);

-- Participant → broker instructions (digital instruction mechanism)
CREATE TABLE IF NOT EXISTS instructions (
  id               bigserial PRIMARY KEY,
  instruction_no   text NOT NULL UNIQUE,
  team_id          integer NOT NULL REFERENCES teams(id),
  broker_id        integer REFERENCES brokers(id),
  security_id      integer NOT NULL REFERENCES securities(id),
  side             text NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity         integer NOT NULL CHECK (quantity > 0),
  note             text,
  price_seen       numeric(12,2),
  status           text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','SUBMITTED','DECLINED','CANCELLED','EXPIRED')),
  order_id         bigint REFERENCES orders(id),
  idempotency_key  text UNIQUE,
  created_by       integer,
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  handled_at       timestamptz,
  handled_by_name  text,
  decline_reason   text
);
CREATE INDEX IF NOT EXISTS instructions_team_idx ON instructions(team_id, id DESC);
CREATE INDEX IF NOT EXISTS instructions_open_idx ON instructions(broker_id, id) WHERE status = 'OPEN';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_instruction_fk') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_instruction_fk FOREIGN KEY (instruction_id) REFERENCES instructions(id);
  END IF;
END $$;

-- Trading slips: exactly one per executed order (one-to-one with the canonical order record).
-- The executed terms live on the order (guarded below); the slip row is immutable.
CREATE TABLE IF NOT EXISTS trading_slips (
  id              bigserial PRIMARY KEY,
  slip_no         text NOT NULL UNIQUE,
  order_id        bigint NOT NULL UNIQUE REFERENCES orders(id),
  issued_at       timestamptz NOT NULL DEFAULT now(),
  issued_by       integer,
  issued_by_name  text NOT NULL
);
CREATE INDEX IF NOT EXISTS trading_slips_issued_idx ON trading_slips(issued_at DESC, id DESC);
CREATE OR REPLACE TRIGGER trading_slips_append_only BEFORE UPDATE OR DELETE ON trading_slips
  FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE OR REPLACE TRIGGER trading_slips_no_truncate BEFORE TRUNCATE ON trading_slips
  FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();

-- Executed orders cannot be edited silently: the executed terms are fixed (only the reset routine may clear them).
CREATE OR REPLACE FUNCTION jse_orders_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF coalesce(current_setting('jse.maintenance', true), '') = 'on' OR OLD.executed_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.executed_at IS DISTINCT FROM OLD.executed_at OR NEW.executed_price IS DISTINCT FROM OLD.executed_price
     OR NEW.executed_quantity IS DISTINCT FROM OLD.executed_quantity OR NEW.executed_by_name IS DISTINCT FROM OLD.executed_by_name
     OR NEW.price IS DISTINCT FROM OLD.price OR NEW.quantity IS DISTINCT FROM OLD.quantity OR NEW.side IS DISTINCT FROM OLD.side
     OR NEW.team_id IS DISTINCT FROM OLD.team_id OR NEW.security_id IS DISTINCT FROM OLD.security_id
     OR NEW.trade_value IS DISTINCT FROM OLD.trade_value OR NEW.brokerage IS DISTINCT FROM OLD.brokerage
     OR NEW.brokerage_rate IS DISTINCT FROM OLD.brokerage_rate OR NEW.account_type IS DISTINCT FROM OLD.account_type
     OR NEW.institution_id IS DISTINCT FROM OLD.institution_id OR NEW.broker_id IS DISTINCT FROM OLD.broker_id THEN
    RAISE EXCEPTION 'JSE: % was executed by the Pit Manager; its executed terms cannot be edited', OLD.order_no USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER orders_executed_guard BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION jse_orders_guard();

-- ---------------------------------------------------------------------------
-- v311: IPO round — one prospectus record per IPO, participant applications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ipo_prospectus (
  security_id            integer PRIMARY KEY REFERENCES securities(id),
  company_description    text,
  issue_details          text,
  business_overview      text,
  financial_information  text,
  risk_factors           text,
  use_of_proceeds        text,
  promoters_management   text,
  other_information      text,
  document_name          text,
  document_type          text,
  document_size          integer,
  document_data          bytea,
  document_url           text,
  document_uploaded_at   timestamptz,
  document_uploaded_by   text,
  updated_at             timestamptz NOT NULL DEFAULT now(),
  updated_by             text
);

CREATE TABLE IF NOT EXISTS ipo_applications (
  id               bigserial PRIMARY KEY,
  team_id          integer NOT NULL REFERENCES teams(id),
  security_id      integer NOT NULL REFERENCES securities(id),
  lots             integer NOT NULL CHECK (lots > 0),
  quantity         integer NOT NULL CHECK (quantity > 0),
  price            numeric(12,2) NOT NULL CHECK (price > 0),
  amount           numeric(16,2) NOT NULL CHECK (amount > 0),
  status           text NOT NULL DEFAULT 'APPLIED' CHECK (status IN ('APPLIED','WITHDRAWN')),
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_name  text,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, security_id)
);

-- ---------------------------------------------------------------------------
-- v311: cash ledger records loan interest charges too (zero cash movement, liability noted)
-- ---------------------------------------------------------------------------
ALTER TABLE cash_ledger DROP CONSTRAINT IF EXISTS cash_ledger_entry_type_check;
ALTER TABLE cash_ledger ADD CONSTRAINT cash_ledger_entry_type_check
  CHECK (entry_type IN ('INITIAL_CAPITAL','IPO_ALLOTMENT','BUY','SELL','BROKERAGE','LOAN_DRAW','INTEREST','INTEREST_CHARGE',
                        'LOAN_REPAYMENT','REVERSAL','ADJUSTMENT'));

INSERT INTO schema_migrations(version) VALUES ('001a_upgrades');
