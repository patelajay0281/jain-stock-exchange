-- 031: order accuracy, reconciliation and institutional inventory (21 Oct 2026).
-- Works on the LIVE function definitions (text patches that fail loudly if the expected code is not found) and adds
-- new objects only. Idempotent: safe to re-apply. Never changes cash, holdings, orders, settlements or ledger rows.

-- ---------------------------------------------------------------------------
-- A. Market News price band: permanent ±15% from the company's locked base price (028 rule).
--    030 re-created jse_market_news with the older daily-baseline logic; restore the base-price anchor.
-- ---------------------------------------------------------------------------
DO $a$
DECLARE v_fn text; v_old text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_market_news(jsonb,jsonb)'::regprocedure);
  v_old := $old$  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
  SELECT previous_price INTO v_day_base
  FROM market_news
  WHERE security_id = s.id
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day'
    AND reversed_at IS NULL
  ORDER BY created_at, id
  LIMIT 1;
  v_day_base := coalesce(v_day_base, s.price);$old$;
  IF position(v_old IN v_fn) > 0 THEN
    v_fn := replace(v_fn, v_old, $new$  -- Always anchor the price band to the company's locked starting/base price, not a daily baseline.
  v_day_base := coalesce(s.base_price, s.price);$new$);
    v_fn := replace(v_fn, 'v_day_start timestamptz; v_day_base numeric;', 'v_band_base numeric;');
    v_fn := replace(v_fn, 'v_day_base', 'v_band_base');
    EXECUTE v_fn;
  ELSIF position('v_band_base := coalesce(s.base_price, s.price);' IN v_fn) = 0 THEN
    RAISE EXCEPTION '031-A: Market News band logic not recognised; not changed';
  END IF;
END $a$;

-- ---------------------------------------------------------------------------
-- B. Negotiated team-to-team price must be within ±15% of the current market price (order price deviation limit).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_price_deviation_pct() RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT 15::numeric $$;

DO $b$
DECLARE v_fn text; v_old text := '    v_price := v_negotiated_price;';
BEGIN
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  IF position('NEGOTIATED_PRICE_OUT_OF_BAND' IN v_fn) > 0 THEN RETURN; END IF;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '031-B: negotiated price assignment not found in jse_place_order'; END IF;
  v_fn := replace(v_fn, v_old, v_old || $new$
    IF abs(v_negotiated_price - v_sec.price) > v_sec.price * jse_price_deviation_pct() / 100 THEN
      PERFORM jse_fail('NEGOTIATED_PRICE_OUT_OF_BAND', 'The agreed price ' || jse_inr(v_negotiated_price) || ' is more than ' || jse_price_deviation_pct() ||
        '% away from the current market price ' || jse_inr(v_sec.price) || ' of ' || v_sec.symbol || ' (allowed ' ||
        jse_inr(ceil(v_sec.price * (1 - jse_price_deviation_pct() / 100))) || ' – ' || jse_inr(floor(v_sec.price * (1 + jse_price_deviation_pct() / 100))) || ').', 409);
    END IF;$new$);
  EXECUTE v_fn;
END $b$;

-- ---------------------------------------------------------------------------
-- C. Institutional inventory (optional per company). No row = unlimited, as before.
--    Institution SELL (team buys) needs inventory; institution BUY (team sells) adds to it. Updated in the same
--    transaction as the settlement, so the trade and the inventory always succeed or fail together.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institutional_inventory (
  security_id   integer PRIMARY KEY REFERENCES securities(id),
  quantity      integer NOT NULL CHECK (quantity >= 0),
  updated_by    text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION jse__inst_reserved(p_sec integer, p_exclude bigint DEFAULT NULL) RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT coalesce(sum(quantity), 0)::integer FROM orders
  WHERE account_type = 'INSTITUTION' AND side = 'SELL' AND security_id = p_sec
    AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING') AND (p_exclude IS NULL OR id <> p_exclude)
$$;

CREATE OR REPLACE FUNCTION jse__inst_order_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE inv integer; v_sym text;
BEGIN
  IF NEW.account_type <> 'INSTITUTION' OR NEW.side <> 'SELL' THEN RETURN NEW; END IF;
  SELECT quantity INTO inv FROM institutional_inventory WHERE security_id = NEW.security_id FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.quantity > inv - jse__inst_reserved(NEW.security_id, NEW.id) THEN
    SELECT symbol INTO v_sym FROM securities WHERE id = NEW.security_id;
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSTITUTION_INVENTORY', HINT = '409',
      MESSAGE = 'The institutional investor has only ' || greatest(inv - jse__inst_reserved(NEW.security_id, NEW.id), 0) || ' ' || v_sym ||
                ' shares available to sell (inventory ' || inv || ', in open orders ' || jse__inst_reserved(NEW.security_id, NEW.id) || ').';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS jse_inst_order_guard_trg ON orders;
CREATE TRIGGER jse_inst_order_guard_trg BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION jse__inst_order_guard();

CREATE OR REPLACE FUNCTION jse__inst_settlement_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_delta integer; v_left integer; v_sym text;
BEGIN
  IF NEW.account_type IS DISTINCT FROM 'INSTITUTION' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' AND NEW.reversed_at IS NULL THEN
    v_delta := CASE WHEN NEW.side = 'SELL' THEN -NEW.quantity ELSE NEW.quantity END;
  ELSIF TG_OP = 'UPDATE' AND OLD.reversed_at IS NULL AND NEW.reversed_at IS NOT NULL THEN
    v_delta := CASE WHEN NEW.side = 'SELL' THEN NEW.quantity ELSE -NEW.quantity END;      -- undo of a settlement
  ELSIF TG_OP = 'UPDATE' AND OLD.reversed_at IS NOT NULL AND NEW.reversed_at IS NULL THEN
    v_delta := CASE WHEN NEW.side = 'SELL' THEN -NEW.quantity ELSE NEW.quantity END;      -- redo
  ELSE RETURN NEW;
  END IF;
  UPDATE institutional_inventory SET quantity = quantity + v_delta, updated_at = now() WHERE security_id = NEW.security_id
  RETURNING quantity INTO v_left;
  IF FOUND AND v_left < 0 THEN
    SELECT symbol INTO v_sym FROM securities WHERE id = NEW.security_id;
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSTITUTION_INVENTORY', HINT = '409',
      MESSAGE = 'Settlement blocked: the institutional investor does not have enough ' || v_sym || ' shares.';
  END IF;
  RETURN NEW;
EXCEPTION WHEN check_violation THEN
  RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSTITUTION_INVENTORY', HINT = '409', MESSAGE = 'Settlement blocked: institutional inventory would become negative.';
END $$;
DROP TRIGGER IF EXISTS jse_inst_settlement_inventory_trg ON settlements;
CREATE TRIGGER jse_inst_settlement_inventory_trg AFTER INSERT OR UPDATE OF reversed_at ON settlements FOR EACH ROW EXECUTE FUNCTION jse__inst_settlement_inventory();

CREATE OR REPLACE FUNCTION jse_institution_inventory(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_action text := upper(coalesce(p->>'action', 'LIST')); s securities%ROWTYPE; v_qty numeric; v_old integer; v_res integer;
BEGIN
  IF v_action = 'LIST' THEN
    PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'INSTITUTIONAL');
    RETURN jsonb_build_object('success', true, 'items', coalesce((
      SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'name', s2.name, 'kind', s2.kind, 'configured', i.security_id IS NOT NULL, 'quantity', i.quantity,
        'reserved', jse__inst_reserved(s2.id), 'available', CASE WHEN i.security_id IS NOT NULL THEN i.quantity - jse__inst_reserved(s2.id) END,
        'updated_by', i.updated_by, 'updated_at', i.updated_at) ORDER BY s2.kind, s2.display_order, s2.symbol)
      FROM securities s2 LEFT JOIN institutional_inventory i ON i.security_id = s2.id WHERE s2.active), '[]'::jsonb));
  END IF;
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO s FROM securities WHERE symbol = upper(trim(coalesce(p->>'symbol', '')));
  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Choose a company.', 404); END IF;
  IF coalesce(trim(p->>'reason'), '') = '' THEN PERFORM jse_fail('REASON_REQUIRED', 'Give a reason for the change.', 400); END IF;
  SELECT quantity INTO v_old FROM institutional_inventory WHERE security_id = s.id FOR UPDATE;
  v_res := jse__inst_reserved(s.id);
  IF v_action = 'SET' THEN
    BEGIN v_qty := (p->>'quantity')::numeric; EXCEPTION WHEN others THEN v_qty := NULL; END;
    IF v_qty IS NULL OR v_qty < 0 OR v_qty <> trunc(v_qty) THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a whole number of shares (0 or more).', 400); END IF;
    IF v_qty < v_res THEN PERFORM jse_fail('BELOW_RESERVED', v_res || ' ' || s.symbol || ' shares are already in open institutional sell orders; the inventory cannot be lower.', 409); END IF;
    INSERT INTO institutional_inventory(security_id, quantity, updated_by) VALUES (s.id, v_qty, jse_actor_name(a))
    ON CONFLICT (security_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_by = EXCLUDED.updated_by, updated_at = now();
  ELSIF v_action = 'UNLIMITED' THEN
    DELETE FROM institutional_inventory WHERE security_id = s.id;
  ELSE PERFORM jse_fail('INVALID_ACTION', 'Choose SET or UNLIMITED.', 400);
  END IF;
  PERFORM jse_audit(a, 'INSTITUTION_INVENTORY_' || v_action, 'security', s.symbol, NULL, NULL, jsonb_build_object('quantity', v_old),
    jsonb_build_object('quantity', CASE WHEN v_action = 'SET' THEN v_qty END), jsonb_build_object('reason', p->>'reason', 'reserved', v_res));
  RETURN jsonb_build_object('success', true, 'symbol', s.symbol, 'quantity', CASE WHEN v_action = 'SET' THEN v_qty END,
    'message', s.symbol || ': institutional inventory ' || CASE WHEN v_action = 'SET' THEN 'set to ' || v_qty::integer || ' shares' ELSE 'unlimited' END || '.');
END $$;

-- ---------------------------------------------------------------------------
-- D. Reconciliation (read-only) and a controlled correction for ledger gaps.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_reconcile(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v jsonb := '[]'::jsonb; v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  -- orders missing references
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'MISSING_REFERENCE', 'order', o.order_no, 'team', t.code,
      'issue', 'Order is missing its ' || concat_ws(', ', CASE WHEN o.team_id IS NULL THEN 'team' END, CASE WHEN o.security_id IS NULL THEN 'security' END,
                                                        CASE WHEN o.account_type = 'TEAM' AND o.broker_id IS NULL THEN 'broker' END),
      'expected', 'team, security and broker set', 'recorded', NULL, 'recommendation', 'Investigate the order; do not settle it until the reference is fixed.'))
    FROM orders o LEFT JOIN teams t ON t.id = o.team_id WHERE o.team_id IS NULL OR o.security_id IS NULL OR (o.account_type = 'TEAM' AND o.broker_id IS NULL)), '[]'::jsonb);
  -- order broker differs from the team's broker
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'BROKER_MISMATCH', 'order', o.order_no, 'team', t.code, 'issue', 'Order broker differs from the team''s current broker',
      'expected', (SELECT code FROM brokers WHERE id = t.broker_id), 'recorded', (SELECT code FROM brokers WHERE id = o.broker_id),
      'recommendation', 'Usually caused by a later broker reassignment; commissions follow the order''s broker. Confirm with the broker roster.'))
    FROM orders o JOIN teams t ON t.id = o.team_id WHERE o.account_type = 'TEAM' AND o.broker_id IS DISTINCT FROM t.broker_id), '[]'::jsonb);
  -- settled status vs settlement rows
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLED_WITHOUT_SETTLEMENT', 'order', o.order_no, 'team', t.code, 'issue', 'Order is BANK_SETTLED but has no active settlement',
      'expected', '1 settlement', 'recorded', '0', 'recommendation', 'Review with the Bank; correct the status or re-settle through the Bank desk.'))
    FROM orders o JOIN teams t ON t.id = o.team_id WHERE o.status = 'BANK_SETTLED' AND NOT EXISTS (SELECT 1 FROM settlements s WHERE s.order_id = o.id AND s.reversed_at IS NULL)), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLEMENT_STATUS', 'order', o.order_no, 'team', t.code, 'issue', 'Active settlement but order status is ' || o.status,
      'expected', 'BANK_SETTLED', 'recorded', o.status, 'recommendation', 'Review the order event history.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id WHERE s.reversed_at IS NULL AND o.status <> 'BANK_SETTLED'), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'DUPLICATE_SETTLEMENT', 'order', o.order_no, 'team', t.code, 'issue', x.n || ' active settlements for one order',
      'expected', '1', 'recorded', x.n::text, 'recommendation', 'Undo the extra settlement through Recovery · Undo with a reason.'))
    FROM (SELECT order_id, count(*) n FROM settlements WHERE reversed_at IS NULL GROUP BY 1 HAVING count(*) > 1) x JOIN orders o ON o.id = x.order_id JOIN teams t ON t.id = o.team_id), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLEMENT_ORDER_MISMATCH', 'order', o.order_no, 'team', t.code, 'issue', 'Settlement team, security or quantity differs from the order',
      'expected', o.team_id || '/' || o.security_id || '/' || o.quantity, 'recorded', s.team_id || '/' || s.security_id || '/' || s.quantity, 'recommendation', 'Investigate before any correction.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id
    WHERE s.reversed_at IS NULL AND (s.team_id <> o.team_id OR s.security_id <> o.security_id OR s.quantity <> o.quantity)), '[]'::jsonb);
  -- values
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'TRADE_VALUE', 'order', o.order_no, 'team', t.code, 'issue', 'Trade value ≠ quantity × execution price',
      'expected', round(s.quantity * s.price, 2), 'recorded', s.trade_value, 'recommendation', 'Investigate; do not edit history without a compensating correction.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id WHERE s.reversed_at IS NULL AND abs(s.trade_value - round(s.quantity * s.price, 2)) > 0.01), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'BROKERAGE', 'order', o.order_no, 'team', t.code, 'issue', 'Brokerage ≠ trade value × the order''s brokerage rate',
      'expected', round(s.trade_value * coalesce(o.brokerage_rate, 0.005), 2), 'recorded', s.brokerage, 'recommendation', 'Compensating ledger correction after review.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id
    WHERE s.reversed_at IS NULL AND abs(s.brokerage - round(s.trade_value * coalesce(o.brokerage_rate, 0.005), 2)) > 0.01), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'SETTLEMENT_WITHOUT_LEDGER', 'order', o.order_no, 'team', t.code, 'issue', 'Settlement has no cash-ledger entry',
      'expected', '≥1 ledger row', 'recorded', '0', 'recommendation', 'Post a ledger-only correction after confirming the cash balance.'))
    FROM settlements s JOIN orders o ON o.id = s.order_id JOIN teams t ON t.id = o.team_id
    WHERE s.reversed_at IS NULL AND NOT EXISTS (SELECT 1 FROM cash_ledger c WHERE c.settlement_id = s.id)), '[]'::jsonb);
  -- balances
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'CASH_VS_LEDGER', 'order', NULL, 'team', t.code, 'issue', 'Team cash ≠ sum of its cash-ledger credits − debits',
      'expected', x.ledger, 'recorded', t.cash, 'difference', t.cash - x.ledger,
      'recommendation', 'If the balance itself is right (e.g. an approved special-account top-up), record the missing movement with a ledger-only correction.'))
    FROM teams t JOIN (SELECT team_id, sum(credit) - sum(debit) ledger FROM cash_ledger GROUP BY 1) x ON x.team_id = t.id WHERE abs(t.cash - x.ledger) > 0.01), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'NEGATIVE_BALANCE', 'order', NULL, 'team', t.code, 'issue', 'Negative cash', 'expected', '≥ 0', 'recorded', t.cash,
      'recommendation', 'Investigate immediately.')) FROM teams t WHERE t.cash < 0), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'HOLDING_VS_TRADES', 'order', NULL, 'team', t.code, 'issue', s.symbol || ' holding ≠ settled trades + IPO allotments',
      'expected', z.flows, 'recorded', z.hq, 'recommendation', 'Investigate the security''s settlements for this team.'))
    FROM (SELECT h.team_id, h.security_id, h.quantity hq,
            coalesce((SELECT sum(CASE WHEN jse_team_side(st.account_type, st.side) = 'BUY' THEN st.quantity ELSE -st.quantity END) FROM settlements st
                      WHERE st.team_id = h.team_id AND st.security_id = h.security_id AND st.reversed_at IS NULL), 0)
          + coalesce((SELECT sum(quantity) FROM ipo_allotments al WHERE al.team_id = h.team_id AND al.security_id = h.security_id AND al.reversed_at IS NULL), 0) flows
          FROM (SELECT team_id, security_id, quantity FROM holdings
                UNION SELECT DISTINCT team_id, security_id, 0 FROM settlements WHERE reversed_at IS NULL
                  AND NOT EXISTS (SELECT 1 FROM holdings h2 WHERE h2.team_id = settlements.team_id AND h2.security_id = settlements.security_id)) h) z
    JOIN teams t ON t.id = z.team_id JOIN securities s ON s.id = z.security_id WHERE z.hq <> z.flows), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'NEGATIVE_HOLDING', 'order', NULL, 'team', t.code, 'issue', s.symbol || ' holding is negative', 'expected', '≥ 0', 'recorded', h.quantity,
      'recommendation', 'Investigate immediately.')) FROM holdings h JOIN teams t ON t.id = h.team_id JOIN securities s ON s.id = h.security_id WHERE h.quantity < 0), '[]'::jsonb);
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'NEGATIVE_INSTITUTION_INVENTORY', 'order', NULL, 'team', NULL, 'issue', s.symbol || ' institutional inventory is negative',
      'expected', '≥ 0', 'recorded', i.quantity, 'recommendation', 'Set the inventory in Event Admin.')) FROM institutional_inventory i JOIN securities s ON s.id = i.security_id WHERE i.quantity < 0), '[]'::jsonb);
  -- statuses
  IF v_status IN ('CLOSED', 'FINALIZED') THEN
    v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'OPEN_AFTER_CLOSE', 'order', o.order_no, 'team', t.code, 'issue', 'Order still ' || o.status || ' after the market closed',
        'expected', 'settled or rejected', 'recorded', o.status, 'recommendation', 'Event Admin → Reject open orders (with a reason), or settle it if it was approved before the close.'))
      FROM orders o JOIN teams t ON t.id = o.team_id WHERE o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')), '[]'::jsonb);
  END IF;
  v := v || coalesce((SELECT jsonb_agg(jsonb_build_object('check', 'PARTICIPANT_ACCOUNT', 'order', NULL, 'team', u.username, 'issue', 'Participant login is not linked to a team',
      'expected', 'team set', 'recorded', NULL, 'recommendation', 'Edit or disable the account.')) FROM app_users u WHERE u.role = 'PARTICIPANT' AND u.team_id IS NULL), '[]'::jsonb);
  RETURN jsonb_build_object('success', true, 'checked_at', now(), 'event_status', v_status, 'issues', v,
    'summary', jsonb_build_object('orders', (SELECT count(*) FROM orders), 'settlements', (SELECT count(*) FROM settlements WHERE reversed_at IS NULL),
      'ledger_rows', (SELECT count(*) FROM cash_ledger), 'teams', (SELECT count(*) FROM teams), 'issues', jsonb_array_length(v)),
    'checks', jsonb_build_array('MISSING_REFERENCE','BROKER_MISMATCH','SETTLED_WITHOUT_SETTLEMENT','SETTLEMENT_STATUS','DUPLICATE_SETTLEMENT','SETTLEMENT_ORDER_MISMATCH',
      'TRADE_VALUE','BROKERAGE','SETTLEMENT_WITHOUT_LEDGER','CASH_VS_LEDGER','NEGATIVE_BALANCE','HOLDING_VS_TRADES','NEGATIVE_HOLDING','NEGATIVE_INSTITUTION_INVENTORY',
      'OPEN_AFTER_CLOSE','PARTICIPANT_ACCOUNT'));
END $$;

-- Ledger-only correction: records a missing cash movement so the ledger explains the balance. Never changes cash.
CREATE OR REPLACE FUNCTION jse_reconcile_correct(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE t teams%ROWTYPE; v_ledger numeric; v_gap numeric; v_kind text := upper(coalesce(p->>'kind', ''));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  IF v_kind <> 'LEDGER_GAP' THEN PERFORM jse_fail('INVALID_KIND', 'Only ledger-gap corrections are supported here; other issues need a review and the normal desk workflow.', 400); END IF;
  IF coalesce(trim(p->>'reason'), '') = '' THEN PERFORM jse_fail('REASON_REQUIRED', 'Give the reason and the approval behind this correction.', 400); END IF;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', ''))) FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  SELECT coalesce(sum(credit) - sum(debit), 0) INTO v_ledger FROM cash_ledger WHERE team_id = t.id;
  v_gap := round(t.cash - v_ledger, 2);
  IF abs(v_gap) < 0.01 THEN PERFORM jse_fail('NOTHING_TO_CORRECT', t.code || ' cash already matches its ledger.', 409); END IF;
  IF nullif(p->>'expected_gap', '') IS NOT NULL AND round((p->>'expected_gap')::numeric, 2) <> v_gap THEN
    PERFORM jse_fail('GAP_CHANGED', 'The difference is now ' || jse_inr(v_gap) || '; reload and review again.', 409);
  END IF;
  PERFORM jse_ledger(t.id, NULL, NULL, 'ADJUSTMENT', greatest(-v_gap, 0), greatest(v_gap, 0), t.cash,
    'Reconciliation (ledger only, cash unchanged): ' || left(trim(p->>'reason'), 240), a);
  PERFORM jse_audit(a, 'RECONCILIATION_LEDGER_CORRECTION', 'team', t.code, t.id, NULL, jsonb_build_object('ledger_sum', v_ledger, 'cash', t.cash),
    jsonb_build_object('ledger_sum', t.cash, 'cash', t.cash), jsonb_build_object('gap', v_gap, 'reason', p->>'reason'));
  RETURN jsonb_build_object('success', true, 'team', t.code, 'gap', v_gap,
    'message', t.code || ': ledger correction of ' || jse_inr(abs(v_gap)) || ' recorded (cash unchanged at ' || jse_inr(t.cash) || ').');
END $$;

INSERT INTO schema_migrations(version) VALUES ('031_order_accuracy') ON CONFLICT DO NOTHING;
