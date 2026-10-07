-- JAIN STOCK EXCHANGE — Phase 1 canonical PostgreSQL schema
-- Target: Supabase PostgreSQL 17 / managed Postgres
-- Money: BIGINT integer paise. Never use floating point for financial values.
-- Time: TIMESTAMPTZ stored in UTC; UI formats for the user's locale.
-- This file intentionally contains the complete foundation schema in one migration.

BEGIN;

CREATE TYPE user_role AS ENUM (
  'PARTICIPANT',
  'EXCHANGE',
  'BANK',
  'INSTITUTION',
  'ADMIN'
);

CREATE TYPE asset_type AS ENUM (
  'LISTED_STOCK',
  'IPO'
);

CREATE TYPE order_side AS ENUM (
  'BUY',
  'SELL'
);

CREATE TYPE order_source AS ENUM (
  'PARTICIPANT',
  'INSTITUTION'
);

CREATE TYPE order_status AS ENUM (
  'PENDING_EXCHANGE',
  'EXCHANGE_APPROVED',
  'SETTLED',
  'EXCHANGE_REJECTED',
  'BANK_REJECTED'
);

CREATE TYPE settlement_status AS ENUM (
  'APPLIED',
  'REVERSED'
);

CREATE TYPE settlement_action_type AS ENUM (
  'SETTLE',
  'UNDO',
  'REDO'
);

CREATE TYPE commission_status AS ENUM (
  'APPLIED',
  'REVERSED'
);

CREATE TYPE loan_status AS ENUM (
  'OPEN',
  'CLOSED'
);

CREATE TYPE event_status AS ENUM (
  'NOT_STARTED',
  'LIVE',
  'PAUSED',
  'CLOSED',
  'FINALIZED'
);

CREATE TYPE cash_entry_type AS ENUM (
  'INITIAL_CAPITAL',
  'BUY_SETTLEMENT',
  'SELL_SETTLEMENT',
  'LOAN_DRAWDOWN',
  'LOAN_PRINCIPAL_REPAYMENT',
  'LOAN_INTEREST_PAYMENT',
  'SETTLEMENT_REVERSAL',
  'ADMIN_ADJUSTMENT'
);

CREATE TYPE price_change_reason AS ENUM (
  'INITIAL_SEED',
  'ADMIN_EDIT',
  'EVENT_RESET',
  'TRADE_SETTLEMENT'
);

CREATE TABLE brokers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (code ~ '^BROKER-[0-9]{2}$')
);

CREATE TABLE institutions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  initial_cash_paise BIGINT NOT NULL,
  cash_paise BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (initial_cash_paise >= 0),
  CHECK (cash_paise >= 0)
);

CREATE TABLE teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  broker_id BIGINT NOT NULL REFERENCES brokers(id) ON DELETE RESTRICT,
  base_capital_paise BIGINT NOT NULL,
  cash_paise BIGINT NOT NULL,
  peak_own_capital_used_paise BIGINT NOT NULL DEFAULT 0,
  minimum_cash_paise BIGINT NOT NULL,
  realized_profit_paise BIGINT NOT NULL DEFAULT 0,
  short_sale_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (code ~ '^TEAM-[0-9]{3}$'),
  CHECK (base_capital_paise >= 0),
  CHECK (cash_paise >= 0),
  CHECK (peak_own_capital_used_paise >= 0),
  CHECK (peak_own_capital_used_paise <= base_capital_paise),
  CHECK (minimum_cash_paise >= 0),
  CHECK (short_sale_count >= 0)
);

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  google_subject TEXT UNIQUE,
  role user_role NOT NULL,
  team_id BIGINT REFERENCES teams(id) ON DELETE RESTRICT,
  institution_id BIGINT REFERENCES institutions(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (role = 'PARTICIPANT' AND team_id IS NOT NULL AND institution_id IS NULL)
    OR
    (role = 'INSTITUTION' AND institution_id IS NOT NULL AND team_id IS NULL)
    OR
    (role IN ('EXCHANGE', 'BANK', 'ADMIN') AND team_id IS NULL AND institution_id IS NULL)
  )
);

CREATE UNIQUE INDEX users_email_lower_uq ON users (LOWER(email));
CREATE INDEX users_role_idx ON users (role);
CREATE INDEX users_team_id_idx ON users (team_id);

CREATE TABLE assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  base_price_paise BIGINT NOT NULL,
  current_price_paise BIGINT NOT NULL,
  previous_price_paise BIGINT NOT NULL,
  lot_size INTEGER NOT NULL DEFAULT 50,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (base_price_paise > 0),
  CHECK (current_price_paise > 0),
  CHECK (previous_price_paise > 0),
  CHECK (lot_size > 0),
  CHECK (display_order > 0)
);

CREATE INDEX assets_type_display_order_idx ON assets (type, display_order);
CREATE INDEX assets_active_display_order_idx ON assets (is_active, display_order);

CREATE TABLE event_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  event_name TEXT NOT NULL DEFAULT 'JAIN STOCK EXCHANGE',
  currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  base_capital_paise BIGINT NOT NULL,
  loan_limit_paise BIGINT NOT NULL,
  loan_interest_bps INTEGER NOT NULL,
  brokerage_bps INTEGER NOT NULL,
  minimum_cash_buffer_paise BIGINT NOT NULL,
  listed_lot_size INTEGER NOT NULL,
  institutional_cash_paise BIGINT NOT NULL,
  cms_index_base_value_hundredths BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (id = 1),
  CHECK (currency_code = 'INR'),
  CHECK (base_capital_paise >= 0),
  CHECK (loan_limit_paise >= 0),
  CHECK (loan_interest_bps BETWEEN 0 AND 10000),
  CHECK (brokerage_bps BETWEEN 0 AND 10000),
  CHECK (minimum_cash_buffer_paise >= 0),
  CHECK (listed_lot_size > 0),
  CHECK (institutional_cash_paise >= 0),
  CHECK (cms_index_base_value_hundredths >= 0)
);

CREATE TABLE event_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status event_status NOT NULL DEFAULT 'NOT_STARTED',
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  topper_team_id BIGINT REFERENCES teams(id) ON DELETE RESTRICT,
  topper_realized_profit_paise BIGINT,
  finalization_note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (id = 1)
);

CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  source order_source NOT NULL,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  institution_id BIGINT REFERENCES institutions(id) ON DELETE RESTRICT,
  broker_id BIGINT NOT NULL REFERENCES brokers(id) ON DELETE RESTRICT,
  asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  side order_side NOT NULL,
  quantity BIGINT NOT NULL,
  price_paise BIGINT NOT NULL,
  trade_value_paise BIGINT NOT NULL,
  brokerage_bps INTEGER NOT NULL,
  brokerage_paise BIGINT NOT NULL,
  amount_paise BIGINT NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING_EXCHANGE',
  is_short_sale BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exchange_reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  exchange_reviewed_at TIMESTAMPTZ,
  bank_reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  bank_reviewed_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  CHECK (
    (source = 'PARTICIPANT' AND institution_id IS NULL)
    OR
    (source = 'INSTITUTION' AND institution_id IS NOT NULL)
  ),
  CHECK (quantity > 0),
  CHECK (price_paise > 0),
  CHECK (trade_value_paise = quantity * price_paise),
  CHECK (brokerage_bps BETWEEN 0 AND 10000),
  CHECK (brokerage_paise >= 0 AND brokerage_paise <= trade_value_paise),
  CHECK (
    (side = 'BUY' AND amount_paise = trade_value_paise + brokerage_paise)
    OR
    (side = 'SELL' AND amount_paise = trade_value_paise - brokerage_paise)
  )
);

CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX orders_team_id_idx ON orders (team_id);
CREATE INDEX orders_created_at_idx ON orders (created_at);
CREATE INDEX orders_status_created_at_idx ON orders (status, created_at, id);
CREATE INDEX orders_asset_created_at_idx ON orders (asset_id, created_at);
CREATE UNIQUE INDEX orders_create_idempotency_uq
  ON orders (created_by_user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE holdings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  quantity BIGINT NOT NULL DEFAULT 0,
  average_price_paise BIGINT NOT NULL DEFAULT 0,
  cost_basis_paise BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, asset_id),
  CHECK (average_price_paise >= 0),
  CHECK (cost_basis_paise >= 0)
);

CREATE INDEX holdings_team_id_idx ON holdings (team_id);
CREATE INDEX holdings_asset_id_idx ON holdings (asset_id);

CREATE TABLE institutional_holdings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  quantity BIGINT NOT NULL DEFAULT 0,
  average_price_paise BIGINT NOT NULL DEFAULT 0,
  cost_basis_paise BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, asset_id),
  CHECK (average_price_paise >= 0),
  CHECK (cost_basis_paise >= 0)
);

CREATE TABLE loans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  principal_paise BIGINT NOT NULL,
  principal_outstanding_paise BIGINT NOT NULL,
  interest_rate_bps INTEGER NOT NULL,
  interest_due_paise BIGINT NOT NULL,
  interest_paid_paise BIGINT NOT NULL DEFAULT 0,
  status loan_status NOT NULL DEFAULT 'OPEN',
  approved_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  disbursed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  CHECK (principal_paise > 0),
  CHECK (principal_outstanding_paise BETWEEN 0 AND principal_paise),
  CHECK (interest_rate_bps BETWEEN 0 AND 10000),
  CHECK (interest_due_paise >= 0),
  CHECK (interest_paid_paise BETWEEN 0 AND interest_due_paise)
);

CREATE INDEX loans_team_status_idx ON loans (team_id, status);
CREATE UNIQUE INDEX loans_one_open_per_team_uq
  ON loans (team_id)
  WHERE status = 'OPEN';

CREATE TABLE settlements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
  status settlement_status NOT NULL DEFAULT 'APPLIED',
  is_short_sale BOOLEAN NOT NULL DEFAULT FALSE,

  team_cash_before_paise BIGINT NOT NULL,
  team_cash_after_paise BIGINT NOT NULL,
  team_position_before_quantity BIGINT NOT NULL,
  team_position_after_quantity BIGINT NOT NULL,
  team_position_before_avg_paise BIGINT NOT NULL,
  team_position_after_avg_paise BIGINT NOT NULL,

  institution_cash_before_paise BIGINT,
  institution_cash_after_paise BIGINT,
  institution_position_before_quantity BIGINT,
  institution_position_after_quantity BIGINT,
  institution_position_before_avg_paise BIGINT,
  institution_position_after_avg_paise BIGINT,

  settled_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reversed_at TIMESTAMPTZ,
  last_action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (team_cash_before_paise >= 0),
  CHECK (team_cash_after_paise >= 0),
  CHECK (team_position_before_avg_paise >= 0),
  CHECK (team_position_after_avg_paise >= 0),
  CHECK (
    (institution_cash_before_paise IS NULL AND institution_cash_after_paise IS NULL)
    OR
    (institution_cash_before_paise IS NOT NULL AND institution_cash_after_paise IS NOT NULL
      AND institution_cash_before_paise >= 0 AND institution_cash_after_paise >= 0)
  ),
  CHECK (
    (institution_position_before_avg_paise IS NULL AND institution_position_after_avg_paise IS NULL)
    OR
    (institution_position_before_avg_paise IS NOT NULL AND institution_position_after_avg_paise IS NOT NULL
      AND institution_position_before_avg_paise >= 0 AND institution_position_after_avg_paise >= 0)
  )
);

CREATE INDEX settlements_status_settled_at_idx
  ON settlements (status, settled_at DESC);

CREATE TABLE settlement_actions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  settlement_id BIGINT NOT NULL REFERENCES settlements(id) ON DELETE RESTRICT,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  action settlement_action_type NOT NULL,
  performed_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  snapshot_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX settlement_actions_created_at_idx
  ON settlement_actions (created_at DESC);

CREATE INDEX settlement_actions_settlement_id_idx
  ON settlement_actions (settlement_id, created_at DESC);

CREATE TABLE broker_commissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
  settlement_id BIGINT REFERENCES settlements(id) ON DELETE RESTRICT,
  broker_id BIGINT NOT NULL REFERENCES brokers(id) ON DELETE RESTRICT,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  commission_rate_bps INTEGER NOT NULL,
  commission_paise BIGINT NOT NULL,
  status commission_status NOT NULL DEFAULT 'APPLIED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (commission_rate_bps BETWEEN 0 AND 10000),
  CHECK (commission_paise >= 0)
);

CREATE INDEX broker_commissions_broker_created_idx
  ON broker_commissions (broker_id, created_at DESC);

CREATE TABLE settlement_rejections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  broker_id BIGINT NOT NULL REFERENCES brokers(id) ON DELETE RESTRICT,
  available_cash_paise BIGINT NOT NULL,
  required_cash_paise BIGINT NOT NULL,
  shortfall_paise BIGINT NOT NULL,
  reason TEXT NOT NULL,
  rejected_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (available_cash_paise >= 0),
  CHECK (required_cash_paise >= 0),
  CHECK (shortfall_paise > 0)
);

CREATE INDEX settlement_rejections_team_created_idx
  ON settlement_rejections (team_id, created_at DESC);

CREATE TABLE cash_ledger (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  order_id BIGINT REFERENCES orders(id) ON DELETE RESTRICT,
  settlement_id BIGINT REFERENCES settlements(id) ON DELETE RESTRICT,
  loan_id BIGINT REFERENCES loans(id) ON DELETE RESTRICT,
  entry_type cash_entry_type NOT NULL,
  debit_paise BIGINT NOT NULL DEFAULT 0,
  credit_paise BIGINT NOT NULL DEFAULT 0,
  balance_after_paise BIGINT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (debit_paise >= 0),
  CHECK (credit_paise >= 0),
  CHECK ((debit_paise = 0) <> (credit_paise = 0)),
  CHECK (balance_after_paise >= 0)
);

CREATE INDEX cash_ledger_team_created_idx
  ON cash_ledger (team_id, created_at, id);

CREATE INDEX cash_ledger_order_idx
  ON cash_ledger (order_id);

CREATE TABLE institution_cash_ledger (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  order_id BIGINT REFERENCES orders(id) ON DELETE RESTRICT,
  settlement_id BIGINT REFERENCES settlements(id) ON DELETE RESTRICT,
  entry_type cash_entry_type NOT NULL,
  debit_paise BIGINT NOT NULL DEFAULT 0,
  credit_paise BIGINT NOT NULL DEFAULT 0,
  balance_after_paise BIGINT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (debit_paise >= 0),
  CHECK (credit_paise >= 0),
  CHECK ((debit_paise = 0) <> (credit_paise = 0)),
  CHECK (balance_after_paise >= 0)
);

CREATE INDEX institution_cash_ledger_inst_created_idx
  ON institution_cash_ledger (institution_id, created_at, id);

CREATE TABLE idempotency_keys (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  route TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  resource_type TEXT,
  resource_id BIGINT,
  response_status INTEGER,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE (actor_user_id, route, idempotency_key)
);

CREATE INDEX idempotency_expires_idx ON idempotency_keys (expires_at);

CREATE TABLE price_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  previous_price_paise BIGINT NOT NULL,
  new_price_paise BIGINT NOT NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE RESTRICT,
  changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  reason price_change_reason NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (previous_price_paise > 0),
  CHECK (new_price_paise > 0)
);

CREATE INDEX price_history_asset_changed_at_idx
  ON price_history (asset_id, changed_at DESC);

CREATE INDEX price_history_changed_at_idx
  ON price_history (changed_at DESC);

CREATE TABLE audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role user_role,
  action TEXT NOT NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  asset_id BIGINT REFERENCES assets(id) ON DELETE SET NULL,
  side order_side,
  quantity BIGINT,
  trade_value_paise BIGINT,
  risk_status TEXT,
  what_happened TEXT NOT NULL,
  details_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (quantity IS NULL OR quantity > 0),
  CHECK (trade_value_paise IS NULL OR trade_value_paise >= 0)
);

CREATE INDEX audit_log_created_at_idx ON audit_log (created_at DESC);
CREATE INDEX audit_log_order_id_idx ON audit_log (order_id);
CREATE INDEX audit_log_team_id_idx ON audit_log (team_id);
CREATE INDEX audit_log_action_created_at_idx ON audit_log (action, created_at DESC);

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER event_settings_updated_at
BEFORE UPDATE ON event_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER event_state_updated_at
BEFORE UPDATE ON event_state
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER holdings_updated_at
BEFORE UPDATE ON holdings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER institutional_holdings_updated_at
BEFORE UPDATE ON institutional_holdings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE FUNCTION set_order_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_code IS NULL OR NEW.order_code = '' THEN
    NEW.order_code := 'ORD-' || LPAD(NEW.id::TEXT, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_order_code
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION set_order_code();

CREATE FUNCTION enforce_event_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'NOT_STARTED' AND NEW.status = 'LIVE')
    OR
    (OLD.status = 'LIVE' AND NEW.status IN ('PAUSED', 'CLOSED'))
    OR
    (OLD.status = 'PAUSED' AND NEW.status IN ('LIVE', 'CLOSED'))
    OR
    (OLD.status = 'CLOSED' AND NEW.status = 'FINALIZED')
  ) THEN
    RAISE EXCEPTION 'Illegal event transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER event_state_machine
BEFORE UPDATE OF status ON event_state
FOR EACH ROW EXECUTE FUNCTION enforce_event_transition();

CREATE FUNCTION enforce_settlement_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status <> OLD.status
     AND NOT (
       (OLD.status = 'APPLIED' AND NEW.status = 'REVERSED')
       OR
       (OLD.status = 'REVERSED' AND NEW.status = 'APPLIED')
     ) THEN
    RAISE EXCEPTION 'Illegal settlement transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER settlements_state_machine
BEFORE UPDATE OF status ON settlements
FOR EACH ROW EXECUTE FUNCTION enforce_settlement_transition();

CREATE FUNCTION enforce_commission_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status <> OLD.status
     AND NOT (
       (OLD.status = 'APPLIED' AND NEW.status = 'REVERSED')
       OR
       (OLD.status = 'REVERSED' AND NEW.status = 'APPLIED')
     ) THEN
    RAISE EXCEPTION 'Illegal commission transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER broker_commission_state_machine
BEFORE UPDATE OF status ON broker_commissions
FOR EACH ROW EXECUTE FUNCTION enforce_commission_transition();

CREATE FUNCTION require_live_event_for_order_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_status event_status;
BEGIN
  SELECT status INTO v_status
  FROM event_state
  WHERE id = 1;

  IF v_status <> 'LIVE' THEN
    RAISE EXCEPTION 'Order creation is not allowed while event status is %', v_status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_require_live_event
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION require_live_event_for_order_insert();

CREATE FUNCTION enforce_order_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'PENDING_EXCHANGE' AND NEW.status IN ('EXCHANGE_APPROVED', 'EXCHANGE_REJECTED'))
    OR
    (OLD.status = 'EXCHANGE_APPROVED' AND NEW.status IN ('SETTLED', 'BANK_REJECTED'))
  ) THEN
    RAISE EXCEPTION 'Illegal order transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_state_machine
BEFORE UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION enforce_order_transition();

CREATE FUNCTION protect_order_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.source IS DISTINCT FROM OLD.source
     OR NEW.team_id IS DISTINCT FROM OLD.team_id
     OR NEW.institution_id IS DISTINCT FROM OLD.institution_id
     OR NEW.broker_id IS DISTINCT FROM OLD.broker_id
     OR NEW.asset_id IS DISTINCT FROM OLD.asset_id
     OR NEW.side IS DISTINCT FROM OLD.side
     OR NEW.quantity IS DISTINCT FROM OLD.quantity
     OR NEW.price_paise IS DISTINCT FROM OLD.price_paise
     OR NEW.trade_value_paise IS DISTINCT FROM OLD.trade_value_paise
     OR NEW.brokerage_bps IS DISTINCT FROM OLD.brokerage_bps
     OR NEW.brokerage_paise IS DISTINCT FROM OLD.brokerage_paise
     OR NEW.amount_paise IS DISTINCT FROM OLD.amount_paise
     OR NEW.created_by_user_id IS DISTINCT FROM OLD.created_by_user_id
     OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Order economic fields are immutable after creation'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_immutable_fields
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION protect_order_immutable_fields();

CREATE FUNCTION forbid_mutation_on_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only; UPDATE/DELETE is forbidden', TG_TABLE_NAME
    USING ERRCODE = 'P0001';
END;
$$;

CREATE TRIGGER audit_log_append_only
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION forbid_mutation_on_append_only();

CREATE TRIGGER cash_ledger_append_only
BEFORE UPDATE OR DELETE ON cash_ledger
FOR EACH ROW EXECUTE FUNCTION forbid_mutation_on_append_only();

CREATE TRIGGER institution_cash_ledger_append_only
BEFORE UPDATE OR DELETE ON institution_cash_ledger
FOR EACH ROW EXECUTE FUNCTION forbid_mutation_on_append_only();

CREATE TRIGGER settlement_actions_append_only
BEFORE UPDATE OR DELETE ON settlement_actions
FOR EACH ROW EXECUTE FUNCTION forbid_mutation_on_append_only();

CREATE FUNCTION enforce_team_cash_reconciliation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_team_id BIGINT;
  v_team_cash BIGINT;
  v_ledger_cash BIGINT;
BEGIN
  v_team_id := COALESCE(NEW.team_id, OLD.team_id);

  SELECT cash_paise
  INTO v_team_cash
  FROM teams
  WHERE id = v_team_id;

  SELECT COALESCE(SUM(credit_paise - debit_paise), 0)
  INTO v_ledger_cash
  FROM cash_ledger
  WHERE team_id = v_team_id;

  IF v_team_cash IS DISTINCT FROM v_ledger_cash THEN
    RAISE EXCEPTION 'Team cash reconciliation failed for team %: team cash %, ledger cash %',
      v_team_id, v_team_cash, v_ledger_cash
      USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE CONSTRAINT TRIGGER cash_ledger_reconciliation
AFTER INSERT ON cash_ledger
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION enforce_team_cash_reconciliation();

CREATE CONSTRAINT TRIGGER teams_cash_reconciliation
AFTER UPDATE OF cash_paise ON teams
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION enforce_team_cash_reconciliation();

CREATE FUNCTION enforce_institution_cash_reconciliation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_institution_id BIGINT;
  v_cash BIGINT;
  v_ledger_cash BIGINT;
BEGIN
  v_institution_id := COALESCE(NEW.institution_id, OLD.institution_id);

  SELECT cash_paise
  INTO v_cash
  FROM institutions
  WHERE id = v_institution_id;

  SELECT COALESCE(SUM(credit_paise - debit_paise), 0)
  INTO v_ledger_cash
  FROM institution_cash_ledger
  WHERE institution_id = v_institution_id;

  IF v_cash IS DISTINCT FROM v_ledger_cash THEN
    RAISE EXCEPTION 'Institution cash reconciliation failed for institution %: cash %, ledger cash %',
      v_institution_id, v_cash, v_ledger_cash
      USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE CONSTRAINT TRIGGER institution_cash_ledger_reconciliation
AFTER INSERT ON institution_cash_ledger
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION enforce_institution_cash_reconciliation();

CREATE CONSTRAINT TRIGGER institutions_cash_reconciliation
AFTER UPDATE OF cash_paise ON institutions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION enforce_institution_cash_reconciliation();

INSERT INTO event_settings (
  id,
  event_name,
  currency_code,
  base_capital_paise,
  loan_limit_paise,
  loan_interest_bps,
  brokerage_bps,
  minimum_cash_buffer_paise,
  listed_lot_size,
  institutional_cash_paise,
  cms_index_base_value_hundredths
)
VALUES (
  1,
  'JAIN STOCK EXCHANGE',
  'INR',
  200000000,
  50000000,
  200,
  50,
  2000000,
  50,
  200000000,
  8989000
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_state (id, status)
VALUES (1, 'NOT_STARTED')
ON CONFLICT (id) DO NOTHING;


-- Supabase hardening: all public-schema tables are server-managed through Edge Functions.
-- Direct anon/authenticated Data API access is blocked by RLS until explicit policies are added.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END;
$$;

