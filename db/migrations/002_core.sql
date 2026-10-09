-- JAIN STOCK EXCHANGE (JSE) v272
-- 002_core.sql: helpers, authentication, order creation, Exchange and Bank settlement.
-- Every money-changing step runs inside one database transaction (one function call)
-- with row locks taken in a fixed order: order -> security -> team -> loan -> holding -> institution.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_fail(p_code text, p_msg text, p_http integer DEFAULT 400)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = 'JSE01', MESSAGE = p_msg, DETAIL = p_code, HINT = p_http::text;
END $$;

CREATE OR REPLACE FUNCTION jse_require_role(a jsonb, VARIADIC p_roles text[])
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF a IS NULL OR coalesce(a->>'role', '') = '' THEN
    PERFORM jse_fail('UNAUTHENTICATED', 'Please sign in to continue.', 401);
  END IF;
  IF NOT ((a->>'role') = ANY (p_roles)) THEN
    PERFORM jse_fail('FORBIDDEN', 'Your role (' || (a->>'role') || ') is not allowed to perform this action.', 403);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION jse_actor_name(a jsonb) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(nullif(a->>'username', ''), nullif(a->>'name', ''), 'system')
$$;

CREATE OR REPLACE FUNCTION jse_round_tick(p numeric, p_tick numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT round(p / p_tick) * p_tick
$$;

CREATE OR REPLACE FUNCTION jse_pct(p_new numeric, p_old numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN coalesce(p_old, 0) = 0 THEN 0 ELSE round((p_new - p_old) * 100 / p_old, 4) END
$$;

CREATE OR REPLACE FUNCTION jse_audit(a jsonb, p_action text, p_entity text, p_entity_id text, p_team integer,
                                     p_order bigint, p_before jsonb, p_after jsonb, p_details jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO audit_log(actor_id, actor_username, actor_email, actor_role, action, entity, entity_id, team_id, order_id,
                        before_state, after_state, details, ip, user_agent, session_id)
  VALUES (nullif(a->>'id', '')::integer, coalesce(a->>'username', 'system'), a->>'email', coalesce(a->>'role', 'SYSTEM'),
          p_action, p_entity, p_entity_id, p_team, p_order, p_before, p_after, p_details,
          a->>'ip', left(a->>'ua', 300), a->>'session')
$$;

CREATE OR REPLACE FUNCTION jse_order_event(p_order bigint, p_event text, p_from text, p_to text, a jsonb, p_note text, p_data jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO order_events(order_id, event, from_status, to_status, actor_id, actor_name, actor_role, note, data)
  VALUES (p_order, p_event, p_from, p_to, nullif(a->>'id', '')::integer, jse_actor_name(a), coalesce(a->>'role', 'SYSTEM'), p_note, p_data)
$$;

CREATE OR REPLACE FUNCTION jse_ledger(p_team integer, p_order bigint, p_settlement bigint, p_type text,
                                      p_debit numeric, p_credit numeric, p_balance numeric, p_note text, a jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO cash_ledger(team_id, order_id, settlement_id, entry_type, debit, credit, balance_after, note, actor_id, actor_name)
  VALUES (p_team, p_order, p_settlement, p_type, coalesce(p_debit, 0), coalesce(p_credit, 0), p_balance, p_note,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
$$;

CREATE OR REPLACE FUNCTION jse_inst_ledger(p_inst integer, p_order bigint, p_settlement bigint, p_type text,
                                           p_debit numeric, p_credit numeric, p_balance numeric, p_note text, a jsonb)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO institution_ledger(institution_id, order_id, settlement_id, entry_type, debit, credit, balance_after, note, actor_id, actor_name)
  VALUES (p_inst, p_order, p_settlement, p_type, coalesce(p_debit, 0), coalesce(p_credit, 0), p_balance, p_note,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
$$;

CREATE OR REPLACE FUNCTION jse_journal(p_action text, p_ref bigint, p_summary text, p_payload jsonb, a jsonb)
RETURNS bigint LANGUAGE sql AS $$
  INSERT INTO action_journal(action, ref_id, summary, payload, actor_id, actor_name)
  VALUES (p_action, p_ref, p_summary, coalesce(p_payload, '{}'::jsonb), nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id
$$;

-- Records a risk event once per (order, kind) and bumps the team counter only when new.
CREATE OR REPLACE FUNCTION jse_risk(p_team integer, p_order bigint, p_security integer, p_kind text, p_stage text, p_side text,
                                    p_qty integer, p_holding integer, p_required numeric, p_available numeric, p_note text)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE v_new boolean := false;
BEGIN
  INSERT INTO risk_events(team_id, order_id, security_id, kind, stage, side, quantity, holding_before, required_amount, available_cash, shortage, note)
  VALUES (p_team, p_order, p_security, p_kind, p_stage, p_side, p_qty, p_holding, p_required, p_available,
          CASE WHEN p_required IS NOT NULL AND p_available IS NOT NULL THEN greatest(0, p_required - p_available) END, p_note)
  ON CONFLICT (order_id, kind) WHERE order_id IS NOT NULL DO NOTHING;
  GET DIAGNOSTICS v_new = ROW_COUNT;
  IF v_new THEN
    UPDATE teams SET
      short_sell_attempts = short_sell_attempts + CASE WHEN p_kind = 'SHORT_SELL_ATTEMPT' THEN 1 ELSE 0 END,
      cash_shortfall_attempts = cash_shortfall_attempts + CASE WHEN p_kind = 'CASH_SHORTFALL_ATTEMPT' THEN 1 ELSE 0 END,
      insufficient_balance_rejections = insufficient_balance_rejections + CASE WHEN p_kind = 'INSUFFICIENT_BALANCE_REJECTION' THEN 1 ELSE 0 END,
      updated_at = now()
    WHERE id = p_team;
  END IF;
  RETURN v_new;
END $$;

-- Quantity the team can still sell: holding minus quantity already committed to other open SELL orders.
CREATE OR REPLACE FUNCTION jse_available_qty(p_team integer, p_security integer, p_exclude_order bigint DEFAULT NULL)
RETURNS TABLE(holding integer, open_sell integer, available integer) LANGUAGE sql STABLE AS $$
  WITH h AS (SELECT coalesce((SELECT quantity FROM holdings WHERE team_id = p_team AND security_id = p_security), 0) AS q),
       s AS (SELECT coalesce(sum(quantity), 0)::integer AS q FROM orders
             WHERE team_id = p_team AND security_id = p_security AND side = 'SELL' AND account_type = 'TEAM'
               AND status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
               AND (p_exclude_order IS NULL OR id <> p_exclude_order))
  SELECT h.q, s.q, h.q - s.q FROM h, s
$$;

-- Cash the team still has free: cash minus the full amount of its other open BUY orders.
CREATE OR REPLACE FUNCTION jse_available_cash(p_team integer, p_exclude_order bigint DEFAULT NULL)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT (SELECT cash FROM teams WHERE id = p_team) - coalesce((
    SELECT sum(settlement_amount) FROM orders
    WHERE team_id = p_team AND side = 'BUY' AND account_type = 'TEAM'
      AND status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
      AND (p_exclude_order IS NULL OR id <> p_exclude_order)), 0)
$$;

CREATE OR REPLACE FUNCTION jse_order_json(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'id', o.id, 'order_no', o.order_no, 'account_type', o.account_type,
    'team', t.code, 'team_name', t.name, 'broker', b.code,
    'institution', i.code,
    'security_id', s.id, 'symbol', s.symbol, 'security', s.name, 'kind', s.kind,
    'side', o.side, 'quantity', o.quantity, 'price', o.price,
    'trade_value', o.trade_value, 'brokerage', o.brokerage, 'settlement_amount', o.settlement_amount,
    'reference_price', o.reference_price, 'status', o.status,
    'short_sell_flag', o.short_sell_flag, 'cash_shortfall_flag', o.cash_shortfall_flag,
    'reject_code', o.reject_code, 'reject_reason', o.reject_reason,
    'created_by', o.created_by_name, 'created_at', o.created_at,
    'exchange_by', o.exchange_by_name, 'exchange_at', o.exchange_at,
    'bank_by', o.bank_by_name, 'bank_at', o.bank_at, 'pair_ref', o.pair_ref, 'notes', o.notes)
  FROM orders o
  JOIN teams t ON t.id = o.team_id
  JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id
  LEFT JOIN institutions i ON i.id = o.institution_id
  WHERE o.id = p_id
$$;

-- ---------------------------------------------------------------------------
-- Authentication (bcrypt via pgcrypto; opaque random session tokens, stored hashed)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_user_json(u app_users) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', u.id, 'username', u.username, 'name', u.display_name, 'email', u.email, 'role', u.role,
    'team_id', u.team_id, 'team', (SELECT code FROM teams WHERE id = u.team_id),
    'broker_id', u.broker_id, 'broker', (SELECT code FROM brokers WHERE id = u.broker_id),
    'institution_id', u.institution_id, 'institution', (SELECT code FROM institutions WHERE id = u.institution_id),
    'must_change_password', u.must_change_password)
$$;

CREATE OR REPLACE FUNCTION jse_login(p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  u app_users%ROWTYPE;
  v_token text;
  v_hours integer := coalesce(nullif(p->>'hours', '')::integer, 16);
  a jsonb;
BEGIN
  SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p->>'username', ''))) FOR UPDATE;
  IF NOT FOUND THEN
    PERFORM crypt(coalesce(p->>'password', ''), gen_salt('bf', 8));   -- equal timing for unknown users
    PERFORM jse_fail('INVALID_CREDENTIALS', 'Incorrect username or password.', 401);
  END IF;
  IF u.locked_until IS NOT NULL AND u.locked_until > now() THEN
    PERFORM jse_fail('ACCOUNT_LOCKED', 'Too many failed attempts. Try again in a few minutes.', 423);
  END IF;
  IF u.password_hash <> crypt(coalesce(p->>'password', ''), u.password_hash) THEN
    UPDATE app_users SET failed_logins = failed_logins + 1,
      locked_until = CASE WHEN failed_logins + 1 >= 10 THEN now() + interval '5 minutes' ELSE locked_until END
    WHERE id = u.id;
    a := jsonb_build_object('id', u.id, 'username', u.username, 'role', u.role, 'ip', p->>'ip', 'ua', p->>'ua');
    PERFORM jse_audit(a, 'LOGIN_FAILED', 'user', u.id::text, u.team_id, NULL, NULL, NULL, NULL);
    -- the failed-attempt counter must survive, so return an error object instead of raising
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_CREDENTIALS', 'error', 'Incorrect username or password.', 'http', 401);
  END IF;
  IF NOT u.active THEN
    PERFORM jse_fail('ACCOUNT_DISABLED', 'This account is disabled. Contact the event administrator.', 403);
  END IF;
  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO sessions(token_hash, user_id, expires_at, ip, user_agent)
  VALUES (encode(digest(v_token, 'sha256'), 'hex'), u.id, now() + make_interval(hours => greatest(1, least(v_hours, 72))), p->>'ip', left(p->>'ua', 300));
  UPDATE app_users SET failed_logins = 0, locked_until = NULL, last_login_at = now() WHERE id = u.id;
  a := jsonb_build_object('id', u.id, 'username', u.username, 'role', u.role, 'email', u.email, 'ip', p->>'ip', 'ua', p->>'ua');
  PERFORM jse_audit(a, 'LOGIN', 'user', u.id::text, u.team_id, NULL, NULL, NULL, NULL);
  RETURN jsonb_build_object('success', true, 'token', v_token, 'user', jse_user_json(u),
                            'expires_at', now() + make_interval(hours => greatest(1, least(v_hours, 72))));
END $$;

CREATE OR REPLACE FUNCTION jse_session(p_token_hash text) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s sessions%ROWTYPE; u app_users%ROWTYPE;
BEGIN
  SELECT * INTO s FROM sessions WHERE token_hash = p_token_hash;
  IF NOT FOUND OR s.revoked_at IS NOT NULL OR s.expires_at < now() THEN RETURN NULL; END IF;
  SELECT * INTO u FROM app_users WHERE id = s.user_id;
  IF NOT FOUND OR NOT u.active THEN RETURN NULL; END IF;
  IF s.last_seen_at < now() - interval '2 minutes' THEN
    UPDATE sessions SET last_seen_at = now() WHERE id = s.id;
  END IF;
  RETURN jse_user_json(u) || jsonb_build_object('session', s.id::text, 'expires_at', s.expires_at);
END $$;

CREATE OR REPLACE FUNCTION jse_logout(p_token_hash text) RETURNS jsonb LANGUAGE sql AS $$
  UPDATE sessions SET revoked_at = now() WHERE token_hash = p_token_hash AND revoked_at IS NULL;
  SELECT jsonb_build_object('success', true);
$$;

CREATE OR REPLACE FUNCTION jse_change_password(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE u app_users%ROWTYPE; v_new text := coalesce(p->>'new_password', '');
BEGIN
  SELECT * INTO u FROM app_users WHERE id = (a->>'id')::integer FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('UNAUTHENTICATED', 'Please sign in again.', 401); END IF;
  IF u.password_hash <> crypt(coalesce(p->>'old_password', ''), u.password_hash) THEN
    PERFORM jse_fail('INVALID_CREDENTIALS', 'Your current password is incorrect.', 400);
  END IF;
  IF length(v_new) < 8 THEN PERFORM jse_fail('WEAK_PASSWORD', 'Use at least 8 characters for the new password.', 400); END IF;
  UPDATE app_users SET password_hash = crypt(v_new, gen_salt('bf', 8)), must_change_password = false, updated_at = now() WHERE id = u.id;
  UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL AND id::text <> coalesce(a->>'session', '');
  PERFORM jse_audit(a, 'PASSWORD_CHANGED', 'user', u.id::text, u.team_id, NULL, NULL, NULL, NULL);
  RETURN jsonb_build_object('success', true);
END $$;

-- ---------------------------------------------------------------------------
-- Order creation (participant / broker desk). No cash, holding or price change here.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_place_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer;
  v_price numeric;
  v_tv numeric; v_brk numeric; v_amount numeric;
  v_id bigint; v_no text;
  v_existing bigint;
  v_avail record;
  v_free_cash numeric;
  v_short boolean := false; v_shortfall boolean := false;
  v_warnings jsonb := '[]'::jsonb;
  v_band numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PARTICIPANT');
  IF v_key IS NULL OR length(v_key) > 120 THEN
    PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Order submission is missing its request key. Reload the page and try again.', 400);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-order:' || v_key, 0));
  SELECT id INTO v_existing FROM orders WHERE idempotency_key = v_key;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'replayed', true, 'order', jse_order_json(v_existing), 'warnings', '[]'::jsonb);
  END IF;

  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || v_status || ').', 409);
  END IF;

  SELECT * INTO v_team FROM teams
  WHERE (p ? 'team' AND code = upper(trim(p->>'team'))) OR (p ? 'team_id' AND id = nullif(p->>'team_id', '')::integer);
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Select a valid participant team.', 404); END IF;
  IF NOT v_team.active THEN PERFORM jse_fail('TEAM_INACTIVE', 'Team ' || v_team.code || ' is not active.', 409); END IF;
  IF a->>'role' = 'PARTICIPANT' THEN
    IF NOT cfg.participant_order_entry THEN
      PERFORM jse_fail('PARTICIPANT_ENTRY_DISABLED', 'Orders are entered by the broker desk. Please give your slip to your broker.', 403);
    END IF;
    IF (a->>'team_id')::integer IS DISTINCT FROM v_team.id THEN
      PERFORM jse_fail('FORBIDDEN', 'You can place orders only for your own team.', 403);
    END IF;
  END IF;

  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid stock or IPO.', 404); END IF;

  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;

  BEGIN
    v_qty := (p->>'quantity')::integer;
    v_price := (p->>'price')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_NUMBER', 'Quantity and price must be numbers.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a positive number of shares.', 400); END IF;
  IF v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares (e.g. ' || v_sec.lot_size || ', ' || (2 * v_sec.lot_size) || ', ' || (3 * v_sec.lot_size) || ').', 400);
  END IF;
  IF v_price IS NULL OR v_price <= 0 THEN PERFORM jse_fail('INVALID_PRICE', 'Price must be greater than zero.', 400); END IF;
  IF v_price % cfg.price_tick <> 0 THEN
    PERFORM jse_fail('INVALID_PRICE_TICK', 'Price must be in steps of ₹' || trim(to_char(cfg.price_tick, 'FM999990.00')) || '.', 400);
  END IF;
  v_band := v_sec.price * cfg.max_price_move_pct / 100;
  IF abs(v_price - v_sec.price) > v_band THEN
    PERFORM jse_fail('PRICE_LIMIT', 'Price must stay within ' || cfg.max_price_move_pct || '% of the market price ₹' || v_sec.price ||
      ' (allowed ₹' || ceil((v_sec.price - v_band) / cfg.price_tick) * cfg.price_tick || ' to ₹' || floor((v_sec.price + v_band) / cfg.price_tick) * cfg.price_tick || ').', 400);
  END IF;

  v_tv := round(v_qty * v_price, 2);
  v_brk := round(v_tv * cfg.brokerage_rate, 2);
  v_amount := CASE WHEN v_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ₹' || cfg.min_order_value || ' and ₹' || cfg.max_order_value || ' (this order: ₹' || v_tv || ').', 400);
  END IF;

  -- risk checks (recorded, not blocking)
  IF v_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      v_short := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'SHORT_SELL', 'message',
        'Short selling is not allowed: ' || v_team.code || ' can sell only ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol ||
        ' shares (holding ' || v_avail.holding || ', already in open sell orders ' || v_avail.open_sell || '). The attempt has been recorded.');
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    IF v_amount > v_free_cash THEN
      v_shortfall := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'CASH_SHORTFALL', 'message',
        'Cash shortfall: this BUY needs ₹' || v_amount || ' but ' || v_team.code || ' has ₹' || greatest(v_free_cash, 0) ||
        ' available. The attempt has been recorded; the Bank will decide at settlement.');
    END IF;
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'ORD-' || lpad(v_id::text, 6, '0');
  INSERT INTO orders(id, order_no, account_type, team_id, broker_id, security_id, side, quantity, price, trade_value, brokerage,
                     settlement_amount, reference_price, status, short_sell_flag, cash_shortfall_flag, notes, pair_ref, idempotency_key,
                     created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'TEAM', v_team.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk,
          v_amount, v_sec.price, 'EXCHANGE_PENDING', v_short, v_shortfall, left(p->>'notes', 300), left(p->>'pair_ref', 60), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');

  PERFORM jse_order_event(v_id, 'ORDER_CREATED', NULL, 'EXCHANGE_PENDING', a, NULL,
    jsonb_build_object('reference_price', v_sec.price, 'trade_value', v_tv, 'brokerage', v_brk));
  PERFORM jse_audit(a, 'ORDER_CREATED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_price),
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'settlement_amount', v_amount, 'reference_price', v_sec.price));

  IF v_short THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'SHORT_SELL_ATTEMPT', 'ORDER', v_side, v_qty, v_avail.holding, NULL, NULL,
                     'Open sell orders: ' || v_avail.open_sell);
    PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('quantity', v_qty, 'holding', v_avail.holding, 'open_sell', v_avail.open_sell, 'stage', 'ORDER'));
  END IF;
  IF v_shortfall THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'CASH_SHORTFALL_ATTEMPT', 'ORDER', v_side, v_qty, NULL, v_amount, greatest(v_free_cash, 0), NULL);
    PERFORM jse_audit(a, 'CASH_SHORTFALL_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('required', v_amount, 'available', v_free_cash, 'stage', 'ORDER'));
  END IF;

  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Exchange approval / rejection. Never changes cash, holdings or prices.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_exchange_decide(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  o orders%ROWTYPE;
  v_status text;
  v_action text := upper(coalesce(p->>'action', ''));
  v_confirm boolean := coalesce((p->>'confirm_short_sell')::boolean, false);
  v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
  v_avail record;
  v_to text;
  v_inst_qty integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE');
  IF v_action NOT IN ('APPROVE', 'REJECT') THEN PERFORM jse_fail('INVALID_ACTION', 'Use APPROVE or REJECT.', 400); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || v_status || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status <> 'EXCHANGE_PENDING' THEN
    PERFORM jse_fail('ORDER_NOT_PENDING', o.order_no || ' is no longer pending at the Exchange (status: ' || o.status || ').', 409);
  END IF;

  IF v_action = 'APPROVE' THEN
    IF o.account_type = 'TEAM' AND o.side = 'SELL' THEN
      SELECT * INTO v_avail FROM jse_available_qty(o.team_id, o.security_id, o.id);
      IF o.quantity > v_avail.available THEN
        IF NOT v_confirm THEN
          RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
            MESSAGE = 'Short-selling warning: the team can sell only ' || greatest(v_avail.available, 0) || ' shares (holding ' || v_avail.holding ||
                      '). Confirm to forward it anyway — the Bank will reject it unless holdings are sufficient.';
        END IF;
        UPDATE orders SET short_sell_flag = true, short_sell_approved = true WHERE id = o.id;
        PERFORM jse_risk(o.team_id, o.id, o.security_id, 'SHORT_SELL_ATTEMPT', 'EXCHANGE', o.side, o.quantity, v_avail.holding, NULL, NULL, NULL);
        PERFORM jse_audit(a, 'SHORT_SELLING_APPROVED', 'order', o.order_no, o.team_id, o.id, NULL, NULL,
          jsonb_build_object('holding', v_avail.holding, 'quantity', o.quantity, 'open_sell_other', v_avail.open_sell));
      END IF;
    ELSIF o.account_type = 'INSTITUTION' AND o.side = 'SELL' THEN
      SELECT coalesce((SELECT quantity FROM institutional_holdings WHERE institution_id = o.institution_id AND security_id = o.security_id), 0) INTO v_inst_qty;
      IF v_inst_qty < o.quantity AND NOT v_confirm THEN
        RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
          MESSAGE = 'The institution holds only ' || v_inst_qty || ' shares. Confirm to forward it anyway — the Bank will reject it unless holdings are sufficient.';
      END IF;
    END IF;
    v_to := 'EXCHANGE_APPROVED';
  ELSE
    v_to := 'EXCHANGE_REJECTED';
  END IF;

  UPDATE orders SET status = v_to, exchange_by = nullif(a->>'id', '')::integer, exchange_by_name = jse_actor_name(a), exchange_at = now(),
         exchange_note = v_reason,
         reject_code = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN 'EXCHANGE_REJECTED' ELSE NULL END,
         reject_reason = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN coalesce(v_reason, 'Rejected by Exchange') ELSE NULL END,
         updated_at = now()
  WHERE id = o.id;
  PERFORM jse_order_event(o.id, v_to, 'EXCHANGE_PENDING', v_to, a, v_reason, NULL);
  PERFORM jse_audit(a, v_to, 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'EXCHANGE_PENDING'),
                    jsonb_build_object('status', v_to), jsonb_build_object('reason', v_reason, 'account_type', o.account_type));
  PERFORM jse_journal('EXCHANGE_DECISION', o.id, o.order_no || ' ' || v_to, jsonb_build_object('order_id', o.id, 'decision', v_to, 'reason', v_reason), a);
  RETURN jsonb_build_object('success', true, 'status', v_to, 'order', jse_order_json(o.id));
END $$;

-- ---------------------------------------------------------------------------
-- Bank claim (BANK_PENDING) / release
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_bank_claim(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_release boolean := coalesce((p->>'release')::boolean, false);
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF v_release THEN
    IF o.status <> 'BANK_PENDING' THEN RETURN jsonb_build_object('success', true, 'status', o.status); END IF;
    UPDATE orders SET status = 'EXCHANGE_APPROVED', bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL, updated_at = now() WHERE id = o.id;
    PERFORM jse_order_event(o.id, 'BANK_RELEASED', 'BANK_PENDING', 'EXCHANGE_APPROVED', a, NULL, NULL);
    RETURN jsonb_build_object('success', true, 'status', 'EXCHANGE_APPROVED');
  END IF;
  IF o.status = 'BANK_PENDING' AND o.bank_claimed_by IS DISTINCT FROM nullif(a->>'id', '')::integer
     AND o.bank_claimed_at > now() - interval '2 minutes' THEN
    PERFORM jse_fail('ALREADY_CLAIMED', o.order_no || ' is being verified by ' || coalesce(o.bank_claimed_name, 'another bank operator') || '.', 409);
  END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || o.status || ').', 409);
  END IF;
  UPDATE orders SET status = 'BANK_PENDING', bank_claimed_by = nullif(a->>'id', '')::integer, bank_claimed_name = jse_actor_name(a),
         bank_claimed_at = now(), updated_at = now() WHERE id = o.id;
  IF o.status = 'EXCHANGE_APPROVED' THEN
    PERFORM jse_order_event(o.id, 'BANK_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING', a, 'Bank verification started', NULL);
  END IF;
  RETURN jsonb_build_object('success', true, 'status', 'BANK_PENDING', 'order', jse_order_json(o.id));
END $$;

-- ---------------------------------------------------------------------------
-- Bank rejection (operator decision or failed validation). Commits the rejection.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__bank_reject(a jsonb, o orders, p_code text, p_reason text, p_details jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
BEGIN
  UPDATE orders SET status = 'BANK_REJECTED', reject_code = p_code, reject_reason = p_reason,
         bank_by = nullif(a->>'id', '')::integer, bank_by_name = jse_actor_name(a), bank_at = now(),
         bank_note = p_reason, bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL, updated_at = now()
  WHERE id = o.id;
  PERFORM jse_order_event(o.id, 'BANK_REJECTED', o.status, 'BANK_REJECTED', a, p_reason, p_details || jsonb_build_object('code', p_code));
  PERFORM jse_audit(a, 'BANK_REJECTED', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', o.status),
                    jsonb_build_object('status', 'BANK_REJECTED'), coalesce(p_details, '{}'::jsonb) || jsonb_build_object('code', p_code, 'reason', p_reason));
  PERFORM jse_journal('BANK_REJECT', o.id, o.order_no || ' BANK_REJECTED (' || p_code || ')',
                      jsonb_build_object('order_id', o.id, 'from_status', o.status, 'code', p_code, 'reason', p_reason), a);
  RETURN jsonb_build_object('success', true, 'status', 'BANK_REJECTED', 'code', p_code, 'reason', p_reason,
                            'details', coalesce(p_details, '{}'::jsonb), 'order', jse_order_json(o.id));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_reject(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_status text; v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || v_status || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' THEN PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' is already settled and cannot be rejected.', 409); END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || o.status || ').', 409);
  END IF;
  RETURN jse__bank_reject(a, o, 'BANK_REJECTED_BY_OPERATOR', coalesce(v_reason, 'Rejected by Bank'), '{}'::jsonb);
END $$;

-- ---------------------------------------------------------------------------
-- Bank settlement: the only place where a trade changes cash, holdings and price.
-- Idempotent: an order can have at most one active settlement (unique index) and
-- the status transition happens under the order row lock.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__settle(a jsonb, p_order_id bigint, p_source text DEFAULT 'BANK')
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  o orders%ROWTYPE;
  s securities%ROWTYPE;
  t teams%ROWTYPE;
  inst institutions%ROWTYPE;
  ln loans%ROWTYPE;
  v_hold integer := 0; v_cost numeric := 0; v_tcost numeric := 0;
  v_ihold integer := 0; v_icost numeric := 0;
  v_tv numeric; v_brk numeric; v_req numeric; v_band numeric;
  v_cash numeric; v_cash_after numeric;
  v_draw numeric := 0; v_interest numeric := 0; v_room numeric;
  v_cost_moved numeric := 0; v_tcost_moved numeric := 0; v_icost_moved numeric := 0;
  v_realized numeric := 0;
  v_inst_before numeric; v_inst_after numeric;
  v_settle_id bigint;
  v_price_before numeric; v_prev_before numeric;
  v_bal numeric;
  v_team_delta numeric;
  v_hold_after integer;
  v_note text;
BEGIN
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' OR EXISTS (SELECT 1 FROM settlements WHERE order_id = o.id AND reversed_at IS NULL) THEN
    PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' has already been settled. Duplicate settlement blocked.', 409);
  END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || o.status || ').', 409);
  END IF;
  IF o.status = 'BANK_PENDING' AND o.bank_claimed_by IS NOT NULL AND o.bank_claimed_by IS DISTINCT FROM nullif(a->>'id', '')::integer
     AND o.bank_claimed_at > now() - interval '2 minutes' AND p_source = 'BANK' THEN
    PERFORM jse_fail('ALREADY_CLAIMED', o.order_no || ' is being verified by ' || coalesce(o.bank_claimed_name, 'another bank operator') || '.', 409);
  END IF;

  -- lock order: security -> team -> loan -> holdings -> institution
  SELECT * INTO s FROM securities WHERE id = o.security_id FOR UPDATE;
  SELECT * INTO t FROM teams WHERE id = o.team_id FOR UPDATE;
  INSERT INTO loans(team_id) VALUES (o.team_id) ON CONFLICT (team_id) DO NOTHING;
  SELECT * INTO ln FROM loans WHERE team_id = o.team_id FOR UPDATE;
  SELECT quantity, cost_basis, trade_cost INTO v_hold, v_cost, v_tcost FROM holdings WHERE team_id = o.team_id AND security_id = o.security_id FOR UPDATE;
  v_hold := coalesce(v_hold, 0); v_cost := coalesce(v_cost, 0); v_tcost := coalesce(v_tcost, 0);
  IF o.account_type = 'INSTITUTION' THEN
    SELECT * INTO inst FROM institutions WHERE id = o.institution_id FOR UPDATE;
    SELECT quantity, cost_basis INTO v_ihold, v_icost FROM institutional_holdings WHERE institution_id = o.institution_id AND security_id = o.security_id FOR UPDATE;
    v_ihold := coalesce(v_ihold, 0); v_icost := coalesce(v_icost, 0);
  END IF;

  -- independent re-validation (never trust Exchange alone)
  IF NOT t.active THEN RETURN jse__bank_reject(a, o, 'TEAM_INACTIVE', 'Team ' || t.code || ' is not active.', '{}'::jsonb); END IF;
  IF NOT s.active THEN RETURN jse__bank_reject(a, o, 'SECURITY_INACTIVE', s.symbol || ' is not tradable.', '{}'::jsonb); END IF;
  IF o.quantity <= 0 OR o.quantity % s.lot_size <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_LOT', 'Quantity must be a multiple of ' || s.lot_size || '.', '{}'::jsonb);
  END IF;
  IF o.price <= 0 OR o.price % cfg.price_tick <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_PRICE', 'Invalid order price.', '{}'::jsonb);
  END IF;
  v_band := s.price * cfg.max_price_move_pct / 100;
  IF abs(o.price - s.price) > v_band THEN
    RETURN jse__bank_reject(a, o, 'PRICE_LIMIT', 'Stale order: price ₹' || o.price || ' is more than ' || cfg.max_price_move_pct ||
      '% away from the current market price ₹' || s.price || '.', jsonb_build_object('market_price', s.price, 'order_price', o.price));
  END IF;
  v_tv := round(o.quantity * o.price, 2);
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    RETURN jse__bank_reject(a, o, 'ORDER_VALUE_LIMIT', 'Order value ₹' || v_tv || ' is outside the allowed ₹' || cfg.min_order_value || ' to ₹' || cfg.max_order_value || '.', '{}'::jsonb);
  END IF;
  IF o.account_type = 'TEAM' OR cfg.institution_brokerage THEN
    v_brk := round(v_tv * cfg.brokerage_rate, 2);
  ELSE
    v_brk := 0;
  END IF;

  v_cash := t.cash;
  v_price_before := s.price;
  v_prev_before := s.previous_price;

  -- Which side of the trade is the participant team on?
  --   TEAM order: team side = order side.
  --   INSTITUTION order: the counterparty team takes the opposite side.
  IF (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN
    -- team BUYS
    IF o.account_type = 'INSTITUTION' AND v_ihold < o.quantity THEN
      RETURN jse__bank_reject(a, o, 'INSTITUTION_INSUFFICIENT_HOLDINGS', 'The institution holds only ' || v_ihold || ' ' || s.symbol || ' shares.',
        jsonb_build_object('holding', v_ihold, 'quantity', o.quantity));
    END IF;
    v_req := v_tv + v_brk;
    IF v_cash - v_req < cfg.min_cash_buffer THEN
      v_room := greatest(0, cfg.loan_max_principal - ln.original_principal);
      v_draw := v_req + cfg.min_cash_buffer - v_cash;
      IF NOT (cfg.loans_enabled AND cfg.auto_loan_on_settlement) OR v_draw > v_room THEN
        IF o.account_type = 'TEAM' THEN
          PERFORM jse_risk(t.id, o.id, s.id, 'INSUFFICIENT_BALANCE_REJECTION', 'BANK', o.side, o.quantity, v_hold, v_req, v_cash,
                           'Loan room ₹' || CASE WHEN cfg.loans_enabled THEN v_room ELSE 0 END);
          PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_REJECTED', 'order', o.order_no, t.id, o.id, NULL, NULL,
            jsonb_build_object('required', v_req, 'cash', v_cash, 'min_cash_buffer', cfg.min_cash_buffer,
                               'loan_room', CASE WHEN cfg.loans_enabled THEN v_room ELSE 0 END));
        END IF;
        RETURN jse__bank_reject(a, o, 'INSUFFICIENT_BALANCE',
          'Insufficient balance: ₹' || v_req || ' is needed but ' || t.code || ' has ₹' || v_cash ||
          CASE WHEN cfg.loans_enabled AND cfg.auto_loan_on_settlement THEN ' plus ₹' || v_room || ' of loan room' ELSE '' END ||
          ' and must keep ₹' || cfg.min_cash_buffer || ' in cash.',
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room, 'min_cash_buffer', cfg.min_cash_buffer));
      END IF;
      v_interest := round(v_draw * cfg.loan_interest_rate, 2);
    END IF;
  ELSE
    -- team SELLS
    IF v_hold < o.quantity THEN
      IF o.account_type = 'TEAM' THEN
        PERFORM jse_risk(t.id, o.id, s.id, 'SHORT_SELL_ATTEMPT', 'BANK', o.side, o.quantity, v_hold, NULL, NULL, 'Rejected at Bank');
        PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', o.order_no, t.id, o.id, NULL, NULL,
          jsonb_build_object('quantity', o.quantity, 'holding', v_hold, 'stage', 'BANK'));
        RETURN jse__bank_reject(a, o, 'SHORT_SELLING_NOT_ALLOWED',
          'Short selling is not allowed: ' || t.code || ' holds ' || v_hold || ' ' || s.symbol || ' shares but the order sells ' || o.quantity || '.',
          jsonb_build_object('holding', v_hold, 'quantity', o.quantity));
      END IF;
      RETURN jse__bank_reject(a, o, 'COUNTERPARTY_INSUFFICIENT_HOLDINGS',
        'Counterparty ' || t.code || ' holds only ' || v_hold || ' ' || s.symbol || ' shares.', jsonb_build_object('holding', v_hold, 'quantity', o.quantity));
    END IF;
    IF o.account_type = 'INSTITUTION' AND NOT cfg.institution_overdraft AND inst.cash < v_tv THEN
      RETURN jse__bank_reject(a, o, 'INSTITUTION_INSUFFICIENT_FUNDS', 'The institution has only ₹' || inst.cash || ' available.',
        jsonb_build_object('cash', inst.cash, 'required', v_tv));
    END IF;
  END IF;

  -- ===== all checks passed: apply =====
  INSERT INTO settlements(order_id, account_type, team_id, institution_id, security_id, side, quantity, price, trade_value, brokerage,
                          team_cash_delta, team_cash_before, team_cash_after, holding_before, holding_after,
                          price_before, price_after, previous_price_before, settled_by, settled_by_name)
  VALUES (o.id, o.account_type, t.id, o.institution_id, s.id, o.side, o.quantity, o.price, v_tv, v_brk,
          0, v_cash, v_cash, v_hold, v_hold, v_price_before, o.price, v_prev_before,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_settle_id;

  v_bal := v_cash;
  IF (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN
    IF v_draw > 0 THEN
      v_bal := v_bal + v_draw;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'LOAN_DRAW', 0, v_draw, v_bal,
        'Automatic loan draw so cash stays at the ₹' || cfg.min_cash_buffer || ' minimum (interest ₹' || v_interest || ')', a);
      UPDATE loans SET original_principal = original_principal + v_draw, principal_outstanding = principal_outstanding + v_draw,
             interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
             draws = draws + 1, status = 'OUTSTANDING', updated_at = now()
      WHERE team_id = t.id;
      INSERT INTO loan_transactions(team_id, kind, amount, order_id, settlement_id, automatic, note, actor_id, actor_name)
      VALUES (t.id, 'DRAW', v_draw, o.id, v_settle_id, true, 'Automatic draw at settlement of ' || o.order_no, nullif(a->>'id', '')::integer, jse_actor_name(a)),
             (t.id, 'INTEREST_CHARGE', v_interest, o.id, v_settle_id, true, round(cfg.loan_interest_rate * 100, 2) || '% interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
      PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, o.id, NULL, NULL,
        jsonb_build_object('amount', v_draw, 'interest', v_interest, 'automatic', true, 'order_no', o.order_no));
    END IF;
    v_bal := v_bal - v_tv;
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Bought ' || o.quantity || ' ' || s.symbol || ' @ ₹' || o.price || ' from ' || inst.code
                   ELSE 'Bought ' || o.quantity || ' ' || s.symbol || ' @ ₹' || o.price END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BUY', v_tv, 0, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || round(cfg.brokerage_rate * 100, 3) || '% on ' || o.order_no, a);
    END IF;
    INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (t.id, s.id, o.quantity, v_tv + v_brk, v_tv)
    ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
      cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
    v_hold_after := v_hold + o.quantity;
    v_cost_moved := v_tv + v_brk; v_tcost_moved := v_tv;
    v_team_delta := v_draw - v_tv - v_brk;
    IF o.account_type = 'INSTITUTION' THEN
      v_icost_moved := CASE WHEN v_ihold = o.quantity THEN v_icost ELSE round(v_icost * o.quantity / v_ihold, 4) END;
      UPDATE institutional_holdings SET quantity = quantity - o.quantity, cost_basis = greatest(0, cost_basis - v_icost_moved), updated_at = now()
      WHERE institution_id = inst.id AND security_id = s.id;
      DELETE FROM institutional_holdings WHERE institution_id = inst.id AND security_id = s.id AND quantity = 0;
      v_inst_before := inst.cash; v_inst_after := inst.cash + v_tv;
      UPDATE institutions SET cash = v_inst_after, updated_at = now() WHERE id = inst.id;
      PERFORM jse_inst_ledger(inst.id, o.id, v_settle_id, 'SELL', 0, v_tv, v_inst_after,
        'Sold ' || o.quantity || ' ' || s.symbol || ' @ ₹' || o.price || ' to ' || t.code, a);
    END IF;
  ELSE
    v_cost_moved := CASE WHEN v_hold = o.quantity THEN v_cost ELSE round(v_cost * o.quantity / v_hold, 4) END;
    v_tcost_moved := CASE WHEN v_hold = o.quantity THEN v_tcost ELSE round(v_tcost * o.quantity / v_hold, 4) END;
    UPDATE holdings SET quantity = quantity - o.quantity, cost_basis = greatest(0, cost_basis - v_cost_moved),
           trade_cost = greatest(0, trade_cost - v_tcost_moved), updated_at = now()
    WHERE team_id = t.id AND security_id = s.id;
    DELETE FROM holdings WHERE team_id = t.id AND security_id = s.id AND quantity = 0;
    v_hold_after := v_hold - o.quantity;
    v_bal := v_bal + v_tv;
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Sold ' || o.quantity || ' ' || s.symbol || ' @ ₹' || o.price || ' to ' || inst.code
                   ELSE 'Sold ' || o.quantity || ' ' || s.symbol || ' @ ₹' || o.price END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'SELL', 0, v_tv, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || round(cfg.brokerage_rate * 100, 3) || '% on ' || o.order_no, a);
    END IF;
    v_realized := round(v_tv - v_brk - v_cost_moved, 2);
    v_team_delta := v_tv - v_brk;
    IF o.account_type = 'INSTITUTION' THEN
      INSERT INTO institutional_holdings(institution_id, security_id, quantity, cost_basis) VALUES (inst.id, s.id, o.quantity, v_tv)
      ON CONFLICT (institution_id, security_id) DO UPDATE SET quantity = institutional_holdings.quantity + EXCLUDED.quantity,
        cost_basis = institutional_holdings.cost_basis + EXCLUDED.cost_basis, updated_at = now();
      v_icost_moved := v_tv;
      v_inst_before := inst.cash; v_inst_after := inst.cash - v_tv;
      UPDATE institutions SET cash = v_inst_after, updated_at = now() WHERE id = inst.id;
      PERFORM jse_inst_ledger(inst.id, o.id, v_settle_id, 'BUY', v_tv, 0, v_inst_after,
        'Bought ' || o.quantity || ' ' || s.symbol || ' @ ₹' || o.price || ' from ' || t.code, a);
    END IF;
  END IF;

  v_cash_after := v_bal;
  IF v_cash_after < 0 THEN
    RAISE EXCEPTION 'JSE invariant: negative cash for % on %', t.code, o.order_no;
  END IF;
  UPDATE teams SET cash = v_cash_after, realized_pnl = realized_pnl + v_realized, brokerage_paid = brokerage_paid + v_brk, updated_at = now()
  WHERE id = t.id;

  IF v_brk > 0 AND o.broker_id IS NOT NULL AND o.account_type = 'TEAM' THEN
    INSERT INTO broker_commissions(order_id, settlement_id, broker_id, team_id, side, trade_value, rate, amount)
    VALUES (o.id, v_settle_id, o.broker_id, t.id, o.side, v_tv, cfg.brokerage_rate, v_brk);
  END IF;

  -- trade price becomes the market price (bank settlement is the only trade-side price source)
  IF o.price <> s.price THEN
    UPDATE securities SET previous_price = price, price = o.price, updated_at = now() WHERE id = s.id;
    INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, order_id, settlement_id)
    VALUES (s.id, s.price, o.price, jse_pct(o.price, s.price), 'TRADE', o.id, v_settle_id);
  END IF;
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;

  UPDATE settlements SET brokerage = v_brk, team_cash_delta = v_team_delta, team_cash_after = v_cash_after, holding_after = v_hold_after,
         cost_moved = v_cost_moved, trade_cost_moved = v_tcost_moved, inst_cost_moved = v_icost_moved, realized_pnl = v_realized,
         loan_drawn = v_draw, loan_interest = v_interest, institution_cash_before = v_inst_before, institution_cash_after = v_inst_after
  WHERE id = v_settle_id;

  UPDATE orders SET status = 'BANK_SETTLED', trade_value = v_tv, brokerage = v_brk,
         settlement_amount = CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN v_tv + v_brk ELSE v_tv - v_brk END,
         bank_by = nullif(a->>'id', '')::integer, bank_by_name = jse_actor_name(a), bank_at = now(),
         bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL,
         reject_code = NULL, reject_reason = NULL, updated_at = now()
  WHERE id = o.id;

  PERFORM jse_order_event(o.id, 'BANK_SETTLED', o.status, 'BANK_SETTLED', a, NULL,
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'cash_before', v_cash, 'cash_after', v_cash_after,
                       'loan_drawn', v_draw, 'price_before', v_price_before, 'price_after', o.price));
  PERFORM jse_order_event(o.id, 'MARKET_UPDATED', 'BANK_SETTLED', 'BANK_SETTLED', a,
    s.symbol || ' ₹' || v_price_before || ' → ₹' || o.price || '; cash ₹' || v_cash || ' → ₹' || v_cash_after, NULL);
  PERFORM jse_audit(a, 'BANK_SETTLED', 'order', o.order_no, t.id, o.id,
    jsonb_build_object('status', o.status, 'cash', v_cash, 'holding', v_hold, 'price', v_price_before),
    jsonb_build_object('status', 'BANK_SETTLED', 'cash', v_cash_after, 'holding', v_hold_after, 'price', o.price),
    jsonb_build_object('account_type', o.account_type, 'side', o.side, 'trade_value', v_tv, 'brokerage', v_brk,
                       'loan_drawn', v_draw, 'interest', v_interest, 'realized_pnl', v_realized, 'source', p_source));
  PERFORM jse_journal('BANK_SETTLE', v_settle_id, o.order_no || ' settled (' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ ₹' || o.price || ')',
                      jsonb_build_object('order_id', o.id, 'settlement_id', v_settle_id), a);

  RETURN jsonb_build_object('success', true, 'status', 'BANK_SETTLED', 'settlement_id', v_settle_id,
    'trade_value', v_tv, 'brokerage', v_brk, 'cash_before', v_cash, 'cash_after', v_cash_after,
    'loan_drawn', v_draw, 'loan_interest', v_interest, 'realized_pnl', v_realized,
    'price_before', v_price_before, 'price_after', o.price, 'order', jse_order_json(o.id));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_settle(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || v_status || ').', 409);
  END IF;
  RETURN jse__settle(a, nullif(p->>'order_id', '')::bigint, 'BANK');
END $$;

-- Paired buyer/seller ticket: two linked orders created atomically (both or neither)
CREATE OR REPLACE FUNCTION jse_place_pair(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  legs jsonb := p->'legs';
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_pair text; r1 jsonb; r2 jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER');
  IF v_key IS NULL THEN PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Order submission is missing its request key. Reload the page and try again.', 400); END IF;
  IF jsonb_typeof(legs) IS DISTINCT FROM 'array' OR jsonb_array_length(legs) <> 2 THEN
    PERFORM jse_fail('INVALID_PAIR', 'A paired trade needs exactly one BUY leg and one SELL leg.', 400);
  END IF;
  IF upper(coalesce(legs->0->>'side', '')) = upper(coalesce(legs->1->>'side', '')) THEN
    PERFORM jse_fail('INVALID_PAIR', 'A paired trade needs one BUY leg and one SELL leg.', 400);
  END IF;
  IF upper(trim(coalesce(legs->0->>'team', ''))) = upper(trim(coalesce(legs->1->>'team', ''))) THEN
    PERFORM jse_fail('INVALID_PAIR', 'Buyer and seller must be different teams.', 400);
  END IF;
  v_pair := 'PAIR-' || upper(substr(md5(v_key), 1, 8));
  r1 := jse_place_order(a, (legs->0) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':0'));
  r2 := jse_place_order(a, (legs->1) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':1'));
  RETURN jsonb_build_object('success', true, 'pair_ref', v_pair, 'legs', jsonb_build_array(r1, r2));
END $$;

INSERT INTO schema_migrations(version) VALUES ('002_core');
