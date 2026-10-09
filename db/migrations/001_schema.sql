-- JAIN STOCK EXCHANGE (JSE) v272
-- 001_schema.sql: tables, constraints, indexes and compatibility views.
-- Money is stored as numeric(…,2) rupees. Prices are whole rupees by default (price_tick).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now(),
  checksum text
);

-- ---------------------------------------------------------------------------
-- Event configuration and control (single rows)
-- ---------------------------------------------------------------------------
CREATE TABLE event_config (
  id                       smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  event_name               text NOT NULL DEFAULT 'DALAL STREET 2026',
  initial_capital          numeric(16,2) NOT NULL DEFAULT 2000000 CHECK (initial_capital > 0),
  institutional_cash       numeric(16,2) NOT NULL DEFAULT 20000000 CHECK (institutional_cash >= 0),
  brokerage_rate           numeric(8,6)  NOT NULL DEFAULT 0.005 CHECK (brokerage_rate >= 0 AND brokerage_rate < 1),
  stock_lot_size           integer NOT NULL DEFAULT 50 CHECK (stock_lot_size > 0),
  ipo_lot_size             integer NOT NULL DEFAULT 50 CHECK (ipo_lot_size > 0),
  price_tick               numeric(8,2)  NOT NULL DEFAULT 1 CHECK (price_tick > 0),
  min_order_value          numeric(16,2) NOT NULL DEFAULT 1 CHECK (min_order_value >= 0),
  max_order_value          numeric(16,2) NOT NULL DEFAULT 5000000 CHECK (max_order_value > 0),
  max_price_move_pct       numeric(6,2)  NOT NULL DEFAULT 10 CHECK (max_price_move_pct > 0 AND max_price_move_pct <= 100),
  loan_max_principal       numeric(16,2) NOT NULL DEFAULT 500000 CHECK (loan_max_principal >= 0),
  loan_interest_rate       numeric(8,6)  NOT NULL DEFAULT 0.02 CHECK (loan_interest_rate >= 0 AND loan_interest_rate < 1),
  min_cash_buffer          numeric(16,2) NOT NULL DEFAULT 20000 CHECK (min_cash_buffer >= 0),
  cash_rule_limit          numeric(16,2) NOT NULL DEFAULT 50000 CHECK (cash_rule_limit >= 0),
  loans_enabled            boolean NOT NULL DEFAULT true,
  auto_loan_on_settlement  boolean NOT NULL DEFAULT true,
  participant_order_entry  boolean NOT NULL DEFAULT false,
  institution_overdraft    boolean NOT NULL DEFAULT true,
  institution_brokerage    boolean NOT NULL DEFAULT false,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               text
);

CREATE TABLE event_control (
  id                 smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  status             text NOT NULL DEFAULT 'NOT_STARTED'
                     CHECK (status IN ('NOT_STARTED','LIVE','SETTLEMENT_ONLY','CLOSED','FINALIZED')),
  started_at         timestamptz,
  paused_at          timestamptz,
  closed_at          timestamptz,
  finalized_at       timestamptz,
  status_changed_at  timestamptz NOT NULL DEFAULT now(),
  status_changed_by  text,
  reset_count        integer NOT NULL DEFAULT 0,
  last_reset_at      timestamptz,
  market_updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Participants, brokers, institutions, securities
-- ---------------------------------------------------------------------------
CREATE TABLE brokers (
  id          serial PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id                               serial PRIMARY KEY,
  code                             text NOT NULL UNIQUE CHECK (code ~ '^TEAM-[0-9]{3}$'),
  seq                              integer GENERATED ALWAYS AS ((substring(code from 6))::integer) STORED,
  name                             text NOT NULL,
  section                          text,
  members                          text,
  broker_id                        integer REFERENCES brokers(id),
  cash                             numeric(16,2) NOT NULL CHECK (cash >= 0),
  realized_pnl                     numeric(16,2) NOT NULL DEFAULT 0,
  brokerage_paid                   numeric(16,2) NOT NULL DEFAULT 0 CHECK (brokerage_paid >= 0),
  short_sell_attempts              integer NOT NULL DEFAULT 0 CHECK (short_sell_attempts >= 0),
  cash_shortfall_attempts          integer NOT NULL DEFAULT 0 CHECK (cash_shortfall_attempts >= 0),
  insufficient_balance_rejections  integer NOT NULL DEFAULT 0 CHECK (insufficient_balance_rejections >= 0),
  active                           boolean NOT NULL DEFAULT true,
  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX teams_seq_uq ON teams(seq);

CREATE TABLE institutions (
  id            serial PRIMARY KEY,
  code          text NOT NULL UNIQUE,
  name          text NOT NULL,
  initial_cash  numeric(16,2) NOT NULL,
  cash          numeric(16,2) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE securities (
  id              serial PRIMARY KEY,
  kind            text NOT NULL CHECK (kind IN ('EQUITY','IPO')),
  symbol          text NOT NULL UNIQUE,
  name            text NOT NULL,
  sector          text,
  base_price      numeric(12,2) NOT NULL CHECK (base_price > 0),
  price           numeric(12,2) NOT NULL CHECK (price > 0),
  previous_price  numeric(12,2) NOT NULL CHECK (previous_price > 0),
  lot_size        integer NOT NULL DEFAULT 50 CHECK (lot_size > 0),
  display_order   integer NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  trade_count     integer NOT NULL DEFAULT 0,
  traded_quantity bigint NOT NULL DEFAULT 0,
  traded_value    numeric(18,2) NOT NULL DEFAULT 0,
  last_trade_at   timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Users and sessions
-- ---------------------------------------------------------------------------
CREATE TABLE app_users (
  id                    serial PRIMARY KEY,
  username              text NOT NULL,
  display_name          text NOT NULL,
  email                 text,
  role                  text NOT NULL CHECK (role IN ('ADMIN','EXCHANGE','BANK','BROKER','INSTITUTIONAL','PARTICIPANT','VIEWER')),
  team_id               integer REFERENCES teams(id),
  broker_id             integer REFERENCES brokers(id),
  institution_id        integer REFERENCES institutions(id),
  password_hash         text NOT NULL,
  active                boolean NOT NULL DEFAULT true,
  must_change_password  boolean NOT NULL DEFAULT false,
  failed_logins         integer NOT NULL DEFAULT 0,
  locked_until          timestamptz,
  last_login_at         timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (role <> 'PARTICIPANT' OR team_id IS NOT NULL)
);
CREATE UNIQUE INDEX app_users_username_uq ON app_users (lower(username));

CREATE TABLE sessions (
  id            bigserial PRIMARY KEY,
  token_hash    text NOT NULL UNIQUE,
  user_id       integer NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at    timestamptz,
  ip            text,
  user_agent    text
);
CREATE INDEX sessions_user_idx ON sessions(user_id);

-- ---------------------------------------------------------------------------
-- Holdings
-- ---------------------------------------------------------------------------
CREATE TABLE holdings (
  team_id      integer NOT NULL REFERENCES teams(id),
  security_id  integer NOT NULL REFERENCES securities(id),
  quantity     integer NOT NULL CHECK (quantity >= 0),
  cost_basis   numeric(18,4) NOT NULL DEFAULT 0 CHECK (cost_basis >= 0),   -- includes buy brokerage
  trade_cost   numeric(18,4) NOT NULL DEFAULT 0 CHECK (trade_cost >= 0),   -- execution value only
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, security_id)
);
CREATE INDEX holdings_security_idx ON holdings(security_id);

CREATE TABLE institutional_holdings (
  institution_id  integer NOT NULL REFERENCES institutions(id),
  security_id     integer NOT NULL REFERENCES securities(id),
  quantity        integer NOT NULL CHECK (quantity >= 0),
  cost_basis      numeric(18,4) NOT NULL DEFAULT 0 CHECK (cost_basis >= 0),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (institution_id, security_id)
);

-- ---------------------------------------------------------------------------
-- Orders, workflow events, settlements
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id                  bigserial PRIMARY KEY,
  order_no            text NOT NULL UNIQUE,
  account_type        text NOT NULL CHECK (account_type IN ('TEAM','INSTITUTION')),
  team_id             integer NOT NULL REFERENCES teams(id),          -- trading team, or counterparty team for institutional orders
  institution_id      integer REFERENCES institutions(id),
  broker_id           integer REFERENCES brokers(id),
  security_id         integer NOT NULL REFERENCES securities(id),
  side                text NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity            integer NOT NULL CHECK (quantity > 0),
  price               numeric(12,2) NOT NULL CHECK (price > 0),
  trade_value         numeric(16,2) NOT NULL CHECK (trade_value > 0),
  brokerage           numeric(16,2) NOT NULL DEFAULT 0 CHECK (brokerage >= 0),
  settlement_amount   numeric(16,2) NOT NULL,
  reference_price     numeric(12,2) NOT NULL,
  status              text NOT NULL DEFAULT 'EXCHANGE_PENDING'
                      CHECK (status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','EXCHANGE_REJECTED','BANK_PENDING','BANK_SETTLED','BANK_REJECTED')),
  short_sell_flag     boolean NOT NULL DEFAULT false,
  cash_shortfall_flag boolean NOT NULL DEFAULT false,
  short_sell_approved boolean NOT NULL DEFAULT false,
  reject_code         text,
  reject_reason       text,
  notes               text,
  pair_ref            text,
  idempotency_key     text UNIQUE,
  created_by          integer REFERENCES app_users(id),
  created_by_name     text,
  created_role        text,
  exchange_by         integer REFERENCES app_users(id),
  exchange_by_name    text,
  exchange_at         timestamptz,
  exchange_note       text,
  bank_claimed_by     integer REFERENCES app_users(id),
  bank_claimed_name   text,
  bank_claimed_at     timestamptz,
  bank_by             integer REFERENCES app_users(id),
  bank_by_name        text,
  bank_at             timestamptz,
  bank_note           text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK ((account_type = 'TEAM' AND institution_id IS NULL) OR (account_type = 'INSTITUTION' AND institution_id IS NOT NULL))
);
CREATE INDEX orders_team_idx        ON orders(team_id, created_at DESC);
CREATE INDEX orders_status_idx      ON orders(status, created_at);
CREATE INDEX orders_created_idx     ON orders(created_at DESC, id DESC);
CREATE INDEX orders_security_idx    ON orders(security_id, created_at DESC);
CREATE INDEX orders_broker_idx      ON orders(broker_id);
CREATE INDEX orders_institution_idx ON orders(institution_id) WHERE institution_id IS NOT NULL;
CREATE INDEX orders_open_idx        ON orders(team_id, security_id, side) WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING');

CREATE TABLE order_events (
  id          bigserial PRIMARY KEY,
  order_id    bigint NOT NULL REFERENCES orders(id),
  event       text NOT NULL,
  from_status text,
  to_status   text,
  actor_id    integer,
  actor_name  text,
  actor_role  text,
  note        text,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_events_order_idx ON order_events(order_id, id);

CREATE TABLE settlements (
  id                       bigserial PRIMARY KEY,
  order_id                 bigint NOT NULL REFERENCES orders(id),
  account_type             text NOT NULL,
  team_id                  integer NOT NULL REFERENCES teams(id),
  institution_id           integer REFERENCES institutions(id),
  security_id              integer NOT NULL REFERENCES securities(id),
  side                     text NOT NULL,
  quantity                 integer NOT NULL,
  price                    numeric(12,2) NOT NULL,
  trade_value              numeric(16,2) NOT NULL,
  brokerage                numeric(16,2) NOT NULL,
  team_cash_delta          numeric(16,2) NOT NULL,
  team_cash_before         numeric(16,2) NOT NULL,
  team_cash_after          numeric(16,2) NOT NULL,
  institution_cash_before  numeric(16,2),
  institution_cash_after   numeric(16,2),
  holding_before           integer NOT NULL,
  holding_after            integer NOT NULL,
  cost_moved               numeric(18,4) NOT NULL DEFAULT 0,
  trade_cost_moved         numeric(18,4) NOT NULL DEFAULT 0,
  inst_cost_moved          numeric(18,4) NOT NULL DEFAULT 0,
  realized_pnl             numeric(16,2) NOT NULL DEFAULT 0,
  loan_drawn               numeric(16,2) NOT NULL DEFAULT 0,
  loan_interest            numeric(16,2) NOT NULL DEFAULT 0,
  price_before             numeric(12,2) NOT NULL,
  price_after              numeric(12,2) NOT NULL,
  previous_price_before    numeric(12,2) NOT NULL,
  settled_by               integer,
  settled_by_name          text,
  settled_at               timestamptz NOT NULL DEFAULT now(),
  reversed_at              timestamptz,
  reversed_by_name         text
);
CREATE UNIQUE INDEX settlements_one_active_uq ON settlements(order_id) WHERE reversed_at IS NULL;
CREATE INDEX settlements_team_idx ON settlements(team_id, settled_at DESC);
CREATE INDEX settlements_security_idx ON settlements(security_id, settled_at DESC);

CREATE TABLE broker_commissions (
  id             bigserial PRIMARY KEY,
  order_id       bigint NOT NULL REFERENCES orders(id),
  settlement_id  bigint NOT NULL REFERENCES settlements(id),
  broker_id      integer NOT NULL REFERENCES brokers(id),
  team_id        integer NOT NULL REFERENCES teams(id),
  side           text NOT NULL,
  trade_value    numeric(16,2) NOT NULL,
  rate           numeric(8,6) NOT NULL,
  amount         numeric(16,2) NOT NULL CHECK (amount >= 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  reversed_at    timestamptz
);
CREATE UNIQUE INDEX broker_commissions_one_active_uq ON broker_commissions(order_id) WHERE reversed_at IS NULL;
CREATE INDEX broker_commissions_broker_idx ON broker_commissions(broker_id);

-- ---------------------------------------------------------------------------
-- Cash ledgers (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE cash_ledger (
  id             bigserial PRIMARY KEY,
  team_id        integer NOT NULL REFERENCES teams(id),
  order_id       bigint REFERENCES orders(id),
  settlement_id  bigint REFERENCES settlements(id),
  entry_type     text NOT NULL CHECK (entry_type IN ('INITIAL_CAPITAL','IPO_ALLOTMENT','BUY','SELL','BROKERAGE','LOAN_DRAW','INTEREST','LOAN_REPAYMENT','REVERSAL','ADJUSTMENT')),
  debit          numeric(16,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit         numeric(16,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  balance_after  numeric(16,2) NOT NULL,
  note           text,
  actor_id       integer,
  actor_name     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cash_ledger_team_idx ON cash_ledger(team_id, created_at, id);
CREATE INDEX cash_ledger_created_idx ON cash_ledger(created_at DESC, id DESC);
CREATE INDEX cash_ledger_order_idx ON cash_ledger(order_id) WHERE order_id IS NOT NULL;

CREATE TABLE institution_ledger (
  id              bigserial PRIMARY KEY,
  institution_id  integer NOT NULL REFERENCES institutions(id),
  order_id        bigint REFERENCES orders(id),
  settlement_id   bigint REFERENCES settlements(id),
  entry_type      text NOT NULL CHECK (entry_type IN ('INITIAL_CAPITAL','BUY','SELL','REVERSAL','ADJUSTMENT')),
  debit           numeric(16,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit          numeric(16,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  balance_after   numeric(16,2) NOT NULL,
  note            text,
  actor_id        integer,
  actor_name      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX institution_ledger_idx ON institution_ledger(institution_id, created_at, id);

-- ---------------------------------------------------------------------------
-- Loans
-- ---------------------------------------------------------------------------
CREATE TABLE loans (
  team_id                integer PRIMARY KEY REFERENCES teams(id),
  original_principal     numeric(16,2) NOT NULL DEFAULT 0 CHECK (original_principal >= 0),
  principal_outstanding  numeric(16,2) NOT NULL DEFAULT 0 CHECK (principal_outstanding >= 0),
  interest_outstanding   numeric(16,2) NOT NULL DEFAULT 0 CHECK (interest_outstanding >= 0),
  interest_charged       numeric(16,2) NOT NULL DEFAULT 0 CHECK (interest_charged >= 0),
  interest_paid          numeric(16,2) NOT NULL DEFAULT 0 CHECK (interest_paid >= 0),
  principal_repaid       numeric(16,2) NOT NULL DEFAULT 0 CHECK (principal_repaid >= 0),
  draws                  integer NOT NULL DEFAULT 0,
  status                 text NOT NULL DEFAULT 'NONE' CHECK (status IN ('NONE','OUTSTANDING','REPAID')),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE loan_transactions (
  id             bigserial PRIMARY KEY,
  team_id        integer NOT NULL REFERENCES teams(id),
  kind           text NOT NULL CHECK (kind IN ('DRAW','INTEREST_CHARGE','INTEREST_REPAYMENT','PRINCIPAL_REPAYMENT','REVERSAL')),
  amount         numeric(16,2) NOT NULL CHECK (amount >= 0),
  order_id       bigint REFERENCES orders(id),
  settlement_id  bigint REFERENCES settlements(id),
  automatic      boolean NOT NULL DEFAULT false,
  note           text,
  actor_id       integer,
  actor_name     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX loan_transactions_team_idx ON loan_transactions(team_id, id);

-- ---------------------------------------------------------------------------
-- Risk tracking
-- ---------------------------------------------------------------------------
CREATE TABLE risk_events (
  id               bigserial PRIMARY KEY,
  team_id          integer NOT NULL REFERENCES teams(id),
  order_id         bigint REFERENCES orders(id),
  security_id      integer REFERENCES securities(id),
  kind             text NOT NULL CHECK (kind IN ('SHORT_SELL_ATTEMPT','CASH_SHORTFALL_ATTEMPT','INSUFFICIENT_BALANCE_REJECTION')),
  stage            text NOT NULL CHECK (stage IN ('ORDER','EXCHANGE','BANK')),
  side             text,
  quantity         integer,
  holding_before   integer,
  required_amount  numeric(16,2),
  available_cash   numeric(16,2),
  shortage         numeric(16,2),
  note             text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX risk_events_order_kind_uq ON risk_events(order_id, kind) WHERE order_id IS NOT NULL;
CREATE INDEX risk_events_team_idx ON risk_events(team_id, kind, created_at DESC);

-- ---------------------------------------------------------------------------
-- Market news, price history
-- ---------------------------------------------------------------------------
CREATE TABLE market_news (
  id               bigserial PRIMARY KEY,
  security_id      integer NOT NULL REFERENCES securities(id),
  mood             text NOT NULL CHECK (mood IN ('VERY_SEVERE','SEVERE','NEGATIVE','NORMAL','POSITIVE','VERY_POSITIVE','SUPER_POSITIVE')),
  headline         text NOT NULL,
  requested_pct    numeric(7,2) NOT NULL,
  applied_pct      numeric(9,4) NOT NULL,
  previous_price   numeric(12,2) NOT NULL,
  new_price        numeric(12,2) NOT NULL,
  prior_previous   numeric(12,2) NOT NULL,
  created_by       integer,
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  reversed_at      timestamptz
);
CREATE INDEX market_news_security_idx ON market_news(security_id, created_at DESC);
CREATE INDEX market_news_created_idx ON market_news(created_at DESC);

CREATE TABLE price_history (
  id              bigserial PRIMARY KEY,
  security_id     integer NOT NULL REFERENCES securities(id),
  previous_price  numeric(12,2) NOT NULL,
  new_price       numeric(12,2) NOT NULL,
  change_pct      numeric(9,4) NOT NULL,
  source          text NOT NULL CHECK (source IN ('TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN')),
  order_id        bigint REFERENCES orders(id),
  news_id         bigint REFERENCES market_news(id),
  settlement_id   bigint REFERENCES settlements(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX price_history_security_idx ON price_history(security_id, created_at DESC, id DESC);

-- ---------------------------------------------------------------------------
-- IPO allotments (loaded before trading)
-- ---------------------------------------------------------------------------
CREATE TABLE ipo_allotments (
  id               bigserial PRIMARY KEY,
  team_id          integer NOT NULL REFERENCES teams(id),
  security_id      integer NOT NULL REFERENCES securities(id),
  lots             integer NOT NULL CHECK (lots > 0),
  quantity         integer NOT NULL CHECK (quantity > 0),
  price            numeric(12,2) NOT NULL,
  amount           numeric(16,2) NOT NULL,
  batch_id         text,
  created_by       integer,
  created_by_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  reversed_at      timestamptz
);
CREATE UNIQUE INDEX ipo_allotments_one_active_uq ON ipo_allotments(team_id, security_id) WHERE reversed_at IS NULL;

-- ---------------------------------------------------------------------------
-- Audit log (append-only) and action journal (undo / redo)
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
  id              bigserial PRIMARY KEY,
  actor_id        integer,
  actor_username  text,
  actor_email     text,
  actor_role      text,
  action          text NOT NULL,
  entity          text,
  entity_id       text,
  team_id         integer,
  order_id        bigint,
  before_state    jsonb,
  after_state     jsonb,
  details         jsonb,
  ip              text,
  user_agent      text,
  session_id      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON audit_log(created_at DESC, id DESC);
CREATE INDEX audit_log_action_idx ON audit_log(action, created_at DESC);
CREATE INDEX audit_log_team_idx ON audit_log(team_id, created_at DESC) WHERE team_id IS NOT NULL;
CREATE INDEX audit_log_order_idx ON audit_log(order_id) WHERE order_id IS NOT NULL;

CREATE TABLE audit_log_archive (
  LIKE audit_log,
  archived_at  timestamptz NOT NULL DEFAULT now(),
  reset_no     integer
);

CREATE TABLE action_journal (
  id           bigserial PRIMARY KEY,
  action       text NOT NULL CHECK (action IN ('EXCHANGE_DECISION','BANK_SETTLE','BANK_REJECT','MARKET_NEWS','EVENT_STATUS')),
  ref_id       bigint,
  summary      text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id     integer,
  actor_name   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  undone_at    timestamptz,
  undone_by    text,
  redone_at    timestamptz,
  redone_by    text
);
CREATE INDEX action_journal_created_idx ON action_journal(id DESC);

-- ---------------------------------------------------------------------------
-- Append-only protection. Only the reset routine may clear these tables
-- (it sets jse.maintenance = 'on' for its own transaction).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_forbid_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF coalesce(current_setting('jse.maintenance', true), '') = 'on' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'JSE: % is append-only (% blocked)', TG_TABLE_NAME, TG_OP USING ERRCODE = 'P0001';
END $$;

CREATE TRIGGER audit_log_append_only BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON audit_log FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER cash_ledger_append_only BEFORE UPDATE OR DELETE ON cash_ledger FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER cash_ledger_no_truncate BEFORE TRUNCATE ON cash_ledger FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER institution_ledger_append_only BEFORE UPDATE OR DELETE ON institution_ledger FOR EACH ROW EXECUTE FUNCTION jse_forbid_mutation();
CREATE TRIGGER institution_ledger_no_truncate BEFORE TRUNCATE ON institution_ledger FOR EACH STATEMENT EXECUTE FUNCTION jse_forbid_mutation();

-- ---------------------------------------------------------------------------
-- Spec table names as views (stocks / ipos / per-type holdings / institutional
-- orders / institutional account) over the normalized tables.
-- ---------------------------------------------------------------------------
CREATE VIEW stocks AS
  SELECT id, symbol, name, sector, base_price, price, previous_price, lot_size, display_order, active, last_trade_at, updated_at
  FROM securities WHERE kind = 'EQUITY';
CREATE VIEW ipos AS
  SELECT id, symbol, name, sector, base_price, price, previous_price, lot_size, display_order, active, last_trade_at, updated_at
  FROM securities WHERE kind = 'IPO';
CREATE VIEW stock_holdings AS
  SELECT h.team_id, h.security_id AS stock_id, h.quantity, h.cost_basis, h.trade_cost, h.updated_at
  FROM holdings h JOIN securities s ON s.id = h.security_id WHERE s.kind = 'EQUITY';
CREATE VIEW ipo_holdings AS
  SELECT h.team_id, h.security_id AS ipo_id, h.quantity, h.cost_basis, h.trade_cost, h.updated_at
  FROM holdings h JOIN securities s ON s.id = h.security_id WHERE s.kind = 'IPO';
CREATE VIEW institutional_orders AS
  SELECT * FROM orders WHERE account_type = 'INSTITUTION';
CREATE VIEW institutional_account AS
  SELECT * FROM institutions;
CREATE VIEW participants AS
  SELECT u.id, u.username, u.display_name, u.team_id, t.code AS team_code, u.active
  FROM app_users u JOIN teams t ON t.id = u.team_id WHERE u.role = 'PARTICIPANT';

INSERT INTO schema_migrations(version) VALUES ('001_schema');
