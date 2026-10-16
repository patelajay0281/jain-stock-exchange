-- 030: owner-requested market-price, negotiated pair and award-eligibility corrections.
-- Apply through a prepared Neon migration after staging verification; do not run against live traffic.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS negotiated_trade boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION jse_inst_spread_pct() RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT 0.00::numeric $$;
CREATE OR REPLACE FUNCTION jse_inst_price(p_market numeric, p_inst_side text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT round(p_market, 2) $$;

CREATE OR REPLACE FUNCTION jse_place_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_ins instructions%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer; v_expected numeric; v_rate numeric; v_price numeric; v_negotiated_price numeric;
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
      'Participant self entry is disabled. Your broker creates the order for your team.', 403);
  END IF;
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PIT_MANAGER');
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
    v_negotiated_price := nullif(p->>'negotiated_price', '')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_NUMBER', 'Quantity must be a whole number of shares.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 THEN PERFORM jse_fail('INVALID_QUANTITY', 'Quantity must be a positive number of shares.', 400); END IF;
  IF v_qty % 50 <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' normal market trading uses multiples of 50 shares (50, 100, 150 …).', 400);
  END IF;
  IF v_ins.id IS NOT NULL AND (v_ins.team_id <> v_team.id OR v_ins.security_id <> v_sec.id OR v_ins.side <> v_side OR v_ins.quantity <> v_qty) THEN
    PERFORM jse_fail('INSTRUCTION_MISMATCH', 'The order must match ' || v_ins.instruction_no || ' (' || v_ins.side || ' ' || v_ins.quantity ||
      '). If the participant wants something different, decline it and ask for a new instruction.', 409);
  END IF;
  -- the broker's screen showed a price; if Market News moved it since, ask the broker to review (no silent re-quote)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The order was not submitted — review the new value with the participant and submit again.';
  END IF;

  IF v_negotiated_price IS NOT NULL THEN
    IF a->>'role' NOT IN ('PIT_MANAGER','ADMIN') THEN PERFORM jse_fail('NEGOTIATED_PRICE_ROLE', 'Only a Pit Manager or Admin may record a negotiated team-to-team price.', 403); END IF;
    IF nullif(p->>'pair_ref','') IS NULL THEN PERFORM jse_fail('NEGOTIATED_PAIR_REQUIRED', 'A negotiated price must be submitted as a paired BUY/SELL trade between two different teams.', 400); END IF;
    IF v_negotiated_price <= 0 OR v_negotiated_price <> trunc(v_negotiated_price) THEN PERFORM jse_fail('INVALID_NEGOTIATED_PRICE', 'Negotiated price must be a positive whole number of rupees.', 400); END IF;
    v_price := v_negotiated_price;
  ELSE
    v_price := v_sec.price;
  END IF;
  v_rate := cfg.brokerage_rate;
  v_tv := round(v_qty * v_price, 2);
  v_brk := round(v_tv * v_rate, 2);
  v_amount := CASE WHEN v_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ' || jse_inr(cfg.min_order_value) || ' and ' || jse_inr(cfg.max_order_value) ||
      ' per order (this order: ' || jse_inr(v_tv) || ').', 400);
  END IF;

  -- P0 financial safety (v3.14): one team's orders are serialised by locking the team row, so two desks cannot sell the
  -- same shares or commit the same cash twice. Short selling and buying beyond free cash are refused here (and again at the Bank).
  PERFORM 1 FROM teams WHERE id = v_team.id FOR UPDATE;
  IF v_price <> trunc(v_price) THEN
    PERFORM jse_fail('PRICE_NOT_WHOLE', v_sec.symbol || ' price must be whole rupees. Ask the Event Admin to correct the price.', 409);
  END IF;
  IF v_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_NOT_ALLOWED', HINT = '409',
        MESSAGE = 'Short selling is not allowed. You can sell only the shares available in your portfolio. Please reduce the quantity or check your holdings. (' ||
                  v_team.code || ' can sell ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol || ': holding ' || v_avail.holding || ', in open sell orders ' || v_avail.open_sell || ')';
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    IF v_amount > v_free_cash THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSUFFICIENT_BALANCE', HINT = '409',
        MESSAGE = 'Insufficient balance! Your available cash is ' || jse_inr(greatest(v_free_cash, 0)) || ', but this order requires ' || jse_inr(v_amount) ||
                  ', including applicable charges. Please reduce the order quantity or obtain an approved loan before placing this order.';
    END IF;
    PERFORM jse_check_company_limit(v_team.id, v_sec.id, v_amount, NULL);
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'ORD-' || v_id::text;
  INSERT INTO orders(id, order_no, account_type, team_id, broker_id, security_id, side, quantity, price, trade_value, brokerage, brokerage_rate,
                     settlement_amount, reference_price, status, negotiated_trade, short_sell_flag, cash_shortfall_flag, notes, pair_ref, idempotency_key,
                     instruction_id, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'TEAM', v_team.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk, v_rate,
          v_amount, v_sec.price, 'EXCHANGE_PENDING', (v_negotiated_price IS NOT NULL), v_short, v_shortfall, left(p->>'notes', 300), left(p->>'pair_ref', 60), v_key,
          v_ins.id, nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  IF v_ins.id IS NOT NULL THEN
    UPDATE instructions SET status = 'SUBMITTED', order_id = v_id, handled_at = now(), handled_by_name = jse_actor_name(a) WHERE id = v_ins.id;
    PERFORM jse_order_event(v_id, 'INSTRUCTION_RECEIVED', NULL, NULL, jsonb_build_object('username', v_ins.created_by_name, 'role', 'PARTICIPANT'),
      v_ins.instruction_no || ': ' || v_ins.side || ' ' || v_ins.quantity || ' ' || v_sec.symbol, jsonb_build_object('at', v_ins.created_at));
  END IF;
  PERFORM jse_order_event(v_id, 'ORDER_CREATED', NULL, 'EXCHANGE_PENDING', a, 'Order created at the market price ' || jse_inr(v_sec.price),
    jsonb_build_object('price', v_sec.price, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'instruction_no', v_ins.instruction_no));
  PERFORM jse_audit(a, 'ORDER_CREATED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_sec.price),
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

CREATE OR REPLACE FUNCTION jse_place_pair(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  legs jsonb := p->'legs';
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_pair text; r1 jsonb; r2 jsonb; v_sym1 text; v_sym2 text; v_q1 integer; v_q2 integer; v_p1 numeric; v_p2 numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PIT_MANAGER');
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
  v_sym1 := coalesce(upper(trim(legs->0->>'symbol')), nullif(legs->0->>'security_id',''));
  v_sym2 := coalesce(upper(trim(legs->1->>'symbol')), nullif(legs->1->>'security_id',''));
  v_q1 := nullif(legs->0->>'quantity','')::integer; v_q2 := nullif(legs->1->>'quantity','')::integer;
  v_p1 := nullif(legs->0->>'negotiated_price','')::numeric; v_p2 := nullif(legs->1->>'negotiated_price','')::numeric;
  IF v_sym1 IS DISTINCT FROM v_sym2 OR v_q1 IS NULL OR v_q1 <> v_q2 THEN
    PERFORM jse_fail('INVALID_PAIR', 'Both sides of a negotiated trade must use the same security and share quantity.', 400);
  END IF;
  IF v_p1 IS DISTINCT FROM v_p2 THEN PERFORM jse_fail('INVALID_PAIR', 'Both sides must use the same agreed negotiated price.', 400); END IF;
  IF v_p1 IS NOT NULL AND a->>'role' NOT IN ('PIT_MANAGER','ADMIN') THEN PERFORM jse_fail('NEGOTIATED_PRICE_ROLE', 'Only a Pit Manager or Admin may record a negotiated price.', 403); END IF;
  v_pair := 'PAIR-' || upper(substr(md5(v_key), 1, 8));
  r1 := jse_place_order(a, (legs->0) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':0'));
  r2 := jse_place_order(a, (legs->1) || jsonb_build_object('pair_ref', v_pair, 'idempotency_key', v_key || ':1'));
  RETURN jsonb_build_object('success', true, 'pair_ref', v_pair, 'legs', jsonb_build_array(r1, r2));
END $$;

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
  v_pair_total integer := 0; v_pair_settled integer := 0;
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
  -- institutions are transaction-based counterparties: no cash or holdings restriction and no portfolio;
  -- the institution ledger only records each settled transaction (running net settlement flow)
  IF o.account_type = 'INSTITUTION' THEN
    SELECT * INTO inst FROM institutions WHERE id = o.institution_id FOR UPDATE;
  END IF;

  -- independent re-validation (never trust earlier desks alone)
  IF coalesce(o.reference_price, o.price) <> s.price AND p_source = 'BANK' THEN
    RETURN jse__bank_reject(a, o, 'PRICE_STALE', 'MARKET PRICE CHANGED: ' || o.order_no || ' was created at the market price ' || jse_inr(coalesce(o.reference_price, o.price)) ||
      ' but the market price is now ' || jse_inr(s.price) || '. It is not settled at an obsolete price — create a fresh order.', jsonb_build_object('market_price', s.price));
  END IF;
  IF NOT t.active THEN RETURN jse__bank_reject(a, o, 'TEAM_INACTIVE', 'Team ' || t.code || ' is not active.', '{}'::jsonb); END IF;
  IF NOT s.active THEN RETURN jse__bank_reject(a, o, 'SECURITY_INACTIVE', s.symbol || ' is not tradable.', '{}'::jsonb); END IF;
  IF o.quantity <= 0 OR o.quantity % 50 <> 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_LOT', 'Normal market trading requires a multiple of 50 shares.', '{}'::jsonb);
  END IF;
  IF o.price <= 0 THEN
    RETURN jse__bank_reject(a, o, 'INVALID_PRICE', 'Invalid order price.', '{}'::jsonb);
  END IF;
  v_tv := round(o.quantity * o.price, 2);
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    RETURN jse__bank_reject(a, o, 'ORDER_VALUE_LIMIT', 'Order value ' || jse_inr(v_tv) || ' is outside the allowed ' || jse_inr(cfg.min_order_value) || ' to ' || jse_inr(cfg.max_order_value) || '.', '{}'::jsonb);
  END IF;
  -- the brokerage rate is fixed on the order when it is created. The participant team
  -- pays it on every trade, including trades with an institutional counterparty; its broker earns the commission.
  v_rate := coalesce(o.brokerage_rate, cfg.brokerage_rate);
  v_brk := round(v_tv * v_rate, 2);

  v_cash := t.cash;
  v_team_buys := jse_team_side(o.account_type, o.side) = 'BUY';

  IF v_team_buys THEN
    v_req := v_tv + v_brk;
    IF o.account_type = 'TEAM' THEN
      BEGIN
        PERFORM jse_check_company_limit(t.id, s.id, v_req, o.id);
      EXCEPTION WHEN SQLSTATE 'JSE01' THEN
        RETURN jse__bank_reject(a, o, 'COMPANY_LIMIT', SQLERRM, '{}'::jsonb);
      END;
    END IF;
    IF v_cash < v_req THEN
      -- own money first: only the shortfall is borrowed, automatically, within the loan limit
      v_room := CASE WHEN cfg.loans_enabled THEN greatest(0, cfg.loan_max_principal - ln.original_principal) ELSE 0 END;
      v_draw := v_req - v_cash;
      IF NOT (cfg.loans_enabled AND cfg.auto_loan_on_settlement) OR v_draw > v_room THEN
        PERFORM jse_risk(t.id, o.id, s.id, 'INSUFFICIENT_BALANCE_REJECTION', 'BANK', 'BUY', o.quantity, v_hold, v_req, v_cash,
                         'Loan room ' || jse_inr(v_room));
        PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_REJECTED', 'order', o.order_no, t.id, o.id, NULL, NULL,
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room, 'account_type', o.account_type));
        RETURN jse__bank_reject(a, o, 'INSUFFICIENT_BALANCE',
          'Insufficient balance: ' || jse_inr(v_req) || ' is needed but ' || t.code || ' has ' || jse_inr(v_cash) ||
          CASE WHEN cfg.loans_enabled AND cfg.auto_loan_on_settlement THEN ' plus ' || jse_inr(v_room) || ' of loan room' ELSE '' END || '.',
          jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_room', v_room));
      END IF;
      v_interest := round(v_draw * cfg.loan_interest_rate, 2);
    END IF;
  ELSE
    IF v_hold < o.quantity THEN
      PERFORM jse_risk(t.id, o.id, s.id, 'SHORT_SELL_ATTEMPT', 'BANK', 'SELL', o.quantity, v_hold, NULL, NULL, 'Rejected at Bank');
      PERFORM jse_audit(a, 'SHORT_SELLING_ATTEMPT', 'order', o.order_no, t.id, o.id, NULL, NULL,
        jsonb_build_object('quantity', o.quantity, 'holding', v_hold, 'stage', 'BANK', 'exchange_approved', coalesce(o.short_sell_approved, false),
                           'account_type', o.account_type));
      RETURN jse__bank_reject(a, o, 'SHORT_SELLING_NOT_ALLOWED',
        'Short selling is not allowed: ' || t.code || ' holds ' || v_hold || ' ' || s.symbol || ' shares but the order sells ' || o.quantity || '.',
        jsonb_build_object('holding', v_hold, 'quantity', o.quantity));
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
      PERFORM jse_audit(a, 'INSUFFICIENT_BALANCE_SETTLED', 'order', o.order_no, t.id, o.id, NULL, NULL,
        jsonb_build_object('required', v_req, 'cash', v_cash, 'loan_drawn', v_draw, 'interest', v_interest, 'symbol', s.symbol,
                           'account_type', o.account_type));
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

  -- the team's broker earns the brokerage on every settled trade of its team (institutional counterparty trades too);
  -- the commission register records the team's side of the trade
  IF v_brk > 0 AND o.broker_id IS NOT NULL THEN
    INSERT INTO broker_commissions(order_id, settlement_id, broker_id, team_id, side, trade_value, rate, amount)
    VALUES (o.id, v_settle_id, o.broker_id, t.id, jse_team_side(o.account_type, o.side), v_tv, v_rate, v_brk);
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

  -- A negotiated pair updates the public market price only after BOTH matched legs settle successfully.
  IF o.negotiated_trade AND o.pair_ref IS NOT NULL THEN
    SELECT count(*), count(*) FILTER (WHERE status = 'BANK_SETTLED')
      INTO v_pair_total, v_pair_settled
      FROM orders WHERE pair_ref = o.pair_ref AND negotiated_trade AND security_id = o.security_id AND price = o.price;
    IF v_pair_total = 2 AND v_pair_settled = 2 THEN
      PERFORM jse__set_price(a, s.id, o.price, 'NEGOTIATED_TRADE', NULL, s.price);
      UPDATE settlements SET price_after = o.price WHERE order_id IN (SELECT id FROM orders WHERE pair_ref = o.pair_ref AND negotiated_trade);
      s.price := o.price;
    END IF;
  END IF;

  PERFORM jse_order_event(o.id, 'BANK_SETTLED', o.status, 'BANK_SETTLED', a, NULL,
    jsonb_build_object('trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
                       'loan_drawn', v_draw, 'loan_interest', v_interest));
  PERFORM jse_order_event(o.id, 'HOLDINGS_UPDATED', 'BANK_SETTLED', 'BANK_SETTLED', a,
    t.code || ' cash ' || jse_inr(v_cash) || ' → ' || jse_inr(v_cash_after) || '; ' || s.symbol || ' holding ' || v_hold || ' → ' || v_hold_after ||
    '; market price ' || CASE WHEN o.negotiated_trade AND v_pair_total = 2 AND v_pair_settled = 2 THEN 'updated to negotiated trade price ' ELSE 'unchanged at ' END || jse_inr(s.price),
    jsonb_build_object('holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price));
  PERFORM jse_audit(a, 'BANK_SETTLED', 'order', o.order_no, t.id, o.id,
    jsonb_build_object('status', o.status, 'cash', v_cash, 'holding', v_hold),
    jsonb_build_object('status', 'BANK_SETTLED', 'cash', v_cash_after, 'holding', v_hold_after),
    jsonb_build_object('account_type', o.account_type, 'side', o.side, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate,
                       'loan_drawn', v_draw, 'interest', v_interest, 'realized_pnl', v_realized, 'market_price', s.price, 'negotiated_trade', o.negotiated_trade, 'pair_ref', o.pair_ref, 'source', p_source));
  PERFORM jse_journal('BANK_SETTLE', v_settle_id, o.order_no || ' settled (' || o.side || ' ' || o.quantity || ' ' || s.symbol || ' @ ' || jse_inr(o.price) || ')',
                      jsonb_build_object('order_id', o.id, 'settlement_id', v_settle_id), a);

  RETURN jsonb_build_object('success', true, 'status', 'BANK_SETTLED', 'settlement_id', v_settle_id,
    'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'cash_before', v_cash, 'cash_after', v_cash_after,
    'loan_drawn', v_draw, 'loan_interest', v_interest, 'realized_pnl', v_realized,
    'holding_before', v_hold, 'holding_after', v_hold_after, 'market_price', s.price, 'order', jse_order_json(o.id));
END $$;

CREATE OR REPLACE FUNCTION jse_place_institutional_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_inst institutions%ROWTYPE;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer; v_expected numeric; v_tv numeric; v_brk numeric := 0; v_rate numeric := 0;
  v_price numeric; v_amount numeric; v_team_side text;
  v_id bigint; v_no text; v_existing bigint;
  v_warnings jsonb := '[]'::jsonb;
  v_avail record; v_free_cash numeric; v_room numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL');
  IF v_key IS NULL OR length(v_key) > 120 THEN
    PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Order submission is missing its request key. Reload the page and try again.', 400);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-order:' || v_key, 0));
  SELECT id INTO v_existing FROM orders WHERE idempotency_key = v_key;
  IF FOUND THEN RETURN jsonb_build_object('success', true, 'replayed', true, 'order', jse_order_json(v_existing), 'warnings', '[]'::jsonb); END IF;

  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO v_inst FROM institutions
  WHERE id = coalesce(CASE WHEN a->>'role' = 'ADMIN' THEN nullif(p->>'institution_id', '')::integer END,
                      nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(p->>'counterparty_team', p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('COUNTERPARTY_REQUIRED', 'Select the counterparty participant team.', 400); END IF;
  IF NOT v_team.active THEN PERFORM jse_fail('TEAM_INACTIVE', 'Team ' || v_team.code || ' is not active.', 409); END IF;
  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')))
  FOR KEY SHARE;
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid listed stock.', 404); END IF;
  IF v_sec.kind = 'IPO' AND v_sec.listed_at IS NULL THEN
    PERFORM jse_fail('IPO_NOT_LISTED', v_sec.symbol || ' is still in the IPO stage and cannot be traded yet.', 409);
  END IF;
  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;
  BEGIN
    v_qty := (p->>'quantity')::integer; v_expected := nullif(p->>'expected_price', '')::numeric;
  EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_NUMBER', 'Quantity must be a whole number of shares.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 OR v_qty % 50 <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' normal market trading uses multiples of 50 shares.', 400);
  END IF;
  -- expected_price = the prevailing MARKET price the desk saw (the institutional price is derived from it)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The institutional price is recalculated from the new market price — review and submit again.';
  END IF;
  v_team_side := jse_team_side('INSTITUTION', v_side);
  v_price := round(v_sec.price, 2);
  v_tv := round(v_qty * v_price, 2);
  v_rate := cfg.brokerage_rate;
  v_brk := round(v_tv * v_rate, 2);
  v_amount := CASE WHEN v_team_side = 'BUY' THEN v_tv + v_brk ELSE v_tv - v_brk END;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ' || jse_inr(cfg.min_order_value) || ' and ' || jse_inr(cfg.max_order_value) ||
      ' per order (this order: ' || jse_inr(v_tv) || ').', 400);
  END IF;

  -- the participant side is checked like any participant trade (v3.14: refused, not only flagged); team row locked
  PERFORM 1 FROM teams WHERE id = v_team.id FOR UPDATE;
  IF v_team_side = 'SELL' THEN
    SELECT * INTO v_avail FROM jse_available_qty(v_team.id, v_sec.id, NULL);
    IF v_qty > v_avail.available THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'SHORT_SELL_NOT_ALLOWED', HINT = '409',
        MESSAGE = 'Short selling is not allowed. You can sell only the shares available in your portfolio. Please reduce the quantity or check your holdings. (' ||
                  v_team.code || ' can sell ' || greatest(v_avail.available, 0) || ' ' || v_sec.symbol || ')';
    END IF;
  ELSE
    v_free_cash := jse_available_cash(v_team.id, NULL);
    IF v_amount > v_free_cash THEN
      RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'INSUFFICIENT_BALANCE', HINT = '409',
        MESSAGE = 'Insufficient balance! Your available cash is ' || jse_inr(greatest(v_free_cash, 0)) || ', but this order requires ' || jse_inr(v_amount) ||
                  ', including applicable charges. Please reduce the order quantity or obtain an approved loan before placing this order.';
    END IF;
    PERFORM jse_check_company_limit(v_team.id, v_sec.id, v_amount, NULL);
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'INS-' || v_id::text;
  INSERT INTO orders(id, order_no, account_type, team_id, institution_id, broker_id, security_id, side, quantity, price, trade_value, brokerage,
                     brokerage_rate, settlement_amount, reference_price, status, notes, idempotency_key, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'INSTITUTION', v_team.id, v_inst.id, v_team.broker_id, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk,
          v_rate, v_amount, v_sec.price, 'EXCHANGE_PENDING', left(p->>'notes', 300), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  PERFORM jse_order_event(v_id, 'INSTITUTION_SUBMITTED', NULL, 'EXCHANGE_PENDING', a,
    v_team.code || ' ' || CASE WHEN v_team_side = 'BUY' THEN 'buys from ' ELSE 'sells to ' END || v_inst.code || ' at ' || jse_inr(v_price) ||
    ' (market ' || jse_inr(v_sec.price) || CASE WHEN v_team_side = 'BUY' THEN ' + ' ELSE ' − ' END || to_char(jse_inst_spread_pct(), 'FM990.##') || '%)' ||
    ' · brokerage ' || jse_rate_text(v_rate) || ' = ' || jse_inr(v_brk),
    jsonb_build_object('price', v_price, 'market_price', v_sec.price, 'spread_pct', 0, 'trade_value', v_tv, 'brokerage', v_brk,
                       'institution', v_inst.code));
  PERFORM jse_audit(a, 'INSTITUTIONAL_ORDER_SUBMITTED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'team_side', v_team_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_price),
    jsonb_build_object('account_type', 'INSTITUTION', 'institution', v_inst.code, 'counterparty', v_team.code, 'market_price', v_sec.price,
                       'spread_pct', 0, 'trade_value', v_tv, 'brokerage', v_brk, 'brokerage_rate', v_rate, 'settlement_amount', v_amount,
                       'broker', (SELECT code FROM brokers WHERE id = v_team.broker_id)));
  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

CREATE OR REPLACE FUNCTION jse_event_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', ''));
  cfg event_config%ROWTYPE;
  v_cur text; v_to text; v_open integer; v_eligible integer; v_candidates integer; v_new_limit numeric; v_listed jsonb := '[]'::jsonb; v_one jsonb; r record; v_names jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action NOT IN ('START', 'PAUSE', 'RESUME', 'CLOSE', 'REOPEN', 'FINALIZE') THEN
    PERFORM jse_fail('INVALID_ACTION', 'Unknown event action.', 400);
  END IF;
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_cur FROM event_control WHERE id = 1 FOR UPDATE;
  v_to := CASE v_action
    WHEN 'START'    THEN CASE WHEN v_cur = 'NOT_STARTED' THEN 'LIVE' END
    WHEN 'PAUSE'    THEN CASE WHEN v_cur = 'LIVE' THEN 'SETTLEMENT_ONLY' END
    WHEN 'RESUME'   THEN CASE WHEN v_cur = 'SETTLEMENT_ONLY' THEN 'LIVE' END
    WHEN 'CLOSE'    THEN CASE WHEN v_cur IN ('LIVE', 'SETTLEMENT_ONLY') THEN 'CLOSED' END
    WHEN 'REOPEN'   THEN CASE WHEN v_cur IN ('CLOSED', 'FINALIZED') THEN 'LIVE' END   -- reopen after CLOSE or FINALIZE (results become provisional again)
    WHEN 'FINALIZE' THEN CASE WHEN v_cur = 'CLOSED' THEN 'FINALIZED' END
  END;
  IF v_to IS NULL THEN
    PERFORM jse_fail('INVALID_TRANSITION', v_action || ' is not possible while the event is ' || replace(v_cur, '_', ' ') || '.', 409);
  END IF;
  IF v_action = 'FINALIZE' THEN
    SELECT count(*) INTO v_open FROM orders WHERE status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING');
    IF v_open > 0 THEN
      PERFORM jse_fail('OPEN_ORDERS', 'Cannot finalize while ' || v_open || ' order(s) are still waiting at the Pit, Exchange or Bank. Settle or reject them first.', 409);
    END IF;

    -- Only raise the closing-cash cap when at least two teams meet every other award criterion.
    SELECT count(*) INTO v_candidates FROM jse_team_metrics
      WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid);
    SELECT count(*) INTO v_eligible FROM jse_team_metrics
      WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND cash_rule_met;
    IF v_eligible < 2 AND v_candidates >= 2 THEN
      SELECT max(base_cash_counted) INTO v_new_limit FROM (
        SELECT base_cash_counted FROM jse_team_metrics
        WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid)
        ORDER BY base_cash_counted ASC, code ASC LIMIT 2
      ) eligible_candidates;
      IF v_new_limit IS NOT NULL AND v_new_limit > cfg.cash_rule_limit THEN
        UPDATE event_config SET cash_rule_limit = v_new_limit, updated_at = now() WHERE id = 1;
        PERFORM jse_audit(a, 'CLOSING_CASH_LIMIT_AUTO_RAISED', 'event_config', 'cash_rule_limit', NULL, NULL,
          jsonb_build_object('previous_limit', cfg.cash_rule_limit),
          jsonb_build_object('new_limit', v_new_limit, 'reason', 'At least two eligible awardees required'),
          jsonb_build_object('action', 'FINALIZE'));
        cfg.cash_rule_limit := v_new_limit;
      END IF;
      SELECT count(*) INTO v_eligible FROM jse_team_metrics
        WHERE active AND assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND cash_rule_met;
    END IF;
    IF v_eligible < 2 THEN
      PERFORM jse_fail('NOT_ENOUGH_AWARDEES', 'Cannot finalize with fewer than two eligible teams. The closing-cash limit is raised only when cash is the sole barrier; teams must still meet settled BUY/SELL and loan rules.', 409);
    END IF;
  END IF;
  IF v_action = 'START' THEN
    -- team names: randomly assigned before LIVE, locked for the event once it begins
    IF cfg.team_names_assigned_at IS NULL THEN
      PERFORM jse__assign_team_names(a, coalesce(cfg.team_name_seed, 'JSE-DALAL-STREET-2026'));
    END IF;
    IF cfg.team_names_locked_at IS NULL THEN
      UPDATE event_config SET team_names_locked_at = now(), team_names_locked_by = jse_actor_name(a) || ' (START EVENT)' WHERE id = 1;
      PERFORM jse_audit(a, 'TEAM_NAMES_LOCKED', 'team_names', NULL, NULL, NULL, NULL, NULL,
        jsonb_build_object('seed', (SELECT team_name_seed FROM event_config WHERE id = 1), 'automatic', true));
    END IF;
    -- IPOs list when the market starts: at the saved listing price, otherwise at the issue price
    IF cfg.auto_list_ipos THEN
      FOR r IN SELECT id FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NULL ORDER BY display_order, id LOOP
        v_one := jse__list_ipo(a, r.id);
        IF v_one IS NOT NULL THEN v_listed := v_listed || jsonb_build_array(v_one); END IF;
      END LOOP;
    END IF;
  END IF;
  RETURN jse__set_status(a, v_to, true,
    CASE v_action WHEN 'START' THEN 'EVENT_START' WHEN 'PAUSE' THEN 'EVENT_PAUSE' WHEN 'RESUME' THEN 'EVENT_RESUME'
                  WHEN 'CLOSE' THEN 'EVENT_CLOSE' WHEN 'REOPEN' THEN 'EVENT_REOPEN' ELSE 'EVENT_FINALIZE' END)
    || jsonb_build_object('listed', v_listed);
END $$;

INSERT INTO schema_migrations(version) VALUES ('030_negotiated_market_trades');
