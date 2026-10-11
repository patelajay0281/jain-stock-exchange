-- JAIN STOCK EXCHANGE (JSE) v311
-- 002_core.sql: helpers, authentication, broker order submission, Pit Manager execution and
-- trading slips, Exchange review and Bank settlement.
-- Canonical flow: PARTICIPANT INSTRUCTION → BROKER SUBMISSION → PIT MANAGER EXECUTION → EXCHANGE REVIEW
--                 → BANK SETTLEMENT → CASH / HOLDINGS UPDATE.
-- Market prices change ONLY through the Market News engine (and the one-time IPO listing); orders are
-- submitted at the canonical market price and settlement never writes a price.
-- Every money-changing step is one database transaction (one function call) with row locks taken in a
-- fixed order: security -> order -> team -> loan -> holding -> institution (settlement: order -> security -> …).
-- Security row locks: Market News FOR UPDATE · submission / execution FOR KEY SHARE · settlement FOR NO KEY UPDATE.

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

-- Material administrative actions re-confirm the signed-in administrator's password (one dialog per action).
-- Automated staging tests sign in with a GitHub OIDC token (session kind CI) and have no password to give.
CREATE OR REPLACE FUNCTION jse_require_admin_password(a jsonb, p jsonb)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_hash text;
BEGIN
  IF coalesce(a->>'session_kind', '') = 'CI' THEN RETURN; END IF;
  SELECT password_hash INTO v_hash FROM app_users WHERE id = nullif(a->>'id', '')::integer AND role = 'ADMIN' AND active;
  IF v_hash IS NULL THEN PERFORM jse_fail('FORBIDDEN', 'Only an active administrator can do this.', 403); END IF;
  IF coalesce(p->>'admin_password', '') = '' THEN
    PERFORM jse_fail('ADMIN_PASSWORD_REQUIRED', 'Enter the administrator password to confirm this action.', 403);
  END IF;
  IF v_hash <> crypt(p->>'admin_password', v_hash) THEN
    PERFORM jse_fail('ADMIN_PASSWORD_INVALID', 'The administrator password is incorrect. Nothing was changed.', 403);
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

CREATE OR REPLACE FUNCTION jse_rate_text(p_rate numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(to_char(coalesce(p_rate, 0) * 100, 'FM9990.00')) || '%'
$$;

-- Indian rupee text for messages and records: ₹19,11,000 · ₹1,445.50 · −₹250 (paise only when present)
CREATE OR REPLACE FUNCTION jse_inr(p numeric) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_abs numeric; v_int text; v_dec text; v_head text; v_out text;
BEGIN
  IF p IS NULL THEN RETURN NULL; END IF;
  v_abs := abs(round(p, 2));
  v_int := trunc(v_abs)::text;
  v_dec := lpad(round((v_abs - trunc(v_abs)) * 100)::integer::text, 2, '0');
  IF length(v_int) > 3 THEN
    v_out := right(v_int, 3); v_head := left(v_int, length(v_int) - 3);
    WHILE length(v_head) > 2 LOOP
      v_out := right(v_head, 2) || ',' || v_out; v_head := left(v_head, length(v_head) - 2);
    END LOOP;
    v_out := v_head || ',' || v_out;
  ELSE
    v_out := v_int;
  END IF;
  RETURN CASE WHEN p < 0 THEN '−' ELSE '' END || '₹' || v_out || CASE WHEN v_dec <> '00' THEN '.' || v_dec ELSE '' END;
END $$;

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
               AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
               AND (p_exclude_order IS NULL OR id <> p_exclude_order))
  SELECT h.q, s.q, h.q - s.q FROM h, s
$$;

-- Cash the team still has free: cash minus the full amount of its other open BUY orders.
CREATE OR REPLACE FUNCTION jse_available_cash(p_team integer, p_exclude_order bigint DEFAULT NULL)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT (SELECT cash FROM teams WHERE id = p_team) - coalesce((
    SELECT sum(settlement_amount) FROM orders
    WHERE team_id = p_team AND side = 'BUY' AND account_type = 'TEAM'
      AND status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
      AND (p_exclude_order IS NULL OR id <> p_exclude_order)), 0)
$$;

-- Loan principal the team can still draw (limit applies to the total principal ever drawn).
CREATE OR REPLACE FUNCTION jse_loan_room(p_team integer) RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN c.loans_enabled THEN greatest(0, c.loan_max_principal - coalesce(l.original_principal, 0)) ELSE 0 END
  FROM event_config c LEFT JOIN loans l ON l.team_id = p_team WHERE c.id = 1
$$;

-- User-facing stage of an order in the canonical flow
CREATE OR REPLACE FUNCTION jse_stage_label(p_status text, p_code text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_status
    WHEN 'PIT_PENDING' THEN 'Broker submitted · awaiting Pit Manager'
    WHEN 'PIT_REJECTED' THEN CASE WHEN p_code = 'PRICE_STALE' THEN 'Rejected · price stale' ELSE 'Rejected by Pit Manager' END
    WHEN 'EXCHANGE_PENDING' THEN 'Executed · awaiting Exchange'
    WHEN 'EXCHANGE_APPROVED' THEN 'Exchange approved · awaiting Bank'
    WHEN 'BANK_PENDING' THEN 'Bank verifying'
    WHEN 'BANK_SETTLED' THEN 'Settled'
    WHEN 'EXCHANGE_REJECTED' THEN 'Rejected by Exchange'
    WHEN 'BANK_REJECTED' THEN 'Rejected by Bank'
    ELSE p_status END
$$;

CREATE OR REPLACE FUNCTION jse_order_json(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'id', o.id, 'order_no', o.order_no, 'account_type', o.account_type,
    'team', t.code, 'team_name', t.name, 'broker', b.code, 'broker_name', b.name,
    'institution', i.code, 'institution_name', i.name,
    'security_id', s.id, 'symbol', s.symbol, 'security', s.name, 'kind', s.kind,
    'side', o.side, 'quantity', o.quantity, 'price', o.price,
    'trade_value', o.trade_value, 'brokerage_rate', coalesce(o.brokerage_rate, CASE WHEN o.trade_value > 0 THEN round(o.brokerage / o.trade_value, 6) END),
    'brokerage', o.brokerage, 'settlement_amount', o.settlement_amount,
    'reference_price', o.reference_price, 'market_price', s.price, 'status', o.status, 'stage', jse_stage_label(o.status, o.reject_code),
    'short_sell_flag', o.short_sell_flag, 'cash_shortfall_flag', o.cash_shortfall_flag,
    'reject_code', o.reject_code, 'reject_reason', o.reject_reason,
    'instruction_no', ins.instruction_no, 'instruction_at', ins.created_at,
    'created_by', o.created_by_name, 'created_role', o.created_role, 'created_at', o.created_at,
    'pit_by', o.pit_by_name, 'pit_at', o.pit_at,
    'executed_at', o.executed_at, 'executed_by', o.executed_by_name, 'executed_price', o.executed_price, 'executed_quantity', o.executed_quantity,
    'slip_no', sl.slip_no,
    'exchange_by', o.exchange_by_name, 'exchange_at', o.exchange_at,
    'bank_by', o.bank_by_name, 'bank_at', o.bank_at, 'pair_ref', o.pair_ref, 'notes', o.notes, 'updated_at', o.updated_at)
  FROM orders o
  JOIN teams t ON t.id = o.team_id
  JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id
  LEFT JOIN institutions i ON i.id = o.institution_id
  LEFT JOIN instructions ins ON ins.id = o.instruction_id
  LEFT JOIN trading_slips sl ON sl.order_id = o.id
  WHERE o.id = p_id
$$;

-- ---------------------------------------------------------------------------
-- The canonical price writer. Called by Market News, IPO listing and their undo / redo — never by
-- order submission, execution, Exchange or Bank. Records price history and marks orders still
-- waiting for the Pit Manager at the old price as PRICE STALE.
-- The caller must hold the security row FOR UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__mark_stale(a jsonb, o orders, p_market numeric, p_source text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_reason text;
BEGIN
  v_reason := 'PRICE STALE: the market price moved from ' || jse_inr(o.price) || ' to ' || jse_inr(p_market) || ' (' || replace(p_source, '_', ' ') ||
              ') before the Pit Manager executed this order. The broker must submit a fresh order at the new market price.';
  UPDATE orders SET status = 'PIT_REJECTED', reject_code = 'PRICE_STALE', reject_reason = v_reason,
         pit_at = now(), pit_by_name = 'SYSTEM · ' || replace(p_source, '_', ' '), updated_at = now()
  WHERE id = o.id AND status = 'PIT_PENDING';
  PERFORM jse_order_event(o.id, 'PRICE_STALE', 'PIT_PENDING', 'PIT_REJECTED', a, v_reason,
    jsonb_build_object('order_price', o.price, 'market_price', p_market, 'source', p_source));
  PERFORM jse_audit(a, 'ORDER_PRICE_STALE', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'PIT_PENDING'),
    jsonb_build_object('status', 'PIT_REJECTED', 'reject_code', 'PRICE_STALE'),
    jsonb_build_object('order_price', o.price, 'market_price', p_market, 'source', p_source));
END $$;

CREATE OR REPLACE FUNCTION jse__stale_orders(a jsonb, p_security integer, p_new_price numeric, p_source text)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_n integer := 0;
BEGIN
  FOR o IN SELECT * FROM orders WHERE security_id = p_security AND status = 'PIT_PENDING' AND price <> p_new_price ORDER BY id FOR UPDATE LOOP
    PERFORM jse__mark_stale(a, o, p_new_price, p_source);
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END $$;

CREATE OR REPLACE FUNCTION jse__set_price(a jsonb, p_security integer, p_new numeric, p_source text,
                                          p_news bigint DEFAULT NULL, p_previous numeric DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_stale integer := 0;
BEGIN
  SELECT * INTO s FROM securities WHERE id = p_security;
  IF p_new IS NULL OR p_new <= 0 THEN RAISE EXCEPTION 'JSE invariant: invalid price for %', s.symbol; END IF;
  UPDATE securities SET previous_price = coalesce(p_previous, price), price = p_new, updated_at = now(),
         last_price_change_at = CASE WHEN p_new <> s.price THEN clock_timestamp() ELSE last_price_change_at END
  WHERE id = s.id;
  IF p_new <> s.price THEN
    INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
    VALUES (s.id, s.price, p_new, jse_pct(p_new, s.price), p_source, p_news);
    v_stale := jse__stale_orders(a, s.id, p_new, p_source);
  END IF;
  UPDATE event_control SET market_updated_at = now() WHERE id = 1;
  RETURN v_stale;
END $$;

-- ---------------------------------------------------------------------------
-- Authentication (bcrypt via pgcrypto; opaque random session tokens, stored hashed)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_user_json(u app_users) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', u.id, 'username', u.username, 'name', u.display_name, 'email', u.email, 'role', u.role,
    'team_id', u.team_id, 'team', t.code, 'team_name', t.name,
    'team_broker', tb.code, 'team_broker_name', tb.name,
    'broker_id', u.broker_id, 'broker', b.code, 'broker_name', b.name,
    'institution_id', u.institution_id, 'institution', i.code,
    'must_change_password', u.must_change_password)
  FROM (SELECT 1) one
  LEFT JOIN teams t ON t.id = u.team_id
  LEFT JOIN brokers tb ON tb.id = t.broker_id
  LEFT JOIN brokers b ON b.id = u.broker_id
  LEFT JOIN institutions i ON i.id = u.institution_id
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
  INSERT INTO sessions(token_hash, user_id, expires_at, ip, user_agent, kind)
  VALUES (encode(digest(v_token, 'sha256'), 'hex'), u.id, now() + make_interval(hours => greatest(1, least(v_hours, 72))), p->>'ip', left(p->>'ua', 300), 'PASSWORD');
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
  RETURN jse_user_json(u) || jsonb_build_object('session', s.id::text, 'expires_at', s.expires_at, 'session_kind', s.kind);
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

-- First administrator password (and recovery). Database console only — no API route calls this.
--   SELECT jse_bootstrap_password('ADMIN');              -- random password, returned once
--   SELECT jse_bootstrap_password('ADMIN', 'my-own-pw'); -- chosen password (8+ characters)
-- The account must choose a new password at its next sign-in.
CREATE OR REPLACE FUNCTION jse_bootstrap_password(p_username text, p_password text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE u app_users%ROWTYPE; v_pw text := coalesce(nullif(p_password, ''), jse_random_password());
BEGIN
  SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p_username, ''))) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No account named %', p_username; END IF;
  IF length(v_pw) < 8 THEN RAISE EXCEPTION 'Use at least 8 characters'; END IF;
  UPDATE app_users SET password_hash = crypt(v_pw, gen_salt('bf', 8)), must_change_password = true, failed_logins = 0,
         locked_until = NULL, active = true, updated_at = now() WHERE id = u.id;
  UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL;
  PERFORM jse_audit('{"username":"DATABASE CONSOLE","role":"SYSTEM"}'::jsonb, 'PASSWORD_BOOTSTRAP', 'user', u.username, u.team_id,
                    NULL, NULL, NULL, NULL);
  RETURN v_pw;
END $$;

-- Session for automated tests on a staging deployment. The API calls this only when it runs with
-- CI_OIDC_REPOSITORY set and the caller presents a valid GitHub Actions OIDC token for that repository.
CREATE OR REPLACE FUNCTION jse_ci_session(p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE u app_users%ROWTYPE; v_token text; a jsonb;
BEGIN
  SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p->>'username', '')));
  IF NOT FOUND OR NOT u.active THEN PERFORM jse_fail('INVALID_CREDENTIALS', 'Unknown or disabled account.', 401); END IF;
  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO sessions(token_hash, user_id, expires_at, ip, user_agent, kind)
  VALUES (encode(digest(v_token, 'sha256'), 'hex'), u.id, now() + interval '6 hours', p->>'ip', left('CI ' || coalesce(p->>'subject', ''), 300), 'CI');
  a := jsonb_build_object('id', u.id, 'username', u.username, 'role', u.role, 'ip', p->>'ip', 'ua', p->>'ua');
  PERFORM jse_audit(a, 'CI_LOGIN', 'user', u.id::text, u.team_id, NULL, NULL, NULL,
                    jsonb_build_object('subject', p->>'subject', 'run_id', p->>'run_id', 'workflow', p->>'workflow'));
  RETURN jsonb_build_object('success', true, 'token', v_token, 'user', jse_user_json(u) || jsonb_build_object('session_kind', 'CI'));
END $$;

-- ---------------------------------------------------------------------------
-- Broker submission. Only the team's assigned broker (or an administrator) submits; participants never do.
-- The order is placed at the canonical market price — nobody chooses a price. No cash, holding or price change here.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_place_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_ins instructions%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer; v_expected numeric; v_rate numeric;
  v_tv numeric; v_brk numeric; v_amount numeric;
  v_id bigint; v_no text;
  v_existing bigint;
  v_avail record;
  v_free_cash numeric; v_room numeric;
  v_short boolean := false; v_shortfall boolean := false;
  v_warnings jsonb := '[]'::jsonb;
BEGIN
  IF a->>'role' = 'PARTICIPANT' THEN
    PERFORM jse_fail('PARTICIPANT_ENTRY_DISABLED',
      'Participants do not place exchange orders. Give your instruction to your assigned broker (or send it from My Orders); the broker submits the order.', 403);
  END IF;
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER');
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
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;

  -- an instruction from the participant can be submitted as it is (same team, security, side and quantity)
  IF nullif(p->>'instruction_id', '') IS NOT NULL OR nullif(p->>'instruction_no', '') IS NOT NULL THEN
    SELECT * INTO v_ins FROM instructions
    WHERE id = nullif(p->>'instruction_id', '')::bigint OR instruction_no = upper(trim(coalesce(p->>'instruction_no', '')))
    FOR UPDATE;
    IF NOT FOUND THEN PERFORM jse_fail('INSTRUCTION_NOT_FOUND', 'That participant instruction was not found.', 404); END IF;
    IF v_ins.status <> 'OPEN' THEN
      PERFORM jse_fail('INSTRUCTION_NOT_OPEN', v_ins.instruction_no || ' is ' || lower(v_ins.status) || ' and cannot be submitted again.', 409);
    END IF;
  END IF;

  SELECT * INTO v_team FROM teams
  WHERE (p ? 'team' AND code = upper(trim(p->>'team'))) OR (p ? 'team_id' AND id = nullif(p->>'team_id', '')::integer)
     OR (v_ins.id IS NOT NULL AND NOT (p ? 'team') AND NOT (p ? 'team_id') AND id = v_ins.team_id);
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Select one of your assigned teams.', 404); END IF;
  IF NOT v_team.active THEN PERFORM jse_fail('TEAM_INACTIVE', 'Team ' || v_team.code || ' is not active.', 409); END IF;
  IF v_team.broker_id IS NULL THEN
    PERFORM jse_fail('NO_BROKER', v_team.code || ' has no assigned broker yet. The Event Admin must assign one before it can trade.', 409);
  END IF;
  IF a->>'role' = 'BROKER' AND v_team.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
    PERFORM jse_fail('NOT_YOUR_TEAM', v_team.code || ' (' || v_team.name || ') is assigned to another broker. You can submit orders only for your own teams.', 403);
  END IF;

  -- KEY SHARE: a Market News price change on this security waits for this submission (and vice versa)
  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')))
     OR (v_ins.id IS NOT NULL AND NOT (p ? 'security_id') AND NOT (p ? 'symbol') AND id = v_ins.security_id)
  FOR KEY SHARE;
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid listed stock.', 404); END IF;
  IF v_sec.kind = 'IPO' AND v_sec.listed_at IS NULL THEN
    PERFORM jse_fail('IPO_NOT_LISTED', v_sec.symbol || ' is still in the IPO stage. It can be traded on the market only after it lists.', 409);
  END IF;

  IF v_side = '' AND v_ins.id IS NOT NULL THEN v_side := v_ins.side; END IF;
  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;

  BEGIN
    v_qty := coalesce(nullif(p->>'quantity', '')::integer, v_ins.quantity);
    v_expected := nullif(p->>'expected_price', '')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_NUMBER', 'Quantity must be a whole number of shares.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a positive number of shares.', 400); END IF;
  IF v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares (e.g. ' || v_sec.lot_size || ', ' || (2 * v_sec.lot_size) || ', ' || (3 * v_sec.lot_size) || ').', 400);
  END IF;
  IF v_ins.id IS NOT NULL AND (v_ins.team_id <> v_team.id OR v_ins.security_id <> v_sec.id OR v_ins.side <> v_side OR v_ins.quantity <> v_qty) THEN
    PERFORM jse_fail('INSTRUCTION_MISMATCH', 'The order must match ' || v_ins.instruction_no || ' (' || v_ins.side || ' ' || v_ins.quantity ||
      '). If the participant wants something different, decline it and ask for a new instruction.', 409);
  END IF;
  -- the broker's screen showed a price; if Market News moved it since, ask the broker to review (no silent re-quote)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'The market price of ' || v_sec.symbol || ' changed from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). Review the new value with the participant and submit again.';
  END IF;

  v_rate := cfg.brokerage_rate;
  v_tv := round(v_qty * v_sec.price, 2);
  v_brk := round(v_tv * v_rate, 2);
  v_amount := CASE WHEN v_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ' || jse_inr(cfg.min_order_value) || ' and ' || jse_inr(cfg.max_order_value) ||
      ' per order (this order: ' || jse_inr(v_tv) || ').', 400);
  END IF;

  -- risk checks (recorded and shown to the Pit Manager, Exchange and Bank; the Bank enforces them)
  IF v_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      v_short := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'SHORT_SELL', 'message',
        'Short selling is not allowed: ' || v_team.code || ' can sell only ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol ||
        ' shares (holding ' || v_avail.holding || ', already in open sell orders ' || v_avail.open_sell || '). The attempt has been recorded; the Bank will reject it unless the holding is sufficient.');
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    v_room := jse_loan_room(v_team.id);
    IF v_amount > v_free_cash + v_room THEN
      v_shortfall := true;
      v_warnings := v_warnings || jsonb_build_object('code', 'CASH_SHORTFALL', 'message',
        'Cash shortfall: this BUY needs ' || jse_inr(v_amount) || ' but ' || v_team.code || ' has ' || jse_inr(greatest(v_free_cash, 0)) ||
        ' free cash and ' || jse_inr(v_room) || ' of loan room. The attempt has been recorded; the Bank will reject it unless funds are available.');
    ELSIF v_amount > v_free_cash THEN
      v_warnings := v_warnings || jsonb_build_object('code', 'LOAN_NEEDED', 'message',
        'This BUY needs about ' || jse_inr(round(v_amount - greatest(v_free_cash, 0), 2)) || ' more than the free cash. The Bank will draw that amount as a loan at settlement (' ||
        jse_rate_text(cfg.loan_interest_rate) || ' interest).');
    END IF;
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'ORD-' || lpad(v_id::text, 6, '0');
  INSERT INTO orders(id, order_no, account_type, team_id, broker_id, security_id, side, quantity, price, trade_value, brokerage, brokerage_rate,
                     settlement_amount, reference_price, status, short_sell_flag, cash_shortfall_flag, notes, pair_ref, idempotency_key,
                     instruction_id, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'TEAM', v_team.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_sec.price, v_tv, v_brk, v_rate,
          v_amount, v_sec.price, 'PIT_PENDING', v_short, v_shortfall, left(p->>'notes', 300), left(p->>'pair_ref', 60), v_key,
          v_ins.id, nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  IF v_ins.id IS NOT NULL THEN
    UPDATE instructions SET status = 'SUBMITTED', order_id = v_id, handled_at = now(), handled_by_name = jse_actor_name(a) WHERE id = v_ins.id;
    PERFORM jse_order_event(v_id, 'INSTRUCTION_RECEIVED', NULL, NULL, jsonb_build_object('username', v_ins.created_by_name, 'role', 'PARTICIPANT'),
      v_ins.instruction_no || ': ' || v_ins.side || ' ' || v_ins.quantity || ' ' || v_sec.symbol, jsonb_build_object('at', v_ins.created_at));
  END IF;
  PERFORM jse_order_event(v_id, 'BROKER_SUBMITTED', NULL, 'PIT_PENDING', a, 'Submitted at the market price ' || jse_inr(v_sec.price),
    jsonb_build_object('price', v_sec.price, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'instruction_no', v_ins.instruction_no));
  PERFORM jse_audit(a, 'ORDER_SUBMITTED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'PIT_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_sec.price),
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'settlement_amount', v_amount,
                       'broker', (SELECT code FROM brokers WHERE id = v_team.broker_id), 'instruction_no', v_ins.instruction_no));

  IF v_short THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'SHORT_SELL_ATTEMPT', 'ORDER', v_side, v_qty, v_avail.holding, NULL, NULL,
                     'Open sell orders: ' || v_avail.open_sell);
    PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('quantity', v_qty, 'holding', v_avail.holding, 'open_sell', v_avail.open_sell, 'stage', 'ORDER'));
  END IF;
  IF v_shortfall THEN
    PERFORM jse_risk(v_team.id, v_id, v_sec.id, 'CASH_SHORTFALL_ATTEMPT', 'ORDER', v_side, v_qty, NULL, v_amount, greatest(v_free_cash, 0) + v_room, NULL);
    PERFORM jse_audit(a, 'CASH_SHORTFALL_ATTEMPT', 'order', v_no, v_team.id, v_id, NULL, NULL,
      jsonb_build_object('required', v_amount, 'available', v_free_cash, 'loan_room', v_room, 'stage', 'ORDER'));
  END IF;

  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Pit Manager: EXECUTE ORDER (creates the one official trading slip) or REJECT with a reason.
-- An order whose submitted price is no longer the market price is PRICE STALE and cannot be executed.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_pit_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'EXECUTE'));
  v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
  v_status text; v_sec_id integer; v_slip_id bigint; v_slip_no text;
  s securities%ROWTYPE; o orders%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER');
  IF v_action NOT IN ('EXECUTE', 'REJECT') THEN PERFORM jse_fail('INVALID_ACTION', 'Use EXECUTE or REJECT.', 400); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'The Pit Manager can execute orders only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT security_id INTO v_sec_id FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', '')));
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  -- lock order: security (KEY SHARE, blocks a concurrent price change) then the order
  SELECT * INTO s FROM securities WHERE id = v_sec_id FOR KEY SHARE;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', ''))) FOR UPDATE;
  IF o.status <> 'PIT_PENDING' THEN
    PERFORM jse_fail('ORDER_NOT_PENDING', o.order_no || CASE
      WHEN o.executed_at IS NOT NULL THEN ' was already executed by ' || coalesce(o.executed_by_name, 'a Pit Manager') || ' (slip ' || coalesce((SELECT slip_no FROM trading_slips WHERE order_id = o.id), '—') || ').'
      WHEN o.status = 'PIT_REJECTED' THEN ' was rejected: ' || coalesce(o.reject_reason, o.reject_code, 'rejected') ELSE
      ' is not waiting for the Pit Manager (status: ' || replace(o.status, '_', ' ') || ').' END, 409);
  END IF;

  IF v_action = 'REJECT' THEN
    IF v_reason IS NULL THEN PERFORM jse_fail('REASON_REQUIRED', 'Give the reason for rejecting ' || o.order_no || ' (the participant and broker see it).', 400); END IF;
    UPDATE orders SET status = 'PIT_REJECTED', reject_code = 'PIT_REJECTED', reject_reason = v_reason, pit_note = v_reason,
           pit_by = nullif(a->>'id', '')::integer, pit_by_name = jse_actor_name(a), pit_at = now(), updated_at = now()
    WHERE id = o.id;
    PERFORM jse_order_event(o.id, 'PIT_REJECTED', 'PIT_PENDING', 'PIT_REJECTED', a, v_reason, NULL);
    PERFORM jse_audit(a, 'PIT_REJECTED', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'PIT_PENDING'),
                      jsonb_build_object('status', 'PIT_REJECTED'), jsonb_build_object('reason', v_reason));
    RETURN jsonb_build_object('success', true, 'status', 'PIT_REJECTED', 'order', jse_order_json(o.id));
  END IF;

  -- EXECUTE
  IF o.price <> s.price THEN
    PERFORM jse__mark_stale(a, o, s.price, 'PRICE_CHECK_AT_EXECUTION');
    RETURN jsonb_build_object('success', false, 'http', 409, 'code', 'PRICE_STALE',
      'error', o.order_no || ' is PRICE STALE: it was submitted at ' || jse_inr(o.price) || ' but the market price is now ' || jse_inr(s.price) ||
               '. It cannot be executed; the broker must submit a fresh order at the new market price.',
      'order', jse_order_json(o.id));
  END IF;
  IF NOT s.active THEN PERFORM jse_fail('SECURITY_INACTIVE', s.symbol || ' is not tradable.', 409); END IF;
  IF s.kind = 'IPO' AND s.listed_at IS NULL THEN PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' has not listed yet.', 409); END IF;

  UPDATE orders SET status = 'EXCHANGE_PENDING', executed_at = clock_timestamp(), executed_by = nullif(a->>'id', '')::integer,
         executed_by_name = jse_actor_name(a), executed_price = o.price, executed_quantity = o.quantity,
         pit_by = nullif(a->>'id', '')::integer, pit_by_name = jse_actor_name(a), pit_at = clock_timestamp(), pit_note = v_reason,
         updated_at = now()
  WHERE id = o.id;
  v_slip_id := nextval(pg_get_serial_sequence('trading_slips', 'id'));
  v_slip_no := 'TS-' || lpad(v_slip_id::text, 6, '0');
  INSERT INTO trading_slips(id, slip_no, order_id, issued_at, issued_by, issued_by_name)
  VALUES (v_slip_id, v_slip_no, o.id, clock_timestamp(), nullif(a->>'id', '')::integer, jse_actor_name(a));
  PERFORM jse_order_event(o.id, 'PIT_EXECUTED', 'PIT_PENDING', 'EXCHANGE_PENDING', a,
    'Executed ' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' · trading slip ' || v_slip_no,
    jsonb_build_object('slip_no', v_slip_no, 'price', o.price, 'quantity', o.quantity, 'trade_value', o.trade_value, 'brokerage', o.brokerage));
  PERFORM jse_audit(a, 'PIT_EXECUTED', 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', 'PIT_PENDING'),
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'executed_price', o.price, 'executed_quantity', o.quantity),
    jsonb_build_object('slip_no', v_slip_no, 'symbol', s.symbol, 'side', o.side, 'trade_value', o.trade_value, 'brokerage', o.brokerage));
  RETURN jsonb_build_object('success', true, 'status', 'EXCHANGE_PENDING', 'slip_no', v_slip_no, 'order', jse_order_json(o.id));
END $$;

-- ---------------------------------------------------------------------------
-- Exchange review of executed orders. Never changes cash, holdings or prices.
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
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'PIT_PENDING' THEN
    PERFORM jse_fail('NOT_EXECUTED', o.order_no || ' has not been executed by the Pit Manager yet.', 409);
  END IF;
  IF o.status <> 'EXCHANGE_PENDING' THEN
    PERFORM jse_fail('ORDER_NOT_PENDING', o.order_no || ' is no longer pending at the Exchange (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  IF v_action = 'REJECT' AND v_reason IS NULL THEN v_reason := 'Rejected by Exchange'; END IF;

  IF v_action = 'APPROVE' THEN
    IF o.account_type = 'TEAM' AND o.side = 'SELL' THEN
      SELECT * INTO v_avail FROM jse_available_qty(o.team_id, o.security_id, o.id);
      IF o.quantity > v_avail.available THEN
        IF NOT v_confirm THEN
          RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_CONFIRM_REQUIRED', HINT = '409',
            MESSAGE = 'Short-selling warning: the team can sell only ' || greatest(v_avail.available, 0) || ' shares (holding ' || v_avail.holding ||
                      '). Short selling is not permitted; forwarding it is recorded and the Bank will reject it unless holdings are sufficient.';
        END IF;
        UPDATE orders SET short_sell_flag = true, short_sell_approved = true WHERE id = o.id;
        PERFORM jse_risk(o.team_id, o.id, o.security_id, 'SHORT_SELL_ATTEMPT', 'EXCHANGE', o.side, o.quantity, v_avail.holding, NULL, NULL, NULL);
        PERFORM jse_audit(a, 'SHORT_SELLING_FORWARDED', 'order', o.order_no, o.team_id, o.id, NULL, NULL,
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
         reject_reason = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN v_reason ELSE NULL END,
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
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || replace(o.status, '_', ' ') || ').', 409);
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
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' THEN PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' is already settled and cannot be rejected.', 409); END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  RETURN jse__bank_reject(a, o, 'BANK_REJECTED_BY_OPERATOR', coalesce(v_reason, 'Rejected by Bank'), '{}'::jsonb);
END $$;

-- ---------------------------------------------------------------------------
-- Bank settlement: the only place where a trade changes cash and holdings. It never changes the market price.
-- Idempotent: an order can have at most one active settlement (unique index) and the status transition
-- happens under the order row lock.
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
  v_tv numeric; v_brk numeric; v_rate numeric; v_req numeric;
  v_cash numeric; v_cash_after numeric;
  v_draw numeric := 0; v_interest numeric := 0; v_room numeric;
  v_cost_moved numeric := 0; v_tcost_moved numeric := 0; v_icost_moved numeric := 0;
  v_realized numeric := 0;
  v_inst_before numeric; v_inst_after numeric;
  v_settle_id bigint;
  v_bal numeric;
  v_team_delta numeric;
  v_hold_after integer;
  v_note text;
  v_team_buys boolean;
BEGIN
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF o.status = 'BANK_SETTLED' OR EXISTS (SELECT 1 FROM settlements WHERE order_id = o.id AND reversed_at IS NULL) THEN
    PERFORM jse_fail('ALREADY_SETTLED', o.order_no || ' has already been settled. Duplicate settlement blocked.', 409);
  END IF;
  IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN
    PERFORM jse_fail('NOT_AWAITING_BANK', o.order_no || ' is not waiting for the Bank (status: ' || replace(o.status, '_', ' ') || ').', 409);
  END IF;
  IF o.status = 'BANK_PENDING' AND o.bank_claimed_by IS NOT NULL AND o.bank_claimed_by IS DISTINCT FROM nullif(a->>'id', '')::integer
     AND o.bank_claimed_at > now() - interval '2 minutes' AND p_source = 'BANK' THEN
    PERFORM jse_fail('ALREADY_CLAIMED', o.order_no || ' is being verified by ' || coalesce(o.bank_claimed_name, 'another bank operator') || '.', 409);
  END IF;

  -- lock order: security -> team -> loan -> holdings -> institution
  SELECT * INTO s FROM securities WHERE id = o.security_id FOR NO KEY UPDATE;
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

  -- independent re-validation (never trust earlier desks alone)
  IF NOT t.active THEN RETURN jse__bank_reject(a, o, 'TEAM_INACTIVE', 'Team ' || t.code || ' is not active.', '{}'::jsonb); END IF;
  IF NOT s.active THEN RETURN jse__bank_reject(a, o, 'SECURITY_INACTIVE', s.symbol || ' is not tradable.', '{}'::jsonb); END IF;
  IF o.quantity <= 0 OR o.quantity % s.lot_size <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_LOT', 'Quantity must be a multiple of ' || s.lot_size || '.', '{}'::jsonb);
  END IF;
  IF o.price <= 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_PRICE', 'Invalid order price.', '{}'::jsonb);
  END IF;
  v_tv := round(o.quantity * o.price, 2);
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    RETURN jse__bank_reject(a, o, 'ORDER_VALUE_LIMIT', 'Order value ' || jse_inr(v_tv) || ' is outside the allowed ' || jse_inr(cfg.min_order_value) || ' to ' || jse_inr(cfg.max_order_value) || '.', '{}'::jsonb);
  END IF;
  -- the brokerage rate is fixed on the order when the broker submits it (shown on the trading slip)
  v_rate := coalesce(o.brokerage_rate, CASE WHEN o.account_type = 'TEAM' OR cfg.institution_brokerage THEN cfg.brokerage_rate ELSE 0 END);
  v_brk := round(v_tv * v_rate, 2);

  v_cash := t.cash;
  v_team_buys := (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL');

  IF v_team_buys THEN
    IF o.account_type = 'INSTITUTION' AND v_ihold < o.quantity THEN
      RETURN jse__bank_reject(a, o, 'INSTITUTION_INSUFFICIENT_HOLDINGS', 'The institution holds only ' || v_ihold || ' ' || s.symbol || ' shares.',
        jsonb_build_object('holding', v_ihold, 'quantity', o.quantity));
    END IF;
    v_req := v_tv + v_brk;
    IF v_cash < v_req THEN
      -- own money first: only the shortfall is borrowed, automatically, within the loan limit
      v_room := CASE WHEN cfg.loans_enabled THEN greatest(0, cfg.loan_max_principal - ln.original_principal) ELSE 0 END;
      v_draw := v_req - v_cash;
      IF NOT (cfg.loans_enabled AND cfg.auto_loan_on_settlement) OR v_draw > v_room THEN
        IF o.account_type = 'TEAM' THEN
          PERFORM jse_risk(t.id, o.id, s.id, 'INSUFFICIENT_BALANCE_REJECTION', 'BANK', o.side, o.quantity, v_hold, v_req, v_cash,
                           'Loan room ' || jse_inr(v_room));
          PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_REJECTED', 'order', o.order_no, t.id, o.id, NULL, NULL,
            jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room));
        END IF;
        RETURN jse__bank_reject(a, o, 'INSUFFICIENT_BALANCE',
          'Insufficient balance: ' || jse_inr(v_req) || ' is needed but ' || t.code || ' has ' || jse_inr(v_cash) ||
          CASE WHEN cfg.loans_enabled AND cfg.auto_loan_on_settlement THEN ' plus ' || jse_inr(v_room) || ' of loan room' ELSE '' END || '.',
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room));
      END IF;
      v_interest := round(v_draw * cfg.loan_interest_rate, 2);
    END IF;
  ELSE
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
      RETURN jse__bank_reject(a, o, 'INSTITUTION_INSUFFICIENT_FUNDS', 'The institution has only ' || jse_inr(inst.cash) || ' available.',
        jsonb_build_object('cash', inst.cash, 'required', v_tv));
    END IF;
  END IF;

  -- ===== all checks passed: apply =====
  INSERT INTO settlements(order_id, account_type, team_id, institution_id, security_id, side, quantity, price, trade_value, brokerage,
                          team_cash_delta, team_cash_before, team_cash_after, holding_before, holding_after,
                          price_before, price_after, previous_price_before, settled_by, settled_by_name)
  VALUES (o.id, o.account_type, t.id, o.institution_id, s.id, o.side, o.quantity, o.price, v_tv, v_brk,
          0, v_cash, v_cash, v_hold, v_hold, s.price, s.price, s.previous_price,
          nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_settle_id;

  v_bal := v_cash;
  IF v_team_buys THEN
    IF v_draw > 0 THEN
      v_bal := v_bal + v_draw;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'LOAN_DRAW', 0, v_draw, v_bal,
        'Automatic loan draw for the cash shortfall on ' || o.order_no, a);
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'INTEREST_CHARGE', 0, 0, v_bal,
        'Loan interest charged ' || jse_inr(v_interest) || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on ' || jse_inr(v_draw) || ') — added to the loan balance, no cash moved', a);
      UPDATE loans SET original_principal = original_principal + v_draw, principal_outstanding = principal_outstanding + v_draw,
             interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
             draws = draws + 1, status = 'OUTSTANDING', updated_at = now()
      WHERE team_id = t.id;
      INSERT INTO loan_transactions(team_id, kind, amount, order_id, settlement_id, automatic, note, actor_id, actor_name)
      VALUES (t.id, 'DRAW', v_draw, o.id, v_settle_id, true, 'Automatic draw at settlement of ' || o.order_no, nullif(a->>'id', '')::integer, jse_actor_name(a)),
             (t.id, 'INTEREST_CHARGE', v_interest, o.id, v_settle_id, true, jse_rate_text(cfg.loan_interest_rate) || ' interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
      PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, o.id, NULL, NULL,
        jsonb_build_object('amount', v_draw, 'interest', v_interest, 'automatic', true, 'order_no', o.order_no));
    END IF;
    v_bal := v_bal - v_tv;
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Bought ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' from ' || inst.code
                   ELSE 'Bought ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BUY', v_tv, 0, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || jse_rate_text(v_rate) || ' on ' || o.order_no, a);
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
        'Sold ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' to ' || t.code, a);
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
    v_note := CASE WHEN o.account_type = 'INSTITUTION' THEN 'Sold ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' to ' || inst.code
                   ELSE 'Sold ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) END;
    PERFORM jse_ledger(t.id, o.id, v_settle_id, 'SELL', 0, v_tv, v_bal, v_note, a);
    IF v_brk > 0 THEN
      v_bal := v_bal - v_brk;
      PERFORM jse_ledger(t.id, o.id, v_settle_id, 'BROKERAGE', v_brk, 0, v_bal, 'Brokerage ' || jse_rate_text(v_rate) || ' on ' || o.order_no, a);
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
        'Bought ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ' from ' || t.code, a);
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
    VALUES (o.id, v_settle_id, o.broker_id, t.id, o.side, v_tv, v_rate, v_brk);
  END IF;

  -- trade statistics only: settlement never changes the market price (Market News is the only price engine)
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;

  UPDATE settlements SET brokerage = v_brk, team_cash_delta = v_team_delta, team_cash_after = v_cash_after, holding_after = v_hold_after,
         cost_moved = v_cost_moved, trade_cost_moved = v_tcost_moved, inst_cost_moved = v_icost_moved, realized_pnl = v_realized,
         loan_drawn = v_draw, loan_interest = v_interest, institution_cash_before = v_inst_before, institution_cash_after = v_inst_after
  WHERE id = v_settle_id;

  UPDATE orders SET status = 'BANK_SETTLED',
         bank_by = nullif(a->>'id', '')::integer, bank_by_name = jse_actor_name(a), bank_at = now(),
         bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL,
         reject_code = NULL, reject_reason = NULL, updated_at = now()
  WHERE id = o.id;

  PERFORM jse_order_event(o.id, 'BANK_SETTLED', o.status, 'BANK_SETTLED', a, NULL,
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
                       'loan_drawn', v_draw, 'loan_interest', v_interest));
  PERFORM jse_order_event(o.id, 'HOLDINGS_UPDATED', 'BANK_SETTLED', 'BANK_SETTLED', a,
    t.code || ' cash ' || jse_inr(v_cash) || ' → ' || jse_inr(v_cash_after) || '; ' || s.symbol || ' holding ' || v_hold || ' → ' || v_hold_after ||
    '; market price unchanged at ' || jse_inr(s.price) || ' (prices move only on Market News)',
    jsonb_build_object('holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price));
  PERFORM jse_audit(a, 'BANK_SETTLED', 'order', o.order_no, t.id, o.id,
    jsonb_build_object('status', o.status, 'cash', v_cash, 'holding', v_hold),
    jsonb_build_object('status', 'BANK_SETTLED', 'cash', v_cash_after, 'holding', v_hold_after),
    jsonb_build_object('account_type', o.account_type, 'side', o.side, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate,
                       'loan_drawn', v_draw, 'interest', v_interest, 'realized_pnl', v_realized, 'market_price', s.price, 'source', p_source));
  PERFORM jse_journal('BANK_SETTLE', v_settle_id, o.order_no || ' settled (' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ')',
                      jsonb_build_object('order_id', o.id, 'settlement_id', v_settle_id), a);

  RETURN jsonb_build_object('success', true, 'status', 'BANK_SETTLED', 'settlement_id', v_settle_id,
    'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
    'loan_drawn', v_draw, 'loan_interest', v_interest, 'realized_pnl', v_realized,
    'holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price, 'order', jse_order_json(o.id));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_settle(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  RETURN jse__settle(a, nullif(p->>'order_id', '')::bigint, 'BANK');
END $$;

-- Paired buyer/seller ticket: two linked orders created atomically (both or neither); each leg follows
-- the normal broker rules (assigned teams only, market price).
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
