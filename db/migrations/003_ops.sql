-- JAIN STOCK EXCHANGE (JSE) v272
-- 003_ops.sql: institutional orders, loans, market news, event control, reset,
-- IPO allotments, undo / redo and administration.

-- ---------------------------------------------------------------------------
-- Institutional order (admin-controlled; counterparty participant team required)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_place_institutional_order(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE;
  v_status text;
  v_inst institutions%ROWTYPE;
  v_team teams%ROWTYPE;
  v_sec securities%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_qty integer; v_price numeric; v_tv numeric; v_brk numeric := 0; v_band numeric;
  v_id bigint; v_no text; v_existing bigint;
  v_warnings jsonb := '[]'::jsonb;
  v_hold integer; v_ihold integer;
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
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || v_status || ').', 409);
  END IF;
  SELECT * INTO v_inst FROM institutions
  WHERE id = coalesce(nullif(p->>'institution_id', '')::integer, nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(p->>'counterparty_team', p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('COUNTERPARTY_REQUIRED', 'Select the counterparty participant team.', 400); END IF;
  SELECT * INTO v_sec FROM securities
  WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND OR NOT v_sec.active THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a valid stock or IPO.', 404); END IF;
  IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;
  BEGIN
    v_qty := (p->>'quantity')::integer; v_price := (p->>'price')::numeric;
  EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_NUMBER', 'Quantity and price must be numbers.', 400);
  END;
  IF v_qty IS NULL OR v_qty <= 0 OR v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares.', 400);
  END IF;
  IF v_price IS NULL OR v_price <= 0 OR v_price % cfg.price_tick <> 0 THEN PERFORM jse_fail('INVALID_PRICE', 'Enter a valid whole-rupee price.', 400); END IF;
  v_band := v_sec.price * cfg.max_price_move_pct / 100;
  IF abs(v_price - v_sec.price) > v_band THEN
    PERFORM jse_fail('PRICE_LIMIT', 'Price must stay within ' || cfg.max_price_move_pct || '% of the market price ₹' || v_sec.price || '.', 400);
  END IF;
  v_tv := round(v_qty * v_price, 2);
  IF cfg.institution_brokerage THEN v_brk := round(v_tv * cfg.brokerage_rate, 2); END IF;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ₹' || cfg.min_order_value || ' and ₹' || cfg.max_order_value || '.', 400);
  END IF;

  IF v_side = 'BUY' THEN
    SELECT coalesce((SELECT quantity FROM holdings WHERE team_id = v_team.id AND security_id = v_sec.id), 0) INTO v_hold;
    IF v_hold < v_qty THEN
      v_warnings := v_warnings || jsonb_build_object('code', 'COUNTERPARTY_HOLDINGS', 'message',
        v_team.code || ' currently holds ' || v_hold || ' ' || v_sec.symbol || ' shares; the Bank will reject unless it holds ' || v_qty || '.');
    END IF;
  ELSE
    SELECT coalesce((SELECT quantity FROM institutional_holdings WHERE institution_id = v_inst.id AND security_id = v_sec.id), 0) INTO v_ihold;
    IF v_ihold < v_qty THEN
      v_warnings := v_warnings || jsonb_build_object('code', 'INSTITUTION_HOLDINGS', 'message',
        v_inst.code || ' holds ' || v_ihold || ' ' || v_sec.symbol || ' shares; the Bank will reject unless it holds ' || v_qty || '.');
    END IF;
  END IF;

  v_id := nextval(pg_get_serial_sequence('orders', 'id'));
  v_no := 'INS-' || lpad(v_id::text, 6, '0');
  INSERT INTO orders(id, order_no, account_type, team_id, institution_id, broker_id, security_id, side, quantity, price, trade_value, brokerage,
                     settlement_amount, reference_price, status, notes, idempotency_key, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'INSTITUTION', v_team.id, v_inst.id, NULL, v_sec.id, v_side, v_qty, v_price, v_tv, v_brk,
          CASE WHEN v_side = 'SELL' THEN v_tv + v_brk ELSE v_tv - v_brk END, v_sec.price, 'EXCHANGE_PENDING', left(p->>'notes', 300), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  PERFORM jse_order_event(v_id, 'ORDER_CREATED', NULL, 'EXCHANGE_PENDING', a, 'Institutional order; counterparty ' || v_team.code,
    jsonb_build_object('reference_price', v_sec.price, 'trade_value', v_tv));
  PERFORM jse_audit(a, 'ORDER_CREATED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'EXCHANGE_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_price),
    jsonb_build_object('account_type', 'INSTITUTION', 'institution', v_inst.code, 'counterparty', v_team.code, 'trade_value', v_tv));
  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Loans: explicit draw (only at / below the minimum cash buffer) and repayment
-- (interest first, never below the minimum cash buffer).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_loan_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text;
  t teams%ROWTYPE; ln loans%ROWTYPE;
  v_action text := upper(coalesce(p->>'action', ''));
  v_amount numeric;
  v_interest numeric; v_int_pay numeric; v_prin_pay numeric; v_bal numeric; v_room numeric; v_max numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Loan actions are allowed only while the event is LIVE or SETTLEMENT ONLY.', 409);
  END IF;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', ''))) FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Select a valid team.', 404); END IF;
  INSERT INTO loans(team_id) VALUES (t.id) ON CONFLICT (team_id) DO NOTHING;
  SELECT * INTO ln FROM loans WHERE team_id = t.id FOR UPDATE;
  BEGIN v_amount := round((p->>'amount')::numeric, 2);
  EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_AMOUNT', 'Enter a valid amount.', 400);
  END;
  IF v_amount IS NULL OR v_amount <= 0 THEN PERFORM jse_fail('INVALID_AMOUNT', 'Amount must be greater than zero.', 400); END IF;

  IF v_action = 'DRAW' THEN
    IF NOT cfg.loans_enabled THEN PERFORM jse_fail('LOANS_DISABLED', 'Borrowing is not permitted right now.', 409); END IF;
    IF t.cash > cfg.min_cash_buffer THEN
      PERFORM jse_fail('OWN_MONEY_FIRST', 'Use your own money first: a loan can be drawn only when cash is ₹' || cfg.min_cash_buffer ||
        ' or less (' || t.code || ' has ₹' || t.cash || ').', 409);
    END IF;
    v_room := greatest(0, cfg.loan_max_principal - ln.original_principal);
    IF v_amount > v_room THEN
      PERFORM jse_fail('LOAN_LIMIT', 'Only ₹' || v_room || ' of the ₹' || cfg.loan_max_principal || ' loan limit is left for ' || t.code || '.', 409);
    END IF;
    v_interest := round(v_amount * cfg.loan_interest_rate, 2);
    v_bal := t.cash + v_amount;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET original_principal = original_principal + v_amount, principal_outstanding = principal_outstanding + v_amount,
           interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
           draws = draws + 1, status = 'OUTSTANDING', updated_at = now() WHERE team_id = t.id;
    PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_DRAW', 0, v_amount, v_bal, 'Loan draw (interest ₹' || v_interest || ')', a);
    INSERT INTO loan_transactions(team_id, kind, amount, automatic, note, actor_id, actor_name)
    VALUES (t.id, 'DRAW', v_amount, false, 'Loan draw', nullif(a->>'id', '')::integer, jse_actor_name(a)),
           (t.id, 'INTEREST_CHARGE', v_interest, false, round(cfg.loan_interest_rate * 100, 2) || '% interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
    PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, NULL, jsonb_build_object('cash', t.cash, 'principal', ln.principal_outstanding),
      jsonb_build_object('cash', v_bal, 'principal', ln.principal_outstanding + v_amount), jsonb_build_object('amount', v_amount, 'interest', v_interest));
    RETURN jsonb_build_object('success', true, 'action', 'DRAW', 'team', t.code, 'amount', v_amount, 'interest_charged', v_interest, 'cash', v_bal,
                              'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  ELSIF v_action = 'REPAY' THEN
    IF ln.principal_outstanding + ln.interest_outstanding <= 0 THEN PERFORM jse_fail('NO_LOAN', t.code || ' has no outstanding loan.', 409); END IF;
    IF v_amount > ln.principal_outstanding + ln.interest_outstanding THEN
      PERFORM jse_fail('REPAYMENT_EXCEEDS_DUE', 'Repayment is more than the amount due (₹' || (ln.principal_outstanding + ln.interest_outstanding) || ').', 409);
    END IF;
    v_max := greatest(0, t.cash - cfg.min_cash_buffer);
    IF v_amount > v_max THEN
      PERFORM jse_fail('REPAYMENT_CASH_LIMIT', 'Repayment cannot take cash below ₹' || cfg.min_cash_buffer || '. Maximum now: ₹' || v_max || '.', 409);
    END IF;
    v_int_pay := least(v_amount, ln.interest_outstanding);
    v_prin_pay := least(v_amount - v_int_pay, ln.principal_outstanding);
    v_bal := t.cash;
    IF v_int_pay > 0 THEN
      v_bal := v_bal - v_int_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST', v_int_pay, 0, v_bal, 'Loan interest repaid (interest is repaid first)', a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'INTEREST_REPAYMENT', v_int_pay, 'Interest repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
    END IF;
    IF v_prin_pay > 0 THEN
      v_bal := v_bal - v_prin_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_REPAYMENT', v_prin_pay, 0, v_bal, 'Loan principal repaid', a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'PRINCIPAL_REPAYMENT', v_prin_pay, 'Principal repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
    END IF;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET interest_outstanding = interest_outstanding - v_int_pay, principal_outstanding = principal_outstanding - v_prin_pay,
           interest_paid = interest_paid + v_int_pay, principal_repaid = principal_repaid + v_prin_pay,
           status = CASE WHEN interest_outstanding - v_int_pay = 0 AND principal_outstanding - v_prin_pay = 0 THEN 'REPAID' ELSE 'OUTSTANDING' END,
           updated_at = now() WHERE team_id = t.id;
    PERFORM jse_audit(a, 'LOAN_REPAYMENT', 'loan', t.code, t.id, NULL, jsonb_build_object('cash', t.cash),
      jsonb_build_object('cash', v_bal), jsonb_build_object('amount', v_amount, 'interest_paid', v_int_pay, 'principal_paid', v_prin_pay));
    RETURN jsonb_build_object('success', true, 'action', 'REPAY', 'team', t.code, 'amount', v_amount, 'interest_paid', v_int_pay,
                              'principal_paid', v_prin_pay, 'cash', v_bal, 'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use DRAW or REPAY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Market News automatic price engine (admin only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_mood_band(p_mood text) RETURNS numeric[] LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE upper(replace(trim(p_mood), ' ', '_'))
    WHEN 'VERY_SEVERE'    THEN ARRAY[-10.00, -7.50]
    WHEN 'SEVERE'         THEN ARRAY[-7.49, -5.00]
    WHEN 'NEGATIVE'       THEN ARRAY[-4.99, -1.00]
    WHEN 'NORMAL'         THEN ARRAY[-0.99, 0.99]
    WHEN 'POSITIVE'       THEN ARRAY[1.00, 4.99]
    WHEN 'VERY_POSITIVE'  THEN ARRAY[5.00, 7.49]
    WHEN 'SUPER_POSITIVE' THEN ARRAY[7.50, 10.00]
  END::numeric[]
$$;

CREATE OR REPLACE FUNCTION jse__apply_news_price(a jsonb, s securities, p_mood text, p_req numeric, p_new numeric, p_headline text)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_news bigint; v_applied numeric;
BEGIN
  v_applied := jse_pct(p_new, s.price);
  INSERT INTO market_news(security_id, mood, headline, requested_pct, applied_pct, previous_price, new_price, prior_previous, created_by, created_by_name)
  VALUES (s.id, p_mood, p_headline, p_req, v_applied, s.price, p_new, s.previous_price, nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_news;
  UPDATE securities SET previous_price = price, price = p_new, updated_at = now() WHERE id = s.id;
  INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
  VALUES (s.id, s.price, p_new, v_applied, 'MARKET_NEWS', v_news);
  PERFORM jse_audit(a, 'MARKET_NEWS_PRICE_MOVE', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('price', s.price, 'previous_price', s.previous_price), jsonb_build_object('price', p_new, 'previous_price', s.price),
    jsonb_build_object('mood', p_mood, 'requested_pct', p_req, 'applied_pct', v_applied, 'headline', p_headline, 'news_id', v_news, 'source', 'MARKET_NEWS'));
  PERFORM jse_journal('MARKET_NEWS', v_news, s.symbol || ' ' || replace(p_mood, '_', ' ') || ' ' || to_char(v_applied, 'SG990.00') || '% (₹' || s.price || ' → ₹' || p_new || ')',
                      jsonb_build_object('news_id', v_news, 'security_id', s.id), a);
  RETURN jsonb_build_object('success', true, 'news_id', v_news, 'symbol', s.symbol, 'name', s.name, 'mood', p_mood, 'headline', p_headline,
    'requested_pct', p_req, 'applied_pct', v_applied, 'previous_price', s.price, 'new_price', p_new, 'source', 'MARKET_NEWS');
END $$;

CREATE OR REPLACE FUNCTION jse_market_news(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;
  v_mood text := upper(replace(trim(coalesce(p->>'mood', '')), ' ', '_'));
  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric; v_cap numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;
  v_band := jse_mood_band(v_mood);
  IF v_band IS NULL THEN PERFORM jse_fail('INVALID_MOOD', 'Choose a market mood.', 400); END IF;
  SELECT * INTO s FROM securities WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a company.', 404); END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-news:' || s.id, 0));
  SELECT * INTO s FROM securities WHERE id = s.id FOR UPDATE;
  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);
  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);
  -- never exceed the ±10% single-move cap after rounding to the price tick
  v_cap := least(cfg.max_price_move_pct, 10);
  v_lo := ceil(s.price * (1 - v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_hi := floor(s.price * (1 + v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_new := greatest(v_lo, least(v_hi, v_new));
  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;
  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new, 'Automatic ' || replace(v_mood, '_', ' ') || ' market impact');
END $$;

-- ---------------------------------------------------------------------------
-- Event control: START / PAUSE / RESUME / CLOSE / REOPEN / FINALIZE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__set_status(a jsonb, p_to text, p_journal boolean, p_audit_action text)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE ev event_control%ROWTYPE;
BEGIN
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  UPDATE event_control SET status = p_to, status_changed_at = now(), status_changed_by = jse_actor_name(a),
    started_at = CASE WHEN p_to = 'LIVE' AND started_at IS NULL THEN now() ELSE started_at END,
    paused_at = CASE WHEN p_to = 'SETTLEMENT_ONLY' THEN now() ELSE paused_at END,
    closed_at = CASE WHEN p_to = 'CLOSED' THEN now() WHEN p_to IN ('LIVE','SETTLEMENT_ONLY','NOT_STARTED') THEN NULL ELSE closed_at END,
    finalized_at = CASE WHEN p_to = 'FINALIZED' THEN now() WHEN p_to <> 'FINALIZED' THEN NULL ELSE finalized_at END
  WHERE id = 1;
  PERFORM jse_audit(a, p_audit_action, 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status), jsonb_build_object('status', p_to), NULL);
  IF p_journal THEN
    PERFORM jse_journal('EVENT_STATUS', NULL, 'Event ' || ev.status || ' → ' || p_to, jsonb_build_object('from', ev.status, 'to', p_to), a);
  END IF;
  RETURN jsonb_build_object('success', true, 'from', ev.status, 'status', p_to);
END $$;

CREATE OR REPLACE FUNCTION jse_event_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', ''));
  v_cur text; v_to text; v_open integer; v_listed jsonb := '[]'::jsonb; v_one jsonb; r record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT status INTO v_cur FROM event_control WHERE id = 1 FOR UPDATE;
  v_to := CASE v_action
    WHEN 'START'    THEN CASE WHEN v_cur = 'NOT_STARTED' THEN 'LIVE' END
    WHEN 'PAUSE'    THEN CASE WHEN v_cur = 'LIVE' THEN 'SETTLEMENT_ONLY' END
    WHEN 'RESUME'   THEN CASE WHEN v_cur = 'SETTLEMENT_ONLY' THEN 'LIVE' END
    WHEN 'CLOSE'    THEN CASE WHEN v_cur IN ('LIVE', 'SETTLEMENT_ONLY') THEN 'CLOSED' END
    WHEN 'REOPEN'   THEN CASE WHEN v_cur = 'CLOSED' THEN 'LIVE' END
    WHEN 'FINALIZE' THEN CASE WHEN v_cur = 'CLOSED' THEN 'FINALIZED' END
  END;
  IF v_action NOT IN ('START', 'PAUSE', 'RESUME', 'CLOSE', 'REOPEN', 'FINALIZE') THEN
    PERFORM jse_fail('INVALID_ACTION', 'Unknown event action.', 400);
  END IF;
  IF v_to IS NULL THEN
    PERFORM jse_fail('INVALID_TRANSITION', v_action || ' is not possible while the event is ' || v_cur || '.', 409);
  END IF;
  IF v_action = 'FINALIZE' THEN
    SELECT count(*) INTO v_open FROM orders WHERE status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING');
    IF v_open > 0 THEN
      PERFORM jse_fail('OPEN_ORDERS', 'Cannot finalize while ' || v_open || ' order(s) are still waiting at the Exchange or Bank. Settle or reject them first.', 409);
    END IF;
  END IF;
  -- IPOs with a saved listing price open at that price when the market starts
  IF v_action = 'START' AND (SELECT auto_list_ipos FROM event_config WHERE id = 1) THEN
    FOR r IN SELECT id FROM securities WHERE kind = 'IPO' AND active AND listing_price IS NOT NULL AND listed_at IS NULL ORDER BY display_order, id LOOP
      v_one := jse__list_ipo(a, r.id);
      IF v_one IS NOT NULL THEN v_listed := v_listed || jsonb_build_array(v_one); END IF;
    END LOOP;
  END IF;
  RETURN jse__set_status(a, v_to, true,
    CASE v_action WHEN 'START' THEN 'EVENT_START' WHEN 'PAUSE' THEN 'EVENT_PAUSE' WHEN 'RESUME' THEN 'EVENT_RESUME'
                  WHEN 'CLOSE' THEN 'EVENT_CLOSE' WHEN 'REOPEN' THEN 'EVENT_REOPEN' ELSE 'EVENT_FINALIZE' END)
    || jsonb_build_object('listed', v_listed);
END $$;

-- Rejects every order still waiting at the Exchange or Bank (used at close).
CREATE OR REPLACE FUNCTION jse_reject_open_orders(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE o orders%ROWTYPE; v_n integer := 0; v_reason text := coalesce(nullif(trim(p->>'reason'), ''), 'Market closed before settlement');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  FOR o IN SELECT * FROM orders WHERE status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING') ORDER BY id FOR UPDATE LOOP
    UPDATE orders SET status = CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END,
           reject_code = 'MARKET_CLOSED', reject_reason = v_reason, updated_at = now(),
           exchange_at = CASE WHEN o.status = 'EXCHANGE_PENDING' THEN now() ELSE exchange_at END,
           exchange_by_name = CASE WHEN o.status = 'EXCHANGE_PENDING' THEN jse_actor_name(a) ELSE exchange_by_name END,
           bank_at = CASE WHEN o.status <> 'EXCHANGE_PENDING' THEN now() ELSE bank_at END,
           bank_by_name = CASE WHEN o.status <> 'EXCHANGE_PENDING' THEN jse_actor_name(a) ELSE bank_by_name END
    WHERE id = o.id;
    PERFORM jse_order_event(o.id, CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END, o.status,
      CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END, a, v_reason, NULL);
    PERFORM jse_audit(a, CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END, 'order', o.order_no,
      o.team_id, o.id, jsonb_build_object('status', o.status), NULL, jsonb_build_object('code', 'MARKET_CLOSED', 'bulk', true));
    v_n := v_n + 1;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'rejected', v_n);
END $$;

-- ---------------------------------------------------------------------------
-- IPO allotments (bulk load before START; no brokerage, no price change)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__apply_allotment(a jsonb, p_allot ipo_allotments) RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_bal numeric; v_sym text;
BEGIN
  SELECT symbol INTO v_sym FROM securities WHERE id = p_allot.security_id;
  UPDATE teams SET cash = cash - p_allot.amount, updated_at = now() WHERE id = p_allot.team_id RETURNING cash INTO v_bal;
  IF v_bal < 0 THEN PERFORM jse_fail('ALLOTMENT_CASH', 'Allotment exceeds the team''s cash.', 409); END IF;
  PERFORM jse_ledger(p_allot.team_id, NULL, NULL, 'IPO_ALLOTMENT', p_allot.amount, 0, v_bal,
    'IPO allotment: ' || p_allot.lots || ' lot(s) = ' || p_allot.quantity || ' ' || v_sym || ' @ ₹' || p_allot.price || ' (no brokerage)', a);
  INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (p_allot.team_id, p_allot.security_id, p_allot.quantity, p_allot.amount, p_allot.amount)
  ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
    cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_allot(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_status text; r jsonb; v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb;
  v_team teams%ROWTYPE; v_sec securities%ROWTYPE; v_lots integer; v_i integer := 0;
  v_replace boolean := coalesce((p->>'replace')::boolean, false);
  v_batch text := coalesce(nullif(p->>'batch_id', ''), to_char(now(), 'YYYYMMDD-HH24MISS'));
  v_need jsonb := '{}'::jsonb; v_total numeric := 0; v_count integer := 0;
  al ipo_allotments%ROWTYPE; x record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'IPO allotments can be loaded only before the event starts.', 409); END IF;
  IF jsonb_typeof(p->'rows') <> 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No allotment rows were supplied.', 400); END IF;

  -- validation pass (nothing is written unless every row is valid)
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '(blank)')); CONTINUE; END IF;
    SELECT * INTO v_sec FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))) OR upper(name) = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;
    BEGIN v_lots := (r->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
    IF v_lots IS NULL OR v_lots < 0 THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Lots must be a whole number'); CONTINUE; END IF;
    IF v_lots = 0 THEN CONTINUE; END IF;
    IF NOT v_replace AND EXISTS (SELECT 1 FROM ipo_allotments WHERE team_id = v_team.id AND security_id = v_sec.id AND reversed_at IS NULL) THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' already has a ' || v_sec.symbol || ' allotment (tick "replace" to overwrite)'); CONTINUE;
    END IF;
    v_rows := v_rows || jsonb_build_object('team_id', v_team.id, 'team', v_team.code, 'security_id', v_sec.id, 'symbol', v_sec.symbol,
                                           'lots', v_lots, 'quantity', v_lots * v_sec.lot_size, 'price', v_sec.base_price,
                                           'amount', v_lots * v_sec.lot_size * v_sec.base_price);
  END LOOP;
  -- duplicates inside the file
  FOR x IN SELECT e->>'team' AS team, e->>'symbol' AS symbol, count(*) AS n FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2 HAVING count(*) > 1 LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' / ' || x.symbol || ' appears ' || x.n || ' times in the file');
  END LOOP;
  -- cash check per team (after reversing allotments that will be replaced)
  FOR x IN
    SELECT e->>'team' AS team, (e->>'team_id')::integer AS team_id, sum((e->>'amount')::numeric) AS need
    FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2
  LOOP
    SELECT t2.cash + (CASE WHEN v_replace THEN coalesce((
             SELECT sum(al2.amount) FROM ipo_allotments al2
             JOIN jsonb_array_elements(v_rows) e2 ON (e2->>'team_id')::integer = al2.team_id AND (e2->>'security_id')::integer = al2.security_id
             WHERE al2.team_id = x.team_id AND al2.reversed_at IS NULL), 0) ELSE 0 END)
    INTO v_total FROM teams t2 WHERE t2.id = x.team_id;
    IF x.need > v_total THEN
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' does not have enough cash for ₹' || x.need || ' of allotments (available ₹' || v_total || ')');
    END IF;
  END LOOP;
  v_total := 0;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALLOTMENT_ERRORS', 'error', 'Nothing was loaded. Fix the rows listed and upload again.', 'errors', v_errors, 'http', 400);
  END IF;

  FOR r IN SELECT value FROM jsonb_array_elements(v_rows) LOOP
    IF v_replace THEN
      PERFORM jse__reverse_allotment(a, al2.id) FROM ipo_allotments al2
      WHERE al2.team_id = (r->>'team_id')::integer AND al2.security_id = (r->>'security_id')::integer AND al2.reversed_at IS NULL;
    END IF;
    INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)
    VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,
            (r->>'price')::numeric, (r->>'amount')::numeric, v_batch, nullif(a->>'id', '')::integer, jse_actor_name(a))
    RETURNING * INTO al;
    PERFORM jse__apply_allotment(a, al);
    v_total := v_total + al.amount; v_count := v_count + 1;
  END LOOP;
  PERFORM jse_audit(a, 'IPO_ALLOTMENT_LOADED', 'ipo_allotment', v_batch, NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', v_count, 'total_amount', v_total, 'replace', v_replace));
  RETURN jsonb_build_object('success', true, 'batch_id', v_batch, 'rows', v_count, 'total_amount', v_total);
END $$;

CREATE OR REPLACE FUNCTION jse__reverse_allotment(a jsonb, p_id bigint) RETURNS void LANGUAGE plpgsql AS $$
DECLARE al ipo_allotments%ROWTYPE; v_bal numeric; v_hold integer; v_sym text;
BEGIN
  SELECT * INTO al FROM ipo_allotments WHERE id = p_id AND reversed_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT quantity INTO v_hold FROM holdings WHERE team_id = al.team_id AND security_id = al.security_id FOR UPDATE;
  IF coalesce(v_hold, 0) < al.quantity THEN PERFORM jse_fail('ALLOTMENT_SOLD', 'The allotted shares are no longer held; cannot reverse.', 409); END IF;
  SELECT symbol INTO v_sym FROM securities WHERE id = al.security_id;
  UPDATE holdings SET quantity = quantity - al.quantity, cost_basis = greatest(0, cost_basis - al.amount), trade_cost = greatest(0, trade_cost - al.amount), updated_at = now()
  WHERE team_id = al.team_id AND security_id = al.security_id;
  DELETE FROM holdings WHERE team_id = al.team_id AND security_id = al.security_id AND quantity = 0;
  UPDATE teams SET cash = cash + al.amount, updated_at = now() WHERE id = al.team_id RETURNING cash INTO v_bal;
  PERFORM jse_ledger(al.team_id, NULL, NULL, 'REVERSAL', 0, al.amount, v_bal, 'IPO allotment reversed: ' || al.quantity || ' ' || v_sym, a);
  UPDATE ipo_allotments SET reversed_at = now() WHERE id = al.id;
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_allot_clear(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_status text; v_n integer := 0; r record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Allotments can be removed only before the event starts.', 409); END IF;
  FOR r IN SELECT al.id FROM ipo_allotments al JOIN teams t ON t.id = al.team_id
           WHERE al.reversed_at IS NULL AND (coalesce(p->>'team', '') = '' OR t.code = upper(trim(p->>'team'))) ORDER BY al.id LOOP
    PERFORM jse__reverse_allotment(a, r.id); v_n := v_n + 1;
  END LOOP;
  PERFORM jse_audit(a, 'IPO_ALLOTMENT_REMOVED', 'ipo_allotment', coalesce(nullif(p->>'team', ''), 'ALL'), NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));
  RETURN jsonb_build_object('success', true, 'removed', v_n);
END $$;

-- ---------------------------------------------------------------------------
-- IPO listing. The Controller saves a confidential listing price for each IPO before the event.
-- Listing moves the IPO from its issue price to the listing price (source LISTING), either with
-- "List IPOs now" or automatically at START EVENT. Only the administrator sees saved prices.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__list_ipo(a jsonb, p_id integer) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_pct numeric;
BEGIN
  SELECT * INTO s FROM securities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR s.kind <> 'IPO' OR s.listing_price IS NULL OR s.listed_at IS NOT NULL THEN RETURN NULL; END IF;
  IF s.trade_count > 0 OR s.price <> s.base_price
     OR EXISTS (SELECT 1 FROM market_news n WHERE n.security_id = s.id AND n.reversed_at IS NULL) THEN
    PERFORM jse_fail('IPO_ALREADY_MOVED', s.symbol || ' has already traded or moved on Market News; it can no longer be listed.', 409);
  END IF;
  v_pct := jse_pct(s.listing_price, s.price);
  UPDATE securities SET previous_price = price, price = listing_price, listed_at = now(), updated_at = now() WHERE id = s.id;
  INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source) VALUES (s.id, s.price, s.listing_price, v_pct, 'LISTING');
  PERFORM jse_audit(a, 'IPO_LISTED', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('price', s.price, 'previous_price', s.previous_price),
    jsonb_build_object('price', s.listing_price, 'previous_price', s.price),
    jsonb_build_object('issue_price', s.base_price, 'listing_price', s.listing_price, 'change_pct', round(v_pct, 2), 'source', 'LISTING'));
  PERFORM jse_journal('IPO_LISTING', s.id,
    s.symbol || ' listed at ₹' || s.listing_price || ' (issue ₹' || s.base_price || ', ' || to_char(round(v_pct, 2), 'SG990.00') || '%)',
    jsonb_build_object('security_id', s.id, 'from_price', s.price, 'from_previous', s.previous_price, 'listing_price', s.listing_price), a);
  RETURN jsonb_build_object('symbol', s.symbol, 'name', s.name, 'issue_price', s.base_price, 'listing_price', s.listing_price,
                            'change_pct', round(v_pct, 2));
END $$;

-- Listing status of every IPO; the saved price is visible only to administrators until the IPO lists.
CREATE OR REPLACE FUNCTION jse_listing_state(a jsonb) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'symbol', s.symbol, 'name', s.name, 'issue_price', s.base_price, 'price', s.price,
           'listing_saved', s.listing_price IS NOT NULL,
           'listing_price', CASE WHEN a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL THEN s.listing_price END,
           'gain_pct', CASE WHEN (a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL) AND s.listing_price IS NOT NULL
                            THEN round(jse_pct(s.listing_price, s.base_price), 2) END,
           'listed', s.listed_at IS NOT NULL, 'listed_at', s.listed_at, 'set_at', s.listing_set_at, 'set_by', s.listing_set_by,
           'traded', s.trade_count > 0) ORDER BY s.display_order, s.id), '[]'::jsonb)
  FROM securities s WHERE s.kind = 'IPO' AND s.active
$$;

CREATE OR REPLACE FUNCTION jse_ipo_listing(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', 'SET'));
  cfg event_config%ROWTYPE; v_status text; r jsonb; x jsonb; s securities%ROWTYPE; v_price numeric; v_i integer := 0;
  v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb; v_out jsonb := '[]'::jsonb; v_one jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'IPO listing is not possible after the market has closed.', 409);
  END IF;

  IF v_action = 'SET' THEN
    IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
      PERFORM jse_fail('NO_ROWS', 'Enter at least one listing price.', 400);
    END IF;
    FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
      v_i := v_i + 1;
      SELECT * INTO s FROM securities WHERE kind = 'IPO' AND symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', '')));
      IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;
      IF s.listed_at IS NOT NULL THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ' is already listed'); CONTINUE; END IF;
      IF nullif(trim(coalesce(r->>'listing_price', '')), '') IS NULL THEN
        v_rows := v_rows || jsonb_build_object('id', s.id, 'symbol', s.symbol, 'price', NULL);   -- blank = no listing price
        CONTINUE;
      END IF;
      BEGIN v_price := (r->>'listing_price')::numeric; EXCEPTION WHEN others THEN v_price := NULL; END;
      IF v_price IS NULL OR v_price <= 0 THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': enter a positive price'); CONTINUE;
      END IF;
      IF v_price <> jse_round_tick(v_price, cfg.price_tick) THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': use whole rupees (price step ₹' || cfg.price_tick || ')'); CONTINUE;
      END IF;
      IF v_price < s.base_price * 0.5 OR v_price > s.base_price * 2 THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': the listing price must be between 50% and 200% of the issue price ₹' || s.base_price);
        CONTINUE;
      END IF;
      v_rows := v_rows || jsonb_build_object('id', s.id, 'symbol', s.symbol, 'price', v_price);
    END LOOP;
    IF jsonb_array_length(v_errors) > 0 THEN
      RETURN jsonb_build_object('success', false, 'code', 'LISTING_ERRORS', 'error', 'Nothing was saved. Fix the rows listed.', 'errors', v_errors, 'http', 400);
    END IF;
    FOR x IN SELECT value FROM jsonb_array_elements(v_rows) LOOP
      UPDATE securities SET listing_price = (x->>'price')::numeric, listing_set_at = now(), listing_set_by = jse_actor_name(a) WHERE id = (x->>'id')::integer;
    END LOOP;
    -- the prices themselves stay out of the audit trail until the IPO lists (IPO_LISTED records them)
    PERFORM jse_audit(a, 'IPO_LISTING_PRICES_SAVED', 'security', NULL, NULL, NULL, NULL, NULL,
      jsonb_build_object('ipos', (SELECT jsonb_agg(e->>'symbol') FROM jsonb_array_elements(v_rows) e),
                         'with_price', (SELECT count(*) FROM jsonb_array_elements(v_rows) e WHERE e->>'price' IS NOT NULL)));
    RETURN jsonb_build_object('success', true, 'saved', jsonb_array_length(v_rows), 'listing', jse_listing_state(a));

  ELSIF v_action = 'CLEAR' THEN
    UPDATE securities SET listing_price = NULL, listing_set_at = now(), listing_set_by = jse_actor_name(a)
    WHERE kind = 'IPO' AND listed_at IS NULL AND listing_price IS NOT NULL;
    GET DIAGNOSTICS v_i = ROW_COUNT;
    PERFORM jse_audit(a, 'IPO_LISTING_PRICES_CLEARED', 'security', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('cleared', v_i));
    RETURN jsonb_build_object('success', true, 'cleared', v_i, 'listing', jse_listing_state(a));

  ELSIF v_action = 'APPLY' THEN
    FOR s IN SELECT * FROM securities
             WHERE kind = 'IPO' AND active AND listing_price IS NOT NULL AND listed_at IS NULL
               AND (jsonb_typeof(p->'symbols') IS DISTINCT FROM 'array'
                    OR symbol IN (SELECT upper(trim(v)) FROM jsonb_array_elements_text(p->'symbols') v))
             ORDER BY display_order, id LOOP
      v_one := jse__list_ipo(a, s.id);
      IF v_one IS NOT NULL THEN v_out := v_out || jsonb_build_array(v_one); END IF;
    END LOOP;
    IF jsonb_array_length(v_out) = 0 THEN
      PERFORM jse_fail('NOTHING_TO_LIST', 'No saved listing price is waiting to be applied.', 409);
    END IF;
    UPDATE event_control SET market_updated_at = now() WHERE id = 1;
    RETURN jsonb_build_object('success', true, 'listed', v_out, 'listing', jse_listing_state(a));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use SET, CLEAR or APPLY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Reset: clean starting state. Audit history is archived, not lost.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_reset_event(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; ev event_control%ROWTYPE;
  v_keep boolean := coalesce((p->>'keep_allotments')::boolean, true);
  v_allots jsonb; r jsonb; al ipo_allotments%ROWTYPE; v_n integer := 0; v_archived integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF coalesce(p->>'confirm', '') <> 'RESET' THEN PERFORM jse_fail('CONFIRM_REQUIRED', 'Type RESET to confirm.', 400); END IF;
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  IF ev.status IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_RUNNING', 'Close the market before resetting (current status: ' || ev.status || ').', 409);
  END IF;
  -- lock everything that is about to be rewritten
  LOCK TABLE orders, settlements, holdings, teams, securities, loans IN EXCLUSIVE MODE;
  SELECT coalesce(jsonb_agg(jsonb_build_object('team_id', team_id, 'security_id', security_id, 'lots', lots, 'quantity', quantity,
                                               'price', price, 'amount', amount, 'batch_id', batch_id) ORDER BY id), '[]'::jsonb)
  INTO v_allots FROM ipo_allotments WHERE reversed_at IS NULL;

  PERFORM set_config('jse.maintenance', 'on', true);
  INSERT INTO audit_log_archive SELECT al2.*, now(), ev.reset_count + 1 FROM audit_log al2;
  GET DIAGNOSTICS v_archived = ROW_COUNT;
  TRUNCATE action_journal, broker_commissions, cash_ledger, institution_ledger, loan_transactions, risk_events, price_history,
           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, orders, audit_log;
  PERFORM set_config('jse.maintenance', 'off', true);

  UPDATE teams SET cash = cfg.initial_capital, realized_pnl = 0, brokerage_paid = 0, short_sell_attempts = 0,
                   cash_shortfall_attempts = 0, insufficient_balance_rejections = 0, updated_at = now();
  UPDATE loans SET original_principal = 0, principal_outstanding = 0, interest_outstanding = 0, interest_charged = 0,
                   interest_paid = 0, principal_repaid = 0, draws = 0, status = 'NONE', updated_at = now();
  INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;
  UPDATE institutions SET cash = initial_cash, updated_at = now();
  -- saved IPO listing prices are kept (they list again at the next START); the listing itself is undone
  UPDATE securities SET price = base_price, previous_price = base_price, trade_count = 0, traded_quantity = 0, traded_value = 0,
                        last_trade_at = NULL, listed_at = NULL, updated_at = now();
  INSERT INTO cash_ledger(team_id, entry_type, credit, balance_after, note, actor_id, actor_name)
  SELECT id, 'INITIAL_CAPITAL', cfg.initial_capital, cfg.initial_capital, 'Initial event capital', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM teams;
  INSERT INTO institution_ledger(institution_id, entry_type, credit, balance_after, note, actor_id, actor_name)
  SELECT id, 'INITIAL_CAPITAL', initial_cash, initial_cash, 'Initial institutional cash', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM institutions;

  IF v_keep THEN
    FOR r IN SELECT value FROM jsonb_array_elements(v_allots) LOOP
      INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)
      VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,
              (r->>'price')::numeric, (r->>'amount')::numeric, r->>'batch_id', nullif(a->>'id', '')::integer, jse_actor_name(a))
      RETURNING * INTO al;
      PERFORM jse__apply_allotment(a, al);
      v_n := v_n + 1;
    END LOOP;
  END IF;

  UPDATE event_control SET status = 'NOT_STARTED', started_at = NULL, paused_at = NULL, closed_at = NULL, finalized_at = NULL,
         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'RESET_EVENT', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),
    jsonb_build_object('status', 'NOT_STARTED'),
    jsonb_build_object('reset_no', ev.reset_count + 1, 'archived_audit_rows', v_archived, 'kept_ipo_allotments', v_n, 'keep_allotments', v_keep));
  RETURN jsonb_build_object('success', true, 'status', 'NOT_STARTED', 'reset_no', ev.reset_count + 1, 'kept_ipo_allotments', v_n, 'archived_audit_rows', v_archived);
END $$;

-- ---------------------------------------------------------------------------
-- Undo / redo of journaled actions where it is safe to do so
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__undo_settlement(a jsonb, p_settle bigint) RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  st settlements%ROWTYPE; o orders%ROWTYPE; s securities%ROWTYPE; t teams%ROWTYPE; ln loans%ROWTYPE; inst institutions%ROWTYPE;
  v_bal numeric; v_last_price bigint; v_restore numeric; v_restore_prev numeric; v_team_buys boolean;
BEGIN
  SELECT * INTO st FROM settlements WHERE id = p_settle FOR UPDATE;
  IF NOT FOUND OR st.reversed_at IS NOT NULL THEN RETURN 'This settlement is already reversed.'; END IF;
  SELECT * INTO o FROM orders WHERE id = st.order_id FOR UPDATE;
  SELECT * INTO s FROM securities WHERE id = st.security_id FOR UPDATE;
  SELECT * INTO t FROM teams WHERE id = st.team_id FOR UPDATE;
  SELECT * INTO ln FROM loans WHERE team_id = st.team_id FOR UPDATE;
  IF st.institution_id IS NOT NULL THEN SELECT * INTO inst FROM institutions WHERE id = st.institution_id FOR UPDATE; END IF;

  IF EXISTS (SELECT 1 FROM settlements x WHERE x.security_id = st.security_id AND x.id > st.id AND x.reversed_at IS NULL)
     OR EXISTS (SELECT 1 FROM market_news n WHERE n.security_id = st.security_id AND n.created_at > st.settled_at AND n.reversed_at IS NULL) THEN
    RETURN 'Later trades or news already changed ' || s.symbol || '. Undo the later actions first.';
  END IF;
  IF st.loan_drawn > 0 AND EXISTS (SELECT 1 FROM loan_transactions lt WHERE lt.team_id = st.team_id AND lt.id >
       (SELECT max(lt2.id) FROM loan_transactions lt2 WHERE lt2.settlement_id = st.id)) THEN
    RETURN 'The team''s loan changed after this settlement; it cannot be reversed safely.';
  END IF;
  v_team_buys := (st.account_type = 'TEAM' AND st.side = 'BUY') OR (st.account_type = 'INSTITUTION' AND st.side = 'SELL');
  IF t.cash - st.team_cash_delta < 0 THEN
    RETURN t.code || ' no longer has the cash needed to reverse this settlement.';
  END IF;
  IF v_team_buys AND coalesce((SELECT quantity FROM holdings WHERE team_id = t.id AND security_id = s.id), 0) < st.quantity THEN
    RETURN t.code || ' no longer holds the bought shares.';
  END IF;
  IF st.institution_id IS NOT NULL AND NOT v_team_buys
     AND coalesce((SELECT quantity FROM institutional_holdings WHERE institution_id = st.institution_id AND security_id = s.id), 0) < st.quantity THEN
    RETURN 'The institution no longer holds the bought shares.';
  END IF;

  -- team side
  v_bal := t.cash - st.team_cash_delta;
  PERFORM jse_ledger(t.id, o.id, st.id, 'REVERSAL', greatest(st.team_cash_delta, 0), greatest(-st.team_cash_delta, 0), v_bal,
    'Undo of ' || o.order_no || ' settlement', a);
  UPDATE teams SET cash = v_bal, realized_pnl = realized_pnl - st.realized_pnl, brokerage_paid = greatest(0, brokerage_paid - st.brokerage), updated_at = now()
  WHERE id = t.id;
  IF v_team_buys THEN
    UPDATE holdings SET quantity = quantity - st.quantity, cost_basis = greatest(0, cost_basis - st.cost_moved),
           trade_cost = greatest(0, trade_cost - st.trade_cost_moved), updated_at = now() WHERE team_id = t.id AND security_id = s.id;
    DELETE FROM holdings WHERE team_id = t.id AND security_id = s.id AND quantity = 0;
  ELSE
    INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (t.id, s.id, st.quantity, st.cost_moved, st.trade_cost_moved)
    ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
      cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
  END IF;
  IF st.loan_drawn > 0 THEN
    UPDATE loans SET original_principal = greatest(0, original_principal - st.loan_drawn), principal_outstanding = greatest(0, principal_outstanding - st.loan_drawn),
           interest_outstanding = greatest(0, interest_outstanding - st.loan_interest), interest_charged = greatest(0, interest_charged - st.loan_interest),
           draws = greatest(0, draws - 1), updated_at = now() WHERE team_id = t.id;
    UPDATE loans SET status = CASE WHEN original_principal = 0 THEN 'NONE' WHEN principal_outstanding + interest_outstanding = 0 THEN 'REPAID' ELSE 'OUTSTANDING' END WHERE team_id = t.id;
    INSERT INTO loan_transactions(team_id, kind, amount, order_id, settlement_id, note, actor_id, actor_name)
    VALUES (t.id, 'REVERSAL', st.loan_drawn, o.id, st.id, 'Automatic draw reversed (undo)', nullif(a->>'id', '')::integer, jse_actor_name(a));
  END IF;
  -- institution side
  IF st.institution_id IS NOT NULL THEN
    UPDATE institutions SET cash = st.institution_cash_before, updated_at = now() WHERE id = st.institution_id;
    PERFORM jse_inst_ledger(st.institution_id, o.id, st.id, 'REVERSAL',
      greatest(st.institution_cash_after - st.institution_cash_before, 0), greatest(st.institution_cash_before - st.institution_cash_after, 0),
      st.institution_cash_before, 'Undo of ' || o.order_no || ' settlement', a);
    IF v_team_buys THEN
      INSERT INTO institutional_holdings(institution_id, security_id, quantity, cost_basis) VALUES (st.institution_id, s.id, st.quantity, st.inst_cost_moved)
      ON CONFLICT (institution_id, security_id) DO UPDATE SET quantity = institutional_holdings.quantity + EXCLUDED.quantity,
        cost_basis = institutional_holdings.cost_basis + EXCLUDED.cost_basis, updated_at = now();
    ELSE
      UPDATE institutional_holdings SET quantity = quantity - st.quantity, cost_basis = greatest(0, cost_basis - st.inst_cost_moved), updated_at = now()
      WHERE institution_id = st.institution_id AND security_id = s.id;
      DELETE FROM institutional_holdings WHERE institution_id = st.institution_id AND security_id = s.id AND quantity = 0;
    END IF;
  END IF;
  UPDATE broker_commissions SET reversed_at = now() WHERE settlement_id = st.id AND reversed_at IS NULL;
  -- restore the price that was in force before this trade
  IF s.price <> st.price_before OR s.previous_price <> st.previous_price_before THEN
    UPDATE securities SET price = st.price_before, previous_price = st.previous_price_before, updated_at = now() WHERE id = s.id;
    IF s.price <> st.price_before THEN
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, order_id, settlement_id)
      VALUES (s.id, s.price, st.price_before, jse_pct(st.price_before, s.price), 'UNDO', o.id, st.id);
    END IF;
  END IF;
  UPDATE securities SET trade_count = greatest(0, trade_count - 1), traded_quantity = greatest(0, traded_quantity - st.quantity),
         traded_value = greatest(0, traded_value - st.trade_value) WHERE id = s.id;
  UPDATE settlements SET reversed_at = now(), reversed_by_name = jse_actor_name(a) WHERE id = st.id;
  UPDATE orders SET status = 'EXCHANGE_APPROVED', bank_by = NULL, bank_by_name = NULL, bank_at = NULL, updated_at = now() WHERE id = o.id;
  PERFORM jse_order_event(o.id, 'UNDO_SETTLEMENT', 'BANK_SETTLED', 'EXCHANGE_APPROVED', a, 'Settlement reversed by administrator', NULL);
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION jse_undo_redo(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  j action_journal%ROWTYPE; o orders%ROWTYPE; s securities%ROWTYPE; n market_news%ROWTYPE;
  v_action text := upper(coalesce(p->>'action', ''));
  v_msg text; v_cur text; v_res jsonb; v_to text; v_from text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action NOT IN ('UNDO', 'REDO') THEN PERFORM jse_fail('INVALID_ACTION', 'Use UNDO or REDO.', 400); END IF;
  IF nullif(p->>'journal_id', '') IS NULL THEN
    IF v_action = 'UNDO' THEN
      SELECT * INTO j FROM action_journal
      WHERE (undone_at IS NULL OR redone_at > undone_at) AND NOT coalesce((payload->>'superseded')::boolean, false)
      ORDER BY id DESC LIMIT 1 FOR UPDATE;
    ELSE
      SELECT * INTO j FROM action_journal
      WHERE undone_at IS NOT NULL AND (redone_at IS NULL OR redone_at < undone_at) AND NOT coalesce((payload->>'superseded')::boolean, false)
      ORDER BY undone_at DESC LIMIT 1 FOR UPDATE;
    END IF;
  ELSE
    SELECT * INTO j FROM action_journal WHERE id = (p->>'journal_id')::bigint FOR UPDATE;
  END IF;
  IF NOT FOUND THEN PERFORM jse_fail('NOTHING_TO_' || v_action, CASE WHEN v_action = 'UNDO' THEN 'There is nothing to undo.' ELSE 'There is nothing to redo.' END, 404); END IF;
  IF coalesce((j.payload->>'superseded')::boolean, false) THEN
    PERFORM jse_fail('SUPERSEDED', 'That action was already redone; use the newer entry in the list.', 409);
  END IF;
  IF v_action = 'UNDO' AND j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN
    PERFORM jse_fail('ALREADY_UNDONE', 'That action is already undone.', 409);
  END IF;
  IF v_action = 'REDO' AND (j.undone_at IS NULL OR (j.redone_at IS NOT NULL AND j.redone_at > j.undone_at)) THEN
    PERFORM jse_fail('NOT_UNDONE', 'Only an undone action can be redone.', 409);
  END IF;
  SELECT status INTO v_cur FROM event_control WHERE id = 1;

  IF j.action = 'EXCHANGE_DECISION' THEN
    SELECT * INTO o FROM orders WHERE id = (j.payload->>'order_id')::bigint FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF o.status <> j.payload->>'decision' THEN PERFORM jse_fail('UNSAFE_UNDO', o.order_no || ' has moved on (status ' || o.status || '); undo the later step first.', 409); END IF;
      UPDATE orders SET status = 'EXCHANGE_PENDING', exchange_by = NULL, exchange_by_name = NULL, exchange_at = NULL, exchange_note = NULL,
             reject_code = NULL, reject_reason = NULL, updated_at = now() WHERE id = o.id;
      PERFORM jse_order_event(o.id, 'UNDO_EXCHANGE', o.status, 'EXCHANGE_PENDING', a, 'Exchange decision undone', NULL);
    ELSE
      IF o.status <> 'EXCHANGE_PENDING' THEN PERFORM jse_fail('UNSAFE_REDO', o.order_no || ' is no longer pending at the Exchange.', 409); END IF;
      v_res := jse_exchange_decide(a, jsonb_build_object('order_id', o.id, 'action', CASE WHEN j.payload->>'decision' = 'EXCHANGE_APPROVED' THEN 'APPROVE' ELSE 'REJECT' END,
                                                         'reason', j.payload->>'reason', 'confirm_short_sell', true));
    END IF;
  ELSIF j.action = 'BANK_REJECT' THEN
    SELECT * INTO o FROM orders WHERE id = (j.payload->>'order_id')::bigint FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF o.status <> 'BANK_REJECTED' THEN PERFORM jse_fail('UNSAFE_UNDO', o.order_no || ' is not bank-rejected any more.', 409); END IF;
      UPDATE orders SET status = 'EXCHANGE_APPROVED', reject_code = NULL, reject_reason = NULL, bank_by = NULL, bank_by_name = NULL, bank_at = NULL,
             bank_note = NULL, updated_at = now() WHERE id = o.id;
      IF j.payload->>'code' = 'INSUFFICIENT_BALANCE' AND EXISTS (SELECT 1 FROM risk_events WHERE order_id = o.id AND kind = 'INSUFFICIENT_BALANCE_REJECTION') THEN
        DELETE FROM risk_events WHERE order_id = o.id AND kind = 'INSUFFICIENT_BALANCE_REJECTION';
        UPDATE teams SET insufficient_balance_rejections = greatest(0, insufficient_balance_rejections - 1) WHERE id = o.team_id;
      END IF;
      PERFORM jse_order_event(o.id, 'UNDO_BANK_REJECT', 'BANK_REJECTED', 'EXCHANGE_APPROVED', a, 'Bank rejection undone', NULL);
    ELSE
      IF o.status NOT IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN PERFORM jse_fail('UNSAFE_REDO', o.order_no || ' is not waiting for the Bank.', 409); END IF;
      v_res := jse__bank_reject(a, o, coalesce(j.payload->>'code', 'BANK_REJECTED_BY_OPERATOR'), coalesce(j.payload->>'reason', 'Rejected by Bank'), '{"redo":true}'::jsonb);
    END IF;
  ELSIF j.action = 'BANK_SETTLE' THEN
    IF v_action = 'UNDO' THEN
      v_msg := jse__undo_settlement(a, (j.payload->>'settlement_id')::bigint);
      IF v_msg IS NOT NULL THEN PERFORM jse_fail('UNSAFE_UNDO', v_msg, 409); END IF;
    ELSE
      IF v_cur NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_NOT_OPEN', 'Redo of a settlement needs the market LIVE or SETTLEMENT ONLY.', 409); END IF;
      v_res := jse__settle(a, (j.payload->>'order_id')::bigint, 'REDO');
      IF v_res->>'status' <> 'BANK_SETTLED' THEN
        RETURN jsonb_build_object('success', true, 'action', 'REDO', 'journal_id', j.id, 'result', v_res,
                                  'message', 'Redo validation failed; the order was rejected: ' || coalesce(v_res->>'reason', ''));
      END IF;
    END IF;
  ELSIF j.action = 'MARKET_NEWS' THEN
    SELECT * INTO n FROM market_news WHERE id = (j.payload->>'news_id')::bigint FOR UPDATE;
    SELECT * INTO s FROM securities WHERE id = n.security_id FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF n.reversed_at IS NOT NULL THEN PERFORM jse_fail('ALREADY_UNDONE', 'That news impact is already reversed.', 409); END IF;
      IF s.price <> n.new_price OR EXISTS (SELECT 1 FROM price_history ph WHERE ph.security_id = s.id AND ph.created_at > n.created_at AND ph.news_id IS DISTINCT FROM n.id) THEN
        PERFORM jse_fail('UNSAFE_UNDO', s.symbol || ' has moved since this news. Undo the later actions first.', 409);
      END IF;
      UPDATE securities SET price = n.previous_price, previous_price = n.prior_previous, updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
      VALUES (s.id, s.price, n.previous_price, jse_pct(n.previous_price, s.price), 'UNDO', n.id);
      UPDATE market_news SET reversed_at = now() WHERE id = n.id;
    ELSE
      IF n.reversed_at IS NULL THEN PERFORM jse_fail('NOT_UNDONE', 'That news impact is still active.', 409); END IF;
      IF s.price <> n.previous_price THEN PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; re-publish the news instead.', 409); END IF;
      UPDATE securities SET previous_price = price, price = n.new_price, updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source, news_id)
      VALUES (s.id, s.price, n.new_price, jse_pct(n.new_price, s.price), 'REDO', n.id);
      UPDATE market_news SET reversed_at = NULL, created_at = now() WHERE id = n.id;
    END IF;
  ELSIF j.action = 'IPO_LISTING' THEN
    SELECT * INTO s FROM securities WHERE id = (j.payload->>'security_id')::integer FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF s.listed_at IS NULL THEN PERFORM jse_fail('ALREADY_UNDONE', s.symbol || ' is not listed.', 409); END IF;
      IF s.price <> (j.payload->>'listing_price')::numeric OR s.trade_count > 0
         OR EXISTS (SELECT 1 FROM price_history ph WHERE ph.security_id = s.id AND ph.created_at > s.listed_at) THEN
        PERFORM jse_fail('UNSAFE_UNDO', s.symbol || ' has traded or moved since listing. Undo the later actions first.', 409);
      END IF;
      UPDATE securities SET price = (j.payload->>'from_price')::numeric, previous_price = (j.payload->>'from_previous')::numeric,
             listed_at = NULL, updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source)
      VALUES (s.id, s.price, (j.payload->>'from_price')::numeric, jse_pct((j.payload->>'from_price')::numeric, s.price), 'UNDO');
    ELSE
      IF s.listed_at IS NOT NULL THEN PERFORM jse_fail('NOT_UNDONE', s.symbol || ' is already listed.', 409); END IF;
      IF s.price <> (j.payload->>'from_price')::numeric OR s.trade_count > 0 THEN
        PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; save the listing price and list it again instead.', 409);
      END IF;
      UPDATE securities SET previous_price = price, price = (j.payload->>'listing_price')::numeric, listed_at = now(), updated_at = now() WHERE id = s.id;
      INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source)
      VALUES (s.id, s.price, (j.payload->>'listing_price')::numeric, jse_pct((j.payload->>'listing_price')::numeric, s.price), 'REDO');
    END IF;
  ELSIF j.action = 'EVENT_STATUS' THEN
    v_from := j.payload->>'from'; v_to := j.payload->>'to';
    IF v_action = 'UNDO' THEN
      IF v_cur <> v_to THEN PERFORM jse_fail('UNSAFE_UNDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_from = 'NOT_STARTED' AND EXISTS (SELECT 1 FROM orders) THEN PERFORM jse_fail('UNSAFE_UNDO', 'Orders already exist; use RESET instead.', 409); END IF;
      PERFORM jse__set_status(a, v_from, false, 'EVENT_STATUS_UNDO');
    ELSE
      IF v_cur <> v_from THEN PERFORM jse_fail('UNSAFE_REDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_to = 'FINALIZED' AND EXISTS (SELECT 1 FROM orders WHERE status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING')) THEN
        PERFORM jse_fail('OPEN_ORDERS', 'Cannot finalize while orders are still open.', 409);
      END IF;
      PERFORM jse__set_status(a, v_to, false, 'EVENT_STATUS_REDO');
    END IF;
  END IF;

  IF v_action = 'UNDO' THEN
    UPDATE action_journal SET undone_at = clock_timestamp(), undone_by = jse_actor_name(a) WHERE id = j.id;
  ELSE
    -- redo of Exchange / Bank steps runs the engine again, which journals a fresh entry;
    -- this entry is then marked superseded so the same step can never be undone or redone twice
    UPDATE action_journal SET redone_at = clock_timestamp(), redone_by = jse_actor_name(a),
           payload = CASE WHEN j.action IN ('EXCHANGE_DECISION', 'BANK_SETTLE', 'BANK_REJECT') THEN payload || '{"superseded":true}'::jsonb ELSE payload END
    WHERE id = j.id;
  END IF;
  PERFORM jse_audit(a, v_action, 'journal', j.id::text, NULL, NULL, NULL, NULL, jsonb_build_object('journal_action', j.action, 'summary', j.summary));
  RETURN jsonb_build_object('success', true, 'action', v_action, 'journal_id', j.id, 'summary', j.summary, 'result', v_res);
END $$;

-- ---------------------------------------------------------------------------
-- Administration: configuration, teams, users
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_update_config(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE before jsonb; after jsonb; v_status text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT to_jsonb(c) INTO before FROM event_config c WHERE id = 1;
  IF v_status <> 'NOT_STARTED' AND (p ? 'initial_capital' OR p ? 'institutional_cash') THEN
    PERFORM jse_fail('EVENT_STARTED', 'Starting capital can only be changed before the event starts (then RESET).', 409);
  END IF;
  UPDATE event_config SET
    event_name              = coalesce(nullif(p->>'event_name', ''), event_name),
    initial_capital         = coalesce((p->>'initial_capital')::numeric, initial_capital),
    institutional_cash      = coalesce((p->>'institutional_cash')::numeric, institutional_cash),
    brokerage_rate          = coalesce((p->>'brokerage_rate')::numeric, brokerage_rate),
    max_price_move_pct      = coalesce((p->>'max_price_move_pct')::numeric, max_price_move_pct),
    min_order_value         = coalesce((p->>'min_order_value')::numeric, min_order_value),
    max_order_value         = coalesce((p->>'max_order_value')::numeric, max_order_value),
    loan_max_principal      = coalesce((p->>'loan_max_principal')::numeric, loan_max_principal),
    loan_interest_rate      = coalesce((p->>'loan_interest_rate')::numeric, loan_interest_rate),
    min_cash_buffer         = coalesce((p->>'min_cash_buffer')::numeric, min_cash_buffer),
    cash_rule_limit         = coalesce((p->>'cash_rule_limit')::numeric, cash_rule_limit),
    loans_enabled           = coalesce((p->>'loans_enabled')::boolean, loans_enabled),
    auto_loan_on_settlement = coalesce((p->>'auto_loan_on_settlement')::boolean, auto_loan_on_settlement),
    participant_order_entry = coalesce((p->>'participant_order_entry')::boolean, participant_order_entry),
    institution_overdraft   = coalesce((p->>'institution_overdraft')::boolean, institution_overdraft),
    auto_list_ipos          = coalesce((p->>'auto_list_ipos')::boolean, auto_list_ipos),
    updated_at = now(), updated_by = jse_actor_name(a)
  WHERE id = 1;
  IF p ? 'institutional_cash' THEN UPDATE institutions SET initial_cash = (p->>'institutional_cash')::numeric; END IF;
  SELECT to_jsonb(c) INTO after FROM event_config c WHERE id = 1;
  PERFORM jse_audit(a, 'CONFIG_UPDATED', 'event_config', '1', NULL, NULL, before, after, NULL);
  RETURN jsonb_build_object('success', true, 'config', after);
EXCEPTION WHEN check_violation OR invalid_text_representation THEN
  PERFORM jse_fail('INVALID_CONFIG', 'One of the values is not valid.', 400);
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION jse_update_teams(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; v_n integer := 0; v_errors jsonb := '[]'::jsonb; v_broker integer; v_team teams%ROWTYPE; v_i integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  FOR r IN SELECT value FROM jsonb_array_elements(coalesce(p->'rows', '[]'::jsonb)) LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '')); CONTINUE; END IF;
    v_broker := NULL;
    IF coalesce(r->>'broker', '') <> '' THEN
      SELECT id INTO v_broker FROM brokers WHERE code = upper(trim(r->>'broker')) OR upper(name) = upper(trim(r->>'broker'));
      IF v_broker IS NULL THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown broker ' || (r->>'broker')); CONTINUE; END IF;
    END IF;
    UPDATE teams SET name = coalesce(nullif(trim(r->>'name'), ''), name), section = coalesce(nullif(trim(r->>'section'), ''), section),
           members = coalesce(nullif(trim(r->>'members'), ''), members), broker_id = coalesce(v_broker, broker_id),
           active = coalesce((r->>'active')::boolean, active), updated_at = now()
    WHERE id = v_team.id;
    v_n := v_n + 1;
  END LOOP;
  IF v_n > 0 THEN PERFORM jse_audit(a, 'TEAMS_UPDATED', 'team', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n)); END IF;
  RETURN jsonb_build_object('success', jsonb_array_length(v_errors) = 0, 'updated', v_n, 'errors', v_errors);
END $$;

CREATE OR REPLACE FUNCTION jse_update_brokers(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; v_n integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  FOR r IN SELECT value FROM jsonb_array_elements(coalesce(p->'rows', '[]'::jsonb)) LOOP
    UPDATE brokers SET name = coalesce(nullif(trim(r->>'name'), ''), name) WHERE code = upper(trim(coalesce(r->>'broker', r->>'code', '')));
    IF FOUND THEN v_n := v_n + 1; END IF;
  END LOOP;
  PERFORM jse_audit(a, 'BROKERS_UPDATED', 'broker', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));
  RETURN jsonb_build_object('success', true, 'updated', v_n);
END $$;

CREATE OR REPLACE FUNCTION jse_random_password() RETURNS text LANGUAGE sql VOLATILE AS $$
  -- 10 characters from an unambiguous alphabet
  SELECT string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', 1 + (get_byte(b, i) % 56), 1), '')
  FROM (SELECT gen_random_bytes(10) AS b) x, generate_series(0, 9) AS i
$$;

CREATE OR REPLACE FUNCTION jse_admin_users(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(p->>'action', 'LIST'));
  u app_users%ROWTYPE; v_pw text; v_out jsonb := '[]'::jsonb; r record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action = 'LIST' THEN
    RETURN jsonb_build_object('success', true, 'users', coalesce((
      SELECT jsonb_agg(jsonb_build_object('id', u2.id, 'username', u2.username, 'name', u2.display_name, 'role', u2.role,
                                          'team', t.code, 'active', u2.active, 'last_login_at', u2.last_login_at,
                                          'must_change_password', u2.must_change_password) ORDER BY u2.role, u2.username)
      FROM app_users u2 LEFT JOIN teams t ON t.id = u2.team_id), '[]'::jsonb));
  ELSIF v_action = 'RESET_PASSWORD' THEN
    SELECT * INTO u FROM app_users WHERE lower(username) = lower(trim(coalesce(p->>'username', ''))) FOR UPDATE;
    IF NOT FOUND THEN PERFORM jse_fail('USER_NOT_FOUND', 'User not found.', 404); END IF;
    v_pw := coalesce(nullif(p->>'password', ''), jse_random_password());
    IF length(v_pw) < 8 THEN PERFORM jse_fail('WEAK_PASSWORD', 'Use at least 8 characters.', 400); END IF;
    UPDATE app_users SET password_hash = crypt(v_pw, gen_salt('bf', 8)), failed_logins = 0, locked_until = NULL, updated_at = now() WHERE id = u.id;
    UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL;
    PERFORM jse_audit(a, 'PASSWORD_RESET', 'user', u.username, u.team_id, NULL, NULL, NULL, NULL);
    RETURN jsonb_build_object('success', true, 'username', u.username, 'password', v_pw);
  ELSIF v_action = 'SET_ACTIVE' THEN
    IF lower(trim(coalesce(p->>'username', ''))) = lower(coalesce(a->>'username', '')) THEN
      PERFORM jse_fail('SELF', 'You cannot disable your own account.', 409);
    END IF;
    UPDATE app_users SET active = coalesce((p->>'active')::boolean, active), updated_at = now()
    WHERE lower(username) = lower(trim(coalesce(p->>'username', ''))) RETURNING * INTO u;
    IF NOT FOUND THEN PERFORM jse_fail('USER_NOT_FOUND', 'User not found.', 404); END IF;
    IF NOT u.active THEN UPDATE sessions SET revoked_at = now() WHERE user_id = u.id AND revoked_at IS NULL; END IF;
    PERFORM jse_audit(a, CASE WHEN u.active THEN 'USER_ENABLED' ELSE 'USER_DISABLED' END, 'user', u.username, u.team_id, NULL, NULL, NULL, NULL);
    RETURN jsonb_build_object('success', true, 'username', u.username, 'active', u.active);
  ELSIF v_action = 'RESET_ROLE_PASSWORDS' THEN
    -- issue fresh passwords for every account of one role (returned once, never stored in clear)
    FOR r IN SELECT id, username FROM app_users WHERE role = upper(coalesce(p->>'role', '')) AND id IS DISTINCT FROM nullif(a->>'id', '')::integer
             ORDER BY username FOR UPDATE LOOP
      v_pw := jse_random_password();
      UPDATE app_users SET password_hash = crypt(v_pw, gen_salt('bf', 8)), failed_logins = 0, locked_until = NULL, updated_at = now() WHERE id = r.id;
      UPDATE sessions SET revoked_at = now() WHERE user_id = r.id AND revoked_at IS NULL;
      v_out := v_out || jsonb_build_object('username', r.username, 'password', v_pw);
    END LOOP;
    PERFORM jse_audit(a, 'PASSWORDS_RESET', 'user', upper(coalesce(p->>'role', '')), NULL, NULL, NULL, NULL, jsonb_build_object('count', jsonb_array_length(v_out)));
    RETURN jsonb_build_object('success', true, 'credentials', v_out);
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Unknown user action.', 400);
  RETURN NULL;
END $$;

-- Free-form audit entries for administrative read actions (exports)
CREATE OR REPLACE FUNCTION jse_audit_note(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_action text := upper(coalesce(p->>'action', ''));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_action NOT IN ('EXPORT_EVENT_EXCEL', 'EXPORT_CSV', 'CREDENTIALS_ISSUED') THEN PERFORM jse_fail('INVALID_ACTION', 'Unknown audit note.', 400); END IF;
  PERFORM jse_audit(a, v_action, 'export', NULL, NULL, NULL, NULL, NULL, p - 'action');
  RETURN jsonb_build_object('success', true);
END $$;

INSERT INTO schema_migrations(version) VALUES ('003_ops');
