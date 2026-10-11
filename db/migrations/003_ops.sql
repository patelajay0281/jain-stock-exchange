-- JAIN STOCK EXCHANGE (JSE) v311
-- 003_ops.sql: institutional orders, loans, Market News (the only price engine), event control,
-- participant instructions, team names, IPO round (applications, allotments, prospectus, listing),
-- reset, undo / redo and administration.
-- Material administrative actions call jse_require_admin_password (one password dialog per action).

-- ---------------------------------------------------------------------------
-- Institutional order: separate desk, counterparty participant team, canonical market price, then the same
-- Pit Manager → Exchange → Bank workflow. Institutions never set prices.
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
  v_qty integer; v_expected numeric; v_tv numeric; v_brk numeric := 0; v_rate numeric := 0;
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
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO v_inst FROM institutions
  WHERE id = coalesce(CASE WHEN a->>'role' = 'ADMIN' THEN nullif(p->>'institution_id', '')::integer END,
                      nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(p->>'counterparty_team', p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('COUNTERPARTY_REQUIRED', 'Select the counterparty participant team.', 400); END IF;
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
  IF v_qty IS NULL OR v_qty <= 0 OR v_qty % v_sec.lot_size <> 0 THEN
    PERFORM jse_fail('INVALID_LOT', v_sec.symbol || ' trades in multiples of ' || v_sec.lot_size || ' shares.', 400);
  END IF;
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'The market price of ' || v_sec.symbol || ' changed from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) || ' (Market News). Review and submit again.';
  END IF;
  v_tv := round(v_qty * v_sec.price, 2);
  IF cfg.institution_brokerage THEN v_rate := cfg.brokerage_rate; v_brk := round(v_tv * v_rate, 2); END IF;
  IF v_tv < cfg.min_order_value OR v_tv > cfg.max_order_value THEN
    PERFORM jse_fail('ORDER_VALUE_LIMIT', 'Order value must be between ' || jse_inr(cfg.min_order_value) || ' and ' || jse_inr(cfg.max_order_value) || ' per order.', 400);
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
                     brokerage_rate, settlement_amount, reference_price, status, notes, idempotency_key, created_by, created_by_name, created_role)
  VALUES (v_id, v_no, 'INSTITUTION', v_team.id, v_inst.id, NULL, v_sec.id, v_side, v_qty, v_sec.price, v_tv, v_brk,
          v_rate, CASE WHEN v_side = 'SELL' THEN v_tv + v_brk ELSE v_tv - v_brk END, v_sec.price, 'PIT_PENDING', left(p->>'notes', 300), v_key,
          nullif(a->>'id', '')::integer, jse_actor_name(a), a->>'role');
  PERFORM jse_order_event(v_id, 'INSTITUTION_SUBMITTED', NULL, 'PIT_PENDING', a,
    'Institutional order at the market price ' || jse_inr(v_sec.price) || '; counterparty ' || v_team.code,
    jsonb_build_object('price', v_sec.price, 'trade_value', v_tv, 'institution', v_inst.code));
  PERFORM jse_audit(a, 'ORDER_SUBMITTED', 'order', v_no, v_team.id, v_id, NULL,
    jsonb_build_object('status', 'PIT_PENDING', 'side', v_side, 'symbol', v_sec.symbol, 'quantity', v_qty, 'price', v_sec.price),
    jsonb_build_object('account_type', 'INSTITUTION', 'institution', v_inst.code, 'counterparty', v_team.code, 'trade_value', v_tv));
  RETURN jsonb_build_object('success', true, 'replayed', false, 'order', jse_order_json(v_id), 'warnings', v_warnings);
END $$;

-- ---------------------------------------------------------------------------
-- Loans (Bank authority). Interest is charged at the configured rate on every draw. Repayment pays
-- interest first, then principal; after a partial repayment, fresh interest at the configured rate is
-- charged on the principal that remains. There is no minimum cash buffer.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_loan_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text;
  t teams%ROWTYPE; ln loans%ROWTYPE;
  v_action text := upper(coalesce(p->>'action', ''));
  v_amount numeric; v_due numeric;
  v_interest numeric; v_int_pay numeric; v_prin_pay numeric; v_prin_left numeric; v_fresh numeric := 0;
  v_bal numeric; v_room numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY', 'CLOSED') OR (v_status = 'CLOSED' AND v_action <> 'REPAY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Loan draws are allowed while the event is LIVE or SETTLEMENT ONLY; repayments also after CLOSE (before FINALIZE).', 409);
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
    v_room := greatest(0, cfg.loan_max_principal - ln.original_principal);
    IF v_amount > v_room THEN
      PERFORM jse_fail('LOAN_LIMIT', 'Only ' || jse_inr(v_room) || ' of the ' || jse_inr(cfg.loan_max_principal) || ' loan limit is left for ' || t.code || '.', 409);
    END IF;
    v_interest := round(v_amount * cfg.loan_interest_rate, 2);
    v_bal := t.cash + v_amount;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET original_principal = original_principal + v_amount, principal_outstanding = principal_outstanding + v_amount,
           interest_outstanding = interest_outstanding + v_interest, interest_charged = interest_charged + v_interest,
           draws = draws + 1, status = 'OUTSTANDING', updated_at = now() WHERE team_id = t.id;
    PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_DRAW', 0, v_amount, v_bal, 'Loan draw by the Bank', a);
    PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST_CHARGE', 0, 0, v_bal,
      'Loan interest charged ' || jse_inr(v_interest) || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on ' || jse_inr(v_amount) || ') — added to the loan balance, no cash moved', a);
    INSERT INTO loan_transactions(team_id, kind, amount, automatic, note, actor_id, actor_name)
    VALUES (t.id, 'DRAW', v_amount, false, 'Loan draw', nullif(a->>'id', '')::integer, jse_actor_name(a)),
           (t.id, 'INTEREST_CHARGE', v_interest, false, jse_rate_text(cfg.loan_interest_rate) || ' interest on draw', nullif(a->>'id', '')::integer, jse_actor_name(a));
    PERFORM jse_audit(a, 'LOAN_DRAW', 'loan', t.code, t.id, NULL, jsonb_build_object('cash', t.cash, 'principal', ln.principal_outstanding, 'interest', ln.interest_outstanding),
      jsonb_build_object('cash', v_bal, 'principal', ln.principal_outstanding + v_amount, 'interest', ln.interest_outstanding + v_interest),
      jsonb_build_object('amount', v_amount, 'interest_charged', v_interest, 'rate', cfg.loan_interest_rate));
    RETURN jsonb_build_object('success', true, 'action', 'DRAW', 'team', t.code, 'amount', v_amount, 'interest_charged', v_interest, 'cash', v_bal,
                              'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  ELSIF v_action = 'REPAY' THEN
    v_due := ln.principal_outstanding + ln.interest_outstanding;
    IF v_due <= 0 THEN PERFORM jse_fail('NO_LOAN', t.code || ' has no outstanding loan.', 409); END IF;
    IF v_amount > v_due THEN
      PERFORM jse_fail('REPAYMENT_EXCEEDS_DUE', 'Repayment is more than the amount due (' || jse_inr(v_due) || ').', 409);
    END IF;
    IF v_amount > t.cash THEN
      PERFORM jse_fail('REPAYMENT_CASH_LIMIT', t.code || ' has only ' || jse_inr(t.cash) || ' in cash.', 409);
    END IF;
    v_int_pay := least(v_amount, ln.interest_outstanding);
    v_prin_pay := least(v_amount - v_int_pay, ln.principal_outstanding);
    v_prin_left := ln.principal_outstanding - v_prin_pay;
    v_bal := t.cash;
    IF v_int_pay > 0 THEN
      v_bal := v_bal - v_int_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST', v_int_pay, 0, v_bal, 'Loan interest repaid (interest is repaid first)', a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'INTEREST_REPAYMENT', v_int_pay, 'Interest repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
    END IF;
    IF v_prin_pay > 0 THEN
      v_bal := v_bal - v_prin_pay;
      PERFORM jse_ledger(t.id, NULL, NULL, 'LOAN_REPAYMENT', v_prin_pay, 0, v_bal,
        'Loan principal repaid' || CASE WHEN v_prin_left > 0 THEN ' (' || jse_inr(v_prin_left) || ' principal remains)' ELSE ' (principal cleared)' END, a);
      INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
      VALUES (t.id, 'PRINCIPAL_REPAYMENT', v_prin_pay, 'Principal repayment', nullif(a->>'id', '')::integer, jse_actor_name(a));
      IF v_prin_left > 0 THEN
        v_fresh := round(v_prin_left * cfg.loan_interest_rate, 2);
        IF v_fresh > 0 THEN
          PERFORM jse_ledger(t.id, NULL, NULL, 'INTEREST_CHARGE', 0, 0, v_bal,
            'Fresh interest ' || jse_inr(v_fresh) || ' (' || jse_rate_text(cfg.loan_interest_rate) || ' on the remaining principal ' || jse_inr(v_prin_left) ||
            ' after a partial repayment) — added to the loan balance, no cash moved', a);
          INSERT INTO loan_transactions(team_id, kind, amount, note, actor_id, actor_name)
          VALUES (t.id, 'INTEREST_CHARGE', v_fresh, jse_rate_text(cfg.loan_interest_rate) || ' fresh interest on remaining principal ' || jse_inr(v_prin_left),
                  nullif(a->>'id', '')::integer, jse_actor_name(a));
        END IF;
      END IF;
    END IF;
    UPDATE teams SET cash = v_bal, updated_at = now() WHERE id = t.id;
    UPDATE loans SET interest_outstanding = interest_outstanding - v_int_pay + v_fresh, principal_outstanding = v_prin_left,
           interest_paid = interest_paid + v_int_pay, principal_repaid = principal_repaid + v_prin_pay, interest_charged = interest_charged + v_fresh,
           status = CASE WHEN v_prin_left = 0 AND interest_outstanding - v_int_pay + v_fresh = 0 THEN 'REPAID' ELSE 'OUTSTANDING' END,
           updated_at = now() WHERE team_id = t.id;
    PERFORM jse_audit(a, 'LOAN_REPAYMENT', 'loan', t.code, t.id, NULL,
      jsonb_build_object('cash', t.cash, 'principal', ln.principal_outstanding, 'interest', ln.interest_outstanding),
      jsonb_build_object('cash', v_bal, 'principal', v_prin_left, 'interest', ln.interest_outstanding - v_int_pay + v_fresh),
      jsonb_build_object('amount', v_amount, 'interest_paid', v_int_pay, 'principal_paid', v_prin_pay, 'fresh_interest', v_fresh,
                         'fully_repaid', v_prin_left = 0 AND ln.interest_outstanding - v_int_pay + v_fresh = 0));
    RETURN jsonb_build_object('success', true, 'action', 'REPAY', 'team', t.code, 'amount', v_amount, 'interest_paid', v_int_pay,
                              'principal_paid', v_prin_pay, 'fresh_interest', v_fresh, 'cash', v_bal,
                              'loan', (SELECT to_jsonb(l) FROM loans l WHERE l.team_id = t.id));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use DRAW or REPAY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Market News: the canonical price engine (administrator only). Severity sets the band, the move is
-- random inside the band, capped at ±10%.
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
DECLARE v_news bigint; v_applied numeric; v_stale integer;
BEGIN
  v_applied := jse_pct(p_new, s.price);
  INSERT INTO market_news(security_id, mood, headline, requested_pct, applied_pct, previous_price, new_price, prior_previous, created_by, created_by_name)
  VALUES (s.id, p_mood, p_headline, p_req, v_applied, s.price, p_new, s.previous_price, nullif(a->>'id', '')::integer, jse_actor_name(a))
  RETURNING id INTO v_news;
  v_stale := jse__set_price(a, s.id, p_new, 'MARKET_NEWS', v_news);
  PERFORM jse_audit(a, 'MARKET_NEWS_PRICE_MOVE', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('price', s.price, 'previous_price', s.previous_price), jsonb_build_object('price', p_new, 'previous_price', s.price),
    jsonb_build_object('company', s.name, 'symbol', s.symbol, 'headline', p_headline, 'severity', p_mood, 'requested_pct', p_req,
                       'applied_pct', v_applied, 'previous_price', s.price, 'new_price', p_new, 'news_id', v_news, 'stale_orders', v_stale,
                       'source', 'MARKET_NEWS'));
  PERFORM jse_journal('MARKET_NEWS', v_news, s.symbol || ' ' || replace(p_mood, '_', ' ') || ' ' || CASE WHEN v_applied > 0 THEN '+' ELSE '' END || to_char(v_applied, 'FM990.00') || '% (' || jse_inr(s.price) || ' → ' || jse_inr(p_new) || ')',
                      jsonb_build_object('news_id', v_news, 'security_id', s.id), a);
  RETURN jsonb_build_object('success', true, 'news_id', v_news, 'symbol', s.symbol, 'name', s.name, 'mood', p_mood, 'headline', p_headline,
    'requested_pct', p_req, 'applied_pct', v_applied, 'previous_price', s.price, 'new_price', p_new, 'stale_orders', v_stale, 'source', 'MARKET_NEWS');
END $$;

CREATE OR REPLACE FUNCTION jse_market_news(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;
  v_mood text := upper(replace(trim(coalesce(p->>'mood', p->>'severity', '')), ' ', '_'));
  v_headline text := nullif(left(trim(coalesce(p->>'headline', '')), 240), '');
  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric; v_cap numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;
  v_band := jse_mood_band(v_mood);
  IF v_band IS NULL THEN PERFORM jse_fail('INVALID_MOOD', 'Choose a news severity.', 400); END IF;
  SELECT * INTO s FROM securities WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a company.', 404); END IF;
  IF s.kind = 'IPO' AND s.listed_at IS NULL THEN
    PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' is still in the IPO stage; Market News applies once it lists.', 409);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-news:' || s.id, 0));
  SELECT * INTO s FROM securities WHERE id = s.id FOR UPDATE;
  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);
  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);
  -- never exceed the ±10% single-move cap (or the configured lower cap) after rounding to the price tick
  v_cap := least(cfg.max_price_move_pct, 10);
  v_lo := ceil(s.price * (1 - v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_hi := floor(s.price * (1 + v_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_new := greatest(v_lo, least(v_hi, v_new));
  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;
  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));
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
  cfg event_config%ROWTYPE;
  v_cur text; v_to text; v_open integer; v_listed jsonb := '[]'::jsonb; v_one jsonb; r record; v_names jsonb;
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
    WHEN 'REOPEN'   THEN CASE WHEN v_cur = 'CLOSED' THEN 'LIVE' END
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

-- Rejects every order still waiting at the Pit, Exchange or Bank, and expires open instructions (used at close).
CREATE OR REPLACE FUNCTION jse_reject_open_orders(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  o orders%ROWTYPE; v_n integer := 0; v_i integer := 0; v_to text;
  v_reason text := coalesce(nullif(trim(p->>'reason'), ''), 'Market closed before settlement');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  FOR o IN SELECT * FROM orders WHERE status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING') ORDER BY id FOR UPDATE LOOP
    v_to := CASE o.status WHEN 'PIT_PENDING' THEN 'PIT_REJECTED' WHEN 'EXCHANGE_PENDING' THEN 'EXCHANGE_REJECTED' ELSE 'BANK_REJECTED' END;
    UPDATE orders SET status = v_to, reject_code = 'MARKET_CLOSED', reject_reason = v_reason, updated_at = now(),
           pit_at = CASE WHEN v_to = 'PIT_REJECTED' THEN now() ELSE pit_at END,
           pit_by_name = CASE WHEN v_to = 'PIT_REJECTED' THEN jse_actor_name(a) ELSE pit_by_name END,
           exchange_at = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN now() ELSE exchange_at END,
           exchange_by_name = CASE WHEN v_to = 'EXCHANGE_REJECTED' THEN jse_actor_name(a) ELSE exchange_by_name END,
           bank_at = CASE WHEN v_to = 'BANK_REJECTED' THEN now() ELSE bank_at END,
           bank_by_name = CASE WHEN v_to = 'BANK_REJECTED' THEN jse_actor_name(a) ELSE bank_by_name END,
           bank_claimed_by = NULL, bank_claimed_name = NULL, bank_claimed_at = NULL
    WHERE id = o.id;
    PERFORM jse_order_event(o.id, v_to, o.status, v_to, a, v_reason, jsonb_build_object('code', 'MARKET_CLOSED', 'bulk', true));
    PERFORM jse_audit(a, v_to, 'order', o.order_no, o.team_id, o.id, jsonb_build_object('status', o.status), jsonb_build_object('status', v_to),
      jsonb_build_object('code', 'MARKET_CLOSED', 'bulk', true, 'reason', v_reason));
    v_n := v_n + 1;
  END LOOP;
  UPDATE instructions SET status = 'EXPIRED', handled_at = now(), handled_by_name = jse_actor_name(a), decline_reason = v_reason WHERE status = 'OPEN';
  GET DIAGNOSTICS v_i = ROW_COUNT;
  PERFORM jse_audit(a, 'OPEN_ORDERS_REJECTED', 'event', NULL, NULL, NULL, NULL, NULL,
    jsonb_build_object('orders', v_n, 'instructions_expired', v_i, 'reason', v_reason));
  RETURN jsonb_build_object('success', true, 'rejected', v_n, 'instructions_expired', v_i);
END $$;

-- ---------------------------------------------------------------------------
-- Participant instructions to the assigned broker (digital instruction mechanism)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_instruction_action(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'CREATE'));
  v_key text := nullif(trim(coalesce(p->>'idempotency_key', '')), '');
  v_status text; t teams%ROWTYPE; s securities%ROWTYPE; ins instructions%ROWTYPE;
  v_side text := upper(trim(coalesce(p->>'side', '')));
  v_qty integer; v_id bigint; v_no text; v_open integer;
  v_reason text := nullif(left(trim(coalesce(p->>'reason', '')), 300), '');
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'BROKER', 'ADMIN');
  IF v_action = 'CREATE' THEN
    IF a->>'role' = 'BROKER' THEN PERFORM jse_fail('FORBIDDEN', 'Brokers submit orders; instructions come from participants.', 403); END IF;
    IF v_key IS NULL OR length(v_key) > 120 THEN PERFORM jse_fail('IDEMPOTENCY_KEY_REQUIRED', 'Reload the page and try again.', 400); END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('jse-ins:' || v_key, 0));
    SELECT * INTO ins FROM instructions WHERE idempotency_key = v_key;
    IF FOUND THEN RETURN jsonb_build_object('success', true, 'replayed', true, 'instruction', to_jsonb(ins)); END IF;
    SELECT status INTO v_status FROM event_control WHERE id = 1;
    IF v_status <> 'LIVE' THEN PERFORM jse_fail('EVENT_NOT_LIVE', 'Instructions can be sent while the market is LIVE.', 409); END IF;
    SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                                               ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END;
    IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
    IF t.broker_id IS NULL THEN PERFORM jse_fail('NO_BROKER', 'Your team has no assigned broker yet. Contact the event desk.', 409); END IF;
    SELECT * INTO s FROM securities WHERE symbol = upper(trim(coalesce(p->>'symbol', ''))) AND active;
    IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a listed stock.', 404); END IF;
    IF s.kind = 'IPO' AND s.listed_at IS NULL THEN PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' has not listed yet.', 409); END IF;
    IF v_side NOT IN ('BUY', 'SELL') THEN PERFORM jse_fail('INVALID_SIDE', 'Choose BUY or SELL.', 400); END IF;
    BEGIN v_qty := (p->>'quantity')::integer; EXCEPTION WHEN others THEN v_qty := NULL; END;
    IF v_qty IS NULL OR v_qty <= 0 OR v_qty % s.lot_size <> 0 THEN
      PERFORM jse_fail('INVALID_LOT', 'Quantity must be a multiple of ' || s.lot_size || ' shares.', 400);
    END IF;
    SELECT count(*) INTO v_open FROM instructions WHERE team_id = t.id AND status = 'OPEN';
    IF v_open >= 10 THEN PERFORM jse_fail('TOO_MANY_OPEN', 'You already have 10 open instructions. Wait for your broker or cancel one.', 409); END IF;
    v_id := nextval(pg_get_serial_sequence('instructions', 'id'));
    v_no := 'REQ-' || lpad(v_id::text, 6, '0');
    INSERT INTO instructions(id, instruction_no, team_id, broker_id, security_id, side, quantity, note, price_seen, idempotency_key, created_by, created_by_name)
    VALUES (v_id, v_no, t.id, t.broker_id, s.id, v_side, v_qty, left(nullif(trim(p->>'note'), ''), 300), s.price, v_key,
            nullif(a->>'id', '')::integer, jse_actor_name(a))
    RETURNING * INTO ins;
    PERFORM jse_audit(a, 'INSTRUCTION_CREATED', 'instruction', v_no, t.id, NULL, NULL,
      jsonb_build_object('status', 'OPEN', 'side', v_side, 'symbol', s.symbol, 'quantity', v_qty),
      jsonb_build_object('broker', (SELECT code FROM brokers WHERE id = t.broker_id), 'price_seen', s.price, 'note', ins.note));
    RETURN jsonb_build_object('success', true, 'replayed', false, 'instruction', to_jsonb(ins) || jsonb_build_object('symbol', s.symbol));
  END IF;

  SELECT * INTO ins FROM instructions WHERE id = nullif(p->>'instruction_id', '')::bigint OR instruction_no = upper(trim(coalesce(p->>'instruction_no', '')))
  FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('INSTRUCTION_NOT_FOUND', 'Instruction not found.', 404); END IF;
  IF ins.status <> 'OPEN' THEN PERFORM jse_fail('INSTRUCTION_NOT_OPEN', ins.instruction_no || ' is already ' || lower(ins.status) || '.', 409); END IF;
  IF v_action = 'CANCEL' THEN
    IF a->>'role' = 'PARTICIPANT' AND ins.team_id IS DISTINCT FROM nullif(a->>'team_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not your instruction.', 403); END IF;
    IF a->>'role' = 'BROKER' THEN PERFORM jse_fail('FORBIDDEN', 'Brokers decline instructions; only the participant cancels.', 403); END IF;
    UPDATE instructions SET status = 'CANCELLED', handled_at = now(), handled_by_name = jse_actor_name(a) WHERE id = ins.id;
  ELSIF v_action = 'DECLINE' THEN
    IF a->>'role' = 'PARTICIPANT' THEN PERFORM jse_fail('FORBIDDEN', 'Use Cancel to withdraw your own instruction.', 403); END IF;
    IF a->>'role' = 'BROKER' AND ins.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
      PERFORM jse_fail('NOT_YOUR_TEAM', 'This instruction belongs to another broker''s team.', 403);
    END IF;
    IF v_reason IS NULL THEN PERFORM jse_fail('REASON_REQUIRED', 'Tell the participant why the instruction is declined.', 400); END IF;
    UPDATE instructions SET status = 'DECLINED', handled_at = now(), handled_by_name = jse_actor_name(a), decline_reason = v_reason WHERE id = ins.id;
  ELSE
    PERFORM jse_fail('INVALID_ACTION', 'Use CREATE, CANCEL or DECLINE.', 400);
  END IF;
  PERFORM jse_audit(a, 'INSTRUCTION_' || CASE v_action WHEN 'CANCEL' THEN 'CANCELLED' ELSE 'DECLINED' END, 'instruction', ins.instruction_no, ins.team_id, NULL,
    jsonb_build_object('status', 'OPEN'), jsonb_build_object('status', CASE v_action WHEN 'CANCEL' THEN 'CANCELLED' ELSE 'DECLINED' END),
    jsonb_build_object('reason', v_reason));
  RETURN jsonb_build_object('success', true, 'instruction', (SELECT to_jsonb(x) FROM instructions x WHERE x.id = ins.id));
END $$;

-- ---------------------------------------------------------------------------
-- Team identity: reproducible random assignment from the curated Indian Knowledge System name pool,
-- locked for the event once trading begins.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__assign_team_names(a jsonb, p_seed text) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE v_teams integer; v_pool integer;
BEGIN
  SELECT count(*) INTO v_teams FROM teams;
  SELECT count(*) INTO v_pool FROM team_name_pool WHERE active;
  IF v_pool < v_teams THEN
    PERFORM jse_fail('POOL_TOO_SMALL', 'The team-name pool has ' || v_pool || ' names for ' || v_teams || ' teams.', 409);
  END IF;
  UPDATE teams SET name = '~' || code;   -- temporary unique names while reassigning
  WITH tt AS (SELECT id, row_number() OVER (ORDER BY seq) AS rn FROM teams),
       nn AS (SELECT name, row_number() OVER (ORDER BY md5(p_seed || ':' || lower(name)), name) AS rn FROM team_name_pool WHERE active)
  UPDATE teams SET name = nn.name, updated_at = now() FROM tt JOIN nn ON nn.rn = tt.rn WHERE teams.id = tt.id;
  UPDATE app_users u SET display_name = t.name, updated_at = now() FROM teams t WHERE u.team_id = t.id AND u.role = 'PARTICIPANT';
  UPDATE event_config SET team_name_seed = p_seed, team_names_assigned_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'TEAM_NAMES_ASSIGNED', 'team_names', p_seed, NULL, NULL, NULL, NULL,
    jsonb_build_object('seed', p_seed, 'teams', v_teams, 'pool', v_pool, 'method', 'md5(seed:name) order, teams by code'));
  RETURN v_teams;
END $$;

CREATE OR REPLACE FUNCTION jse_team_names(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'STATE'));
  cfg event_config%ROWTYPE; v_status text; v_seed text; v_n integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_action <> 'STATE' THEN
    PERFORM jse_require_role(a, 'ADMIN');
    PERFORM jse_require_admin_password(a, p);
  END IF;
  IF v_action = 'RANDOMIZE' THEN
    IF cfg.team_names_locked_at IS NOT NULL THEN
      PERFORM jse_fail('NAMES_LOCKED', 'Team names are locked (' || coalesce(cfg.team_names_locked_by, 'locked') || '). Unlock them first (only before the event starts).', 409);
    END IF;
    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Team names can be randomized only before the event starts.', 409); END IF;
    v_seed := coalesce(nullif(upper(trim(p->>'seed')), ''), 'JSE-' || upper(encode(gen_random_bytes(4), 'hex')));
    v_n := jse__assign_team_names(a, v_seed);
  ELSIF v_action = 'LOCK' THEN
    IF cfg.team_names_assigned_at IS NULL THEN v_n := jse__assign_team_names(a, coalesce(cfg.team_name_seed, 'JSE-DALAL-STREET-2026')); END IF;
    UPDATE event_config SET team_names_locked_at = now(), team_names_locked_by = jse_actor_name(a) WHERE id = 1 AND team_names_locked_at IS NULL;
    PERFORM jse_audit(a, 'TEAM_NAMES_LOCKED', 'team_names', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('seed', (SELECT team_name_seed FROM event_config WHERE id = 1)));
  ELSIF v_action = 'UNLOCK' THEN
    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Team names stay locked once the event has started.', 409); END IF;
    UPDATE event_config SET team_names_locked_at = NULL, team_names_locked_by = NULL WHERE id = 1;
    PERFORM jse_audit(a, 'TEAM_NAMES_UNLOCKED', 'team_names', NULL, NULL, NULL, NULL, NULL, NULL);
  ELSIF v_action <> 'STATE' THEN
    PERFORM jse_fail('INVALID_ACTION', 'Use STATE, RANDOMIZE, LOCK or UNLOCK.', 400);
  END IF;
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'seed', cfg.team_name_seed, 'assigned_at', cfg.team_names_assigned_at,
    'locked', cfg.team_names_locked_at IS NOT NULL, 'locked_at', cfg.team_names_locked_at, 'locked_by', cfg.team_names_locked_by,
    'pool_size', (SELECT count(*) FROM team_name_pool WHERE active),
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'name', t.name, 'meaning', np.meaning, 'category', np.category,
                         'section', t.section, 'members', t.members, 'broker', b.code, 'broker_name', b.name) ORDER BY t.seq)
                       FROM teams t LEFT JOIN team_name_pool np ON lower(np.name) = lower(t.name) LEFT JOIN brokers b ON b.id = t.broker_id), '[]'::jsonb),
    'pool', coalesce((SELECT jsonb_agg(jsonb_build_object('name', np.name, 'category', np.category, 'meaning', np.meaning,
                        'team', (SELECT code FROM teams WHERE lower(name) = lower(np.name))) ORDER BY np.category, np.name)
                      FROM team_name_pool np WHERE np.active), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- IPO round: window = exactly 48 hours before the configured event start, for ipo_application_hours.
-- Stages: PRE_IPO → APPLICATION_OPEN → APPLICATION_CLOSED → ALLOTMENT_COMPLETED → LISTED (in CMS INDEX)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_ipo_window() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('event_start_at', c.event_start_at, 'opens_at', c.event_start_at - interval '48 hours',
    'closes_at', c.event_start_at - interval '48 hours' + make_interval(mins => (c.ipo_application_hours * 60)::integer),
    'hours', c.ipo_application_hours,
    'phase', CASE WHEN now() < c.event_start_at - interval '48 hours' THEN 'PRE_IPO'
                  WHEN now() < c.event_start_at - interval '48 hours' + make_interval(mins => (c.ipo_application_hours * 60)::integer) THEN 'OPEN'
                  ELSE 'CLOSED' END)
  FROM event_config c WHERE c.id = 1
$$;

CREATE OR REPLACE FUNCTION jse_ipo_stage(p_security integer) RETURNS text LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN s.listed_at IS NOT NULL THEN 'LISTED'
    WHEN EXISTS (SELECT 1 FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL) THEN 'ALLOTMENT_COMPLETED'
    WHEN w->>'phase' = 'PRE_IPO' THEN 'PRE_IPO'
    WHEN w->>'phase' = 'OPEN' THEN 'APPLICATION_OPEN'
    ELSE 'APPLICATION_CLOSED' END
  FROM securities s, (SELECT jse_ipo_window() AS w) x WHERE s.id = p_security AND s.kind = 'IPO'
$$;

CREATE OR REPLACE FUNCTION jse_ipo_application(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'SET'));
  v_status text; t teams%ROWTYPE; s securities%ROWTYPE; app ipo_applications%ROWTYPE;
  v_lots integer; v_amount numeric; v_other numeric; v_n integer;
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_action = 'CLEAR' THEN
    PERFORM jse_require_role(a, 'ADMIN');
    PERFORM jse_require_admin_password(a, p);
    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Applications can be cleared only before the event starts.', 409); END IF;
    DELETE FROM ipo_applications WHERE coalesce(p->>'ipo', '') = '' OR security_id = (SELECT id FROM securities WHERE kind = 'IPO' AND symbol = upper(trim(p->>'ipo')));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    PERFORM jse_audit(a, 'IPO_APPLICATIONS_CLEARED', 'ipo_application', coalesce(nullif(p->>'ipo', ''), 'ALL'), NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));
    RETURN jsonb_build_object('success', true, 'cleared', v_n);
  END IF;
  SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                                             ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  SELECT * INTO s FROM securities WHERE kind = 'IPO' AND active AND (symbol = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose one of the IPOs.', 404); END IF;
  IF jse_ipo_stage(s.id) <> 'APPLICATION_OPEN' THEN
    PERFORM jse_fail('IPO_WINDOW_CLOSED', 'Applications for ' || s.name || ' are not open (stage: ' || replace(jse_ipo_stage(s.id), '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO app FROM ipo_applications WHERE team_id = t.id AND security_id = s.id FOR UPDATE;
  IF v_action = 'WITHDRAW' THEN
    IF NOT FOUND OR app.status <> 'APPLIED' THEN PERFORM jse_fail('NO_APPLICATION', 'There is no application to withdraw.', 409); END IF;
    UPDATE ipo_applications SET status = 'WITHDRAWN', updated_at = now(), updated_by_name = jse_actor_name(a) WHERE id = app.id;
    PERFORM jse_audit(a, 'IPO_APPLICATION_WITHDRAWN', 'ipo_application', s.symbol, t.id, NULL, jsonb_build_object('lots', app.lots), NULL, NULL);
    RETURN jsonb_build_object('success', true, 'status', 'WITHDRAWN');
  ELSIF v_action <> 'SET' THEN
    PERFORM jse_fail('INVALID_ACTION', 'Use SET or WITHDRAW.', 400);
  END IF;
  BEGIN v_lots := (p->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
  IF v_lots IS NULL OR v_lots <= 0 THEN PERFORM jse_fail('INVALID_LOTS', 'Apply for a whole number of lots (1 lot = ' || s.lot_size || ' shares).', 400); END IF;
  v_amount := v_lots * s.lot_size * s.base_price;
  SELECT coalesce(sum(amount), 0) INTO v_other FROM ipo_applications WHERE team_id = t.id AND status = 'APPLIED' AND security_id <> s.id;
  IF v_other + v_amount > t.cash THEN
    PERFORM jse_fail('APPLICATION_CASH', 'All IPO applications together (' || jse_inr((v_other + v_amount)) || ') cannot exceed the team''s cash (' || jse_inr(t.cash) || ').', 409);
  END IF;
  INSERT INTO ipo_applications(team_id, security_id, lots, quantity, price, amount, status, created_by_name, updated_by_name)
  VALUES (t.id, s.id, v_lots, v_lots * s.lot_size, s.base_price, v_amount, 'APPLIED', jse_actor_name(a), jse_actor_name(a))
  ON CONFLICT (team_id, security_id) DO UPDATE SET lots = EXCLUDED.lots, quantity = EXCLUDED.quantity, price = EXCLUDED.price,
    amount = EXCLUDED.amount, status = 'APPLIED', updated_at = now(), updated_by_name = EXCLUDED.updated_by_name
  RETURNING * INTO app;
  PERFORM jse_audit(a, 'IPO_APPLICATION_SUBMITTED', 'ipo_application', s.symbol, t.id, NULL, NULL,
    jsonb_build_object('lots', v_lots, 'shares', v_lots * s.lot_size, 'amount', v_amount), jsonb_build_object('issue_price', s.base_price));
  RETURN jsonb_build_object('success', true, 'status', 'APPLIED', 'application', to_jsonb(app) || jsonb_build_object('symbol', s.symbol));
END $$;

-- One prospectus record per IPO, managed by the administrator. Content is supplied by the organisers.
CREATE OR REPLACE FUNCTION jse_ipo_prospectus_update(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_doc bytea; v_changed text[] := '{}'; f text; v_url text;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO s FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(p->>'ipo', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose one of the IPOs.', 404); END IF;
  INSERT INTO ipo_prospectus(security_id) VALUES (s.id) ON CONFLICT (security_id) DO NOTHING;
  FOREACH f IN ARRAY ARRAY['company_description','issue_details','business_overview','financial_information','risk_factors',
                           'use_of_proceeds','promoters_management','other_information'] LOOP
    IF p ? f THEN
      IF length(coalesce(p->>f, '')) > 20000 THEN PERFORM jse_fail('TOO_LONG', replace(f, '_', ' ') || ' is longer than 20,000 characters.', 400); END IF;
      EXECUTE format('UPDATE ipo_prospectus SET %I = $1 WHERE security_id = $2', f) USING nullif(trim(p->>f), ''), s.id;
      v_changed := v_changed || f;
    END IF;
  END LOOP;
  IF p ? 'document_url' THEN
    v_url := nullif(trim(p->>'document_url'), '');
    IF v_url IS NOT NULL AND v_url !~* '^https?://' THEN PERFORM jse_fail('INVALID_URL', 'The document link must start with https://', 400); END IF;
    UPDATE ipo_prospectus SET document_url = v_url WHERE security_id = s.id;
    v_changed := v_changed || 'document_url'::text;
  END IF;
  IF coalesce((p->>'remove_document')::boolean, false) THEN
    UPDATE ipo_prospectus SET document_data = NULL, document_name = NULL, document_type = NULL, document_size = NULL,
           document_uploaded_at = now(), document_uploaded_by = jse_actor_name(a) WHERE security_id = s.id;
    v_changed := v_changed || 'document_removed'::text;
  ELSIF jsonb_typeof(p->'document') = 'object' THEN
    BEGIN v_doc := decode(p->'document'->>'data_base64', 'base64');
    EXCEPTION WHEN others THEN PERFORM jse_fail('INVALID_DOCUMENT', 'The document could not be read.', 400);
    END;
    IF v_doc IS NULL OR length(v_doc) = 0 THEN PERFORM jse_fail('INVALID_DOCUMENT', 'The document is empty.', 400); END IF;
    IF length(v_doc) > 4 * 1024 * 1024 THEN PERFORM jse_fail('DOCUMENT_TOO_LARGE', 'Upload a PDF of at most 4 MB (or give a link instead).', 413); END IF;
    IF substring(v_doc from 1 for 5) <> '\x255044462d'::bytea THEN PERFORM jse_fail('NOT_A_PDF', 'Upload the prospectus as a PDF file.', 400); END IF;
    UPDATE ipo_prospectus SET document_data = v_doc, document_name = left(coalesce(nullif(p->'document'->>'name', ''), s.symbol || '-prospectus.pdf'), 160),
           document_type = 'application/pdf', document_size = length(v_doc), document_uploaded_at = now(), document_uploaded_by = jse_actor_name(a)
    WHERE security_id = s.id;
    v_changed := v_changed || 'document'::text;
  END IF;
  UPDATE ipo_prospectus SET updated_at = now(), updated_by = jse_actor_name(a) WHERE security_id = s.id;
  PERFORM jse_audit(a, 'IPO_PROSPECTUS_UPDATED', 'security', s.symbol, NULL, NULL, NULL, NULL,
    jsonb_build_object('fields', to_jsonb(v_changed), 'document_size', (SELECT document_size FROM ipo_prospectus WHERE security_id = s.id)));
  RETURN jsonb_build_object('success', true, 'symbol', s.symbol, 'updated', to_jsonb(v_changed));
END $$;

-- ---------------------------------------------------------------------------
-- IPO allotments (bulk load before START; no brokerage, no price change; not assessment trades)
-- Import columns: Team, IPO, Lots, Shares, Amount — every row is validated before anything is saved.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__apply_allotment(a jsonb, p_allot ipo_allotments) RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_bal numeric; v_sym text;
BEGIN
  SELECT symbol INTO v_sym FROM securities WHERE id = p_allot.security_id;
  UPDATE teams SET cash = cash - p_allot.amount, updated_at = now() WHERE id = p_allot.team_id RETURNING cash INTO v_bal;
  IF v_bal < 0 THEN PERFORM jse_fail('ALLOTMENT_CASH', 'Allotment exceeds the team''s cash.', 409); END IF;
  PERFORM jse_ledger(p_allot.team_id, NULL, NULL, 'IPO_ALLOTMENT', p_allot.amount, 0, v_bal,
    'IPO allotment: ' || p_allot.lots || ' IPO lot(s) = ' || p_allot.quantity || ' ' || v_sym || ' @ ' || jse_inr(p_allot.price) || ' (no brokerage; not an assessment trade)', a);
  INSERT INTO holdings(team_id, security_id, quantity, cost_basis, trade_cost) VALUES (p_allot.team_id, p_allot.security_id, p_allot.quantity, p_allot.amount, p_allot.amount)
  ON CONFLICT (team_id, security_id) DO UPDATE SET quantity = holdings.quantity + EXCLUDED.quantity,
    cost_basis = holdings.cost_basis + EXCLUDED.cost_basis, trade_cost = holdings.trade_cost + EXCLUDED.trade_cost, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_allot(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_status text; r jsonb; v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb;
  v_team teams%ROWTYPE; v_sec securities%ROWTYPE; v_lots integer; v_shares integer; v_amt numeric; v_i integer := 0;
  v_replace boolean := coalesce((p->>'replace')::boolean, false);
  v_batch text := coalesce(nullif(p->>'batch_id', ''), to_char(now(), 'YYYYMMDD-HH24MISS'));
  v_total numeric := 0; v_count integer := 0; v_applied integer;
  al ipo_allotments%ROWTYPE; x record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'IPO allotments can be loaded only before the event starts.', 409); END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No allotment rows were supplied.', 400); END IF;

  -- validation pass (nothing is written unless every row is valid)
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '(blank)')); CONTINUE; END IF;
    SELECT * INTO v_sec FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(r->>'ipo', '')))
                                                               OR upper(name) = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;
    BEGIN v_lots := (r->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
    IF v_lots IS NULL OR v_lots < 0 THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Lots must be a whole number'); CONTINUE; END IF;
    IF v_lots = 0 THEN CONTINUE; END IF;
    v_shares := v_lots * v_sec.lot_size; v_amt := v_shares * v_sec.base_price;
    IF nullif(trim(coalesce(r->>'shares', '')), '') IS NOT NULL AND (r->>'shares')::numeric <> v_shares THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Shares ' || (r->>'shares') || ' ≠ ' || v_lots || ' lots × ' || v_sec.lot_size || ' = ' || v_shares); CONTINUE;
    END IF;
    IF nullif(trim(coalesce(r->>'amount', '')), '') IS NOT NULL AND round((r->>'amount')::numeric, 2) <> v_amt THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Amount ' || (r->>'amount') || ' ≠ ' || v_shares || ' × ' || jse_inr(v_sec.base_price) || ' = ' || jse_inr(v_amt)); CONTINUE;
    END IF;
    -- when the portal application process was used for this IPO, an allotment cannot exceed the team's application
    IF EXISTS (SELECT 1 FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.status = 'APPLIED') THEN
      SELECT lots INTO v_applied FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.team_id = v_team.id AND ap.status = 'APPLIED';
      IF coalesce(v_applied, 0) < v_lots THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' applied for ' || coalesce(v_applied, 0) || ' ' || v_sec.symbol || ' lot(s) but the file allots ' || v_lots); CONTINUE;
      END IF;
    END IF;
    IF NOT v_replace AND EXISTS (SELECT 1 FROM ipo_allotments WHERE team_id = v_team.id AND security_id = v_sec.id AND reversed_at IS NULL) THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' already has a ' || v_sec.symbol || ' allotment (tick "replace" to overwrite)'); CONTINUE;
    END IF;
    v_rows := v_rows || jsonb_build_object('team_id', v_team.id, 'team', v_team.code, 'security_id', v_sec.id, 'symbol', v_sec.symbol,
                                           'lots', v_lots, 'quantity', v_shares, 'price', v_sec.base_price, 'amount', v_amt);
  END LOOP;
  FOR x IN SELECT e->>'team' AS team, e->>'symbol' AS symbol, count(*) AS n FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2 HAVING count(*) > 1 LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' / ' || x.symbol || ' appears ' || x.n || ' times in the file');
  END LOOP;
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
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' does not have enough cash for ' || jse_inr(x.need) || ' of allotments (available ' || jse_inr(v_total) || ')');
    END IF;
  END LOOP;
  v_total := 0;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALLOTMENT_ERRORS', 'error', 'Nothing was loaded. Fix the rows listed and upload again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_rows),
      'total_amount', (SELECT coalesce(sum((e->>'amount')::numeric), 0) FROM jsonb_array_elements(v_rows) e), 'preview', v_rows);
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
  PERFORM jse_require_admin_password(a, p);
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
-- IPO listing: the IPO moves from its issue price to the listing price (source LISTING), enters the listed
-- market and becomes a CMS INDEX component exactly once (at its listing price, so the index % does not jump).
-- Lists automatically at START EVENT (saved listing price, else issue price) or with "List now".
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__list_ipo(a jsonb, p_id integer) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s securities%ROWTYPE; v_price numeric; v_pct numeric; v_n integer;
BEGIN
  SELECT * INTO s FROM securities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR s.kind <> 'IPO' OR s.listed_at IS NOT NULL OR NOT s.active THEN RETURN NULL; END IF;
  IF s.trade_count > 0 OR s.price <> s.base_price
     OR EXISTS (SELECT 1 FROM market_news n WHERE n.security_id = s.id AND n.reversed_at IS NULL) THEN
    PERFORM jse_fail('IPO_ALREADY_MOVED', s.symbol || ' has already traded or moved on Market News; it can no longer be listed.', 409);
  END IF;
  v_price := coalesce(s.listing_price, s.base_price);
  v_pct := jse_pct(v_price, s.price);
  PERFORM jse__set_price(a, s.id, v_price, 'LISTING');
  UPDATE securities SET listed_at = clock_timestamp(), index_base_price = v_price WHERE id = s.id;
  SELECT count(*) INTO v_n FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL);
  PERFORM jse_audit(a, 'IPO_LISTED', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('stage', jse_ipo_stage(s.id), 'price', s.price),
    jsonb_build_object('stage', 'LISTED', 'price', v_price, 'cms_index', 'INCLUDED'),
    jsonb_build_object('issue_price', s.base_price, 'listing_price', v_price, 'listed_at_issue_price', s.listing_price IS NULL,
                       'change_pct', round(v_pct, 2), 'cms_index_components', v_n, 'source', 'LISTING'));
  PERFORM jse_journal('IPO_LISTING', s.id,
    s.symbol || ' listed at ' || jse_inr(v_price) || ' (issue ' || jse_inr(s.base_price) || ', ' || CASE WHEN v_pct > 0 THEN '+' ELSE '' END || to_char(round(v_pct, 2), 'FM990.00') || '%) · CMS INDEX ' || v_n || ' components',
    jsonb_build_object('security_id', s.id, 'from_price', s.price, 'from_previous', s.previous_price, 'listing_price', v_price), a);
  RETURN jsonb_build_object('symbol', s.symbol, 'name', s.name, 'issue_price', s.base_price, 'listing_price', v_price,
                            'change_pct', round(v_pct, 2), 'at_issue_price', s.listing_price IS NULL, 'index_components', v_n);
END $$;

-- Listing status of every IPO; the saved price is visible only to administrators until the IPO lists.
CREATE OR REPLACE FUNCTION jse_listing_state(a jsonb) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'issue_price', s.base_price, 'price', s.price,
           'listing_saved', s.listing_price IS NOT NULL,
           'listing_price', CASE WHEN a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL THEN coalesce(s.listing_price, CASE WHEN s.listed_at IS NOT NULL THEN s.index_base_price END) END,
           'gain_pct', CASE WHEN (a->>'role' = 'ADMIN' OR s.listed_at IS NOT NULL) AND s.listing_price IS NOT NULL
                            THEN round(jse_pct(s.listing_price, s.base_price), 2) END,
           'stage', jse_ipo_stage(s.id),
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
  PERFORM jse_require_admin_password(a, p);
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
        v_rows := v_rows || jsonb_build_object('id', s.id, 'symbol', s.symbol, 'price', NULL);   -- blank = list at the issue price
        CONTINUE;
      END IF;
      BEGIN v_price := (r->>'listing_price')::numeric; EXCEPTION WHEN others THEN v_price := NULL; END;
      IF v_price IS NULL OR v_price <= 0 THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': enter a positive price'); CONTINUE;
      END IF;
      IF v_price <> jse_round_tick(v_price, cfg.price_tick) THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': use whole rupees (price step ' || jse_inr(cfg.price_tick) || ')'); CONTINUE;
      END IF;
      IF v_price < s.base_price * 0.5 OR v_price > s.base_price * 2 THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', s.symbol || ': the listing price must be between 50% and 200% of the issue price ' || jse_inr(s.base_price));
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
             WHERE kind = 'IPO' AND active AND listed_at IS NULL
               AND (listing_price IS NOT NULL OR coalesce((p->>'at_issue_price')::boolean, false) OR jsonb_typeof(p->'symbols') = 'array')
               AND (jsonb_typeof(p->'symbols') IS DISTINCT FROM 'array'
                    OR symbol IN (SELECT upper(trim(v)) FROM jsonb_array_elements_text(p->'symbols') v))
             ORDER BY display_order, id LOOP
      v_one := jse__list_ipo(a, s.id);
      IF v_one IS NOT NULL THEN v_out := v_out || jsonb_build_array(v_one); END IF;
    END LOOP;
    IF jsonb_array_length(v_out) = 0 THEN
      PERFORM jse_fail('NOTHING_TO_LIST', 'No IPO is waiting to be listed (save a listing price, choose IPOs, or list at the issue price).', 409);
    END IF;
    RETURN jsonb_build_object('success', true, 'listed', v_out, 'listing', jse_listing_state(a));
  END IF;
  PERFORM jse_fail('INVALID_ACTION', 'Use SET, CLEAR or APPLY.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Reset: clean starting state. Audit history is archived, not lost. IPOs return to the pre-market stage.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_reset_event(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  cfg event_config%ROWTYPE; ev event_control%ROWTYPE;
  v_keep boolean := coalesce((p->>'keep_allotments')::boolean, true);
  v_allots jsonb; r jsonb; al ipo_allotments%ROWTYPE; v_n integer := 0; v_archived integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF coalesce(p->>'confirm', '') <> 'RESET' THEN PERFORM jse_fail('CONFIRM_REQUIRED', 'Type RESET to confirm.', 400); END IF;
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  IF ev.status IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_RUNNING', 'Close the market before resetting (current status: ' || replace(ev.status, '_', ' ') || ').', 409);
  END IF;
  LOCK TABLE orders, settlements, holdings, teams, securities, loans IN EXCLUSIVE MODE;
  SELECT coalesce(jsonb_agg(jsonb_build_object('team_id', team_id, 'security_id', security_id, 'lots', lots, 'quantity', quantity,
                                               'price', price, 'amount', amount, 'batch_id', batch_id) ORDER BY id), '[]'::jsonb)
  INTO v_allots FROM ipo_allotments WHERE reversed_at IS NULL;

  PERFORM set_config('jse.maintenance', 'on', true);
  INSERT INTO audit_log_archive SELECT al2.*, now(), ev.reset_count + 1 FROM audit_log al2;
  GET DIAGNOSTICS v_archived = ROW_COUNT;
  TRUNCATE action_journal, broker_commissions, cash_ledger, institution_ledger, loan_transactions, risk_events, price_history,
           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, trading_slips, instructions, orders, audit_log;
  PERFORM set_config('jse.maintenance', 'off', true);

  UPDATE teams SET cash = cfg.initial_capital, realized_pnl = 0, brokerage_paid = 0, short_sell_attempts = 0,
                   cash_shortfall_attempts = 0, insufficient_balance_rejections = 0, updated_at = now();
  UPDATE loans SET original_principal = 0, principal_outstanding = 0, interest_outstanding = 0, interest_charged = 0,
                   interest_paid = 0, principal_repaid = 0, draws = 0, status = 'NONE', updated_at = now();
  INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;
  UPDATE institutions SET cash = initial_cash, updated_at = now();
  -- base / reference prices; IPOs back to the pre-market stage (saved listing prices are kept for the next START)
  UPDATE securities SET price = base_price, previous_price = base_price, trade_count = 0, traded_quantity = 0, traded_value = 0,
                        last_trade_at = NULL, listed_at = NULL, last_price_change_at = NULL,
                        index_base_price = CASE WHEN kind = 'EQUITY' THEN base_price END, updated_at = now();
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
         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'RESET_EVENT', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),
    jsonb_build_object('status', 'NOT_STARTED'),
    jsonb_build_object('reset_no', ev.reset_count + 1, 'archived_audit_rows', v_archived, 'kept_ipo_allotments', v_n, 'keep_allotments', v_keep,
                       'team_names_locked', cfg.team_names_locked_at IS NOT NULL));
  RETURN jsonb_build_object('success', true, 'status', 'NOT_STARTED', 'reset_no', ev.reset_count + 1, 'kept_ipo_allotments', v_n, 'archived_audit_rows', v_archived);
END $$;

-- ---------------------------------------------------------------------------
-- Undo / redo of journaled actions where it is safe to do so
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse__undo_settlement(a jsonb, p_settle bigint) RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  st settlements%ROWTYPE; o orders%ROWTYPE; s securities%ROWTYPE; t teams%ROWTYPE; ln loans%ROWTYPE; inst institutions%ROWTYPE;
  v_bal numeric; v_team_buys boolean;
BEGIN
  SELECT * INTO st FROM settlements WHERE id = p_settle FOR UPDATE;
  IF NOT FOUND OR st.reversed_at IS NOT NULL THEN RETURN 'This settlement is already reversed.'; END IF;
  SELECT * INTO o FROM orders WHERE id = st.order_id FOR UPDATE;
  SELECT * INTO s FROM securities WHERE id = st.security_id FOR NO KEY UPDATE;
  SELECT * INTO t FROM teams WHERE id = st.team_id FOR UPDATE;
  SELECT * INTO ln FROM loans WHERE team_id = st.team_id FOR UPDATE;
  IF st.institution_id IS NOT NULL THEN SELECT * INTO inst FROM institutions WHERE id = st.institution_id FOR UPDATE; END IF;

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
    VALUES (t.id, 'REVERSAL', st.loan_drawn, o.id, st.id, 'Automatic draw and its interest reversed (undo)', nullif(a->>'id', '')::integer, jse_actor_name(a));
    PERFORM jse_ledger(t.id, o.id, st.id, 'INTEREST_CHARGE', 0, 0, v_bal, 'Loan interest ' || jse_inr(st.loan_interest) || ' on the reversed draw cancelled (undo)', a);
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
  -- market prices are not touched: settlement never moved them
  UPDATE securities SET trade_count = greatest(0, trade_count - 1), traded_quantity = greatest(0, traded_quantity - st.quantity),
         traded_value = greatest(0, traded_value - st.trade_value) WHERE id = s.id;
  UPDATE settlements SET reversed_at = now(), reversed_by_name = jse_actor_name(a) WHERE id = st.id;
  UPDATE orders SET status = 'EXCHANGE_APPROVED', bank_by = NULL, bank_by_name = NULL, bank_at = NULL, updated_at = now() WHERE id = o.id;
  PERFORM jse_order_event(o.id, 'UNDO_SETTLEMENT', 'BANK_SETTLED', 'EXCHANGE_APPROVED', a, 'Settlement reversed by administrator; back in the Bank queue', NULL);
  PERFORM jse_audit(a, 'SETTLEMENT_REVERSED', 'order', o.order_no, t.id, o.id, jsonb_build_object('status', 'BANK_SETTLED', 'cash', t.cash),
    jsonb_build_object('status', 'EXCHANGE_APPROVED', 'cash', v_bal), jsonb_build_object('settlement_id', st.id, 'loan_reversed', st.loan_drawn));
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
  PERFORM jse_require_admin_password(a, p);
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
      PERFORM jse__set_price(a, s.id, n.previous_price, 'UNDO', n.id, n.prior_previous);
      UPDATE market_news SET reversed_at = now() WHERE id = n.id;
    ELSE
      IF n.reversed_at IS NULL THEN PERFORM jse_fail('NOT_UNDONE', 'That news impact is still active.', 409); END IF;
      IF s.price <> n.previous_price THEN PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; re-publish the news instead.', 409); END IF;
      PERFORM jse__set_price(a, s.id, n.new_price, 'REDO', n.id);
      UPDATE market_news SET reversed_at = NULL, created_at = now() WHERE id = n.id;
    END IF;
  ELSIF j.action = 'IPO_LISTING' THEN
    SELECT * INTO s FROM securities WHERE id = (j.payload->>'security_id')::integer FOR UPDATE;
    IF v_action = 'UNDO' THEN
      IF s.listed_at IS NULL THEN PERFORM jse_fail('ALREADY_UNDONE', s.symbol || ' is not listed.', 409); END IF;
      IF s.price <> (j.payload->>'listing_price')::numeric OR s.trade_count > 0
         OR EXISTS (SELECT 1 FROM price_history ph WHERE ph.security_id = s.id AND ph.created_at > s.listed_at)
         OR EXISTS (SELECT 1 FROM orders x WHERE x.security_id = s.id AND x.status NOT IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED')) THEN
        PERFORM jse_fail('UNSAFE_UNDO', s.symbol || ' has orders, trades or price moves since listing. Undo the later actions first.', 409);
      END IF;
      PERFORM jse__set_price(a, s.id, (j.payload->>'from_price')::numeric, 'UNDO', NULL, (j.payload->>'from_previous')::numeric);
      UPDATE securities SET listed_at = NULL, index_base_price = NULL WHERE id = s.id;
    ELSE
      IF s.listed_at IS NOT NULL THEN PERFORM jse_fail('NOT_UNDONE', s.symbol || ' is already listed.', 409); END IF;
      IF s.price <> (j.payload->>'from_price')::numeric OR s.trade_count > 0 THEN
        PERFORM jse_fail('UNSAFE_REDO', s.symbol || ' has moved since; save the listing price and list it again instead.', 409);
      END IF;
      PERFORM jse__set_price(a, s.id, (j.payload->>'listing_price')::numeric, 'REDO');
      UPDATE securities SET listed_at = clock_timestamp(), index_base_price = (j.payload->>'listing_price')::numeric WHERE id = s.id;
    END IF;
  ELSIF j.action = 'EVENT_STATUS' THEN
    v_from := j.payload->>'from'; v_to := j.payload->>'to';
    IF v_action = 'UNDO' THEN
      IF v_cur <> v_to THEN PERFORM jse_fail('UNSAFE_UNDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_from = 'NOT_STARTED' AND EXISTS (SELECT 1 FROM orders) THEN PERFORM jse_fail('UNSAFE_UNDO', 'Orders already exist; use RESET instead.', 409); END IF;
      PERFORM jse__set_status(a, v_from, false, 'EVENT_STATUS_UNDO');
    ELSE
      IF v_cur <> v_from THEN PERFORM jse_fail('UNSAFE_REDO', 'The event status has changed since (' || v_cur || ').', 409); END IF;
      IF v_to = 'FINALIZED' AND EXISTS (SELECT 1 FROM orders WHERE status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING')) THEN
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
-- Rules & Configuration (the single source of truth for every event rule). Saving requires the password.
-- Rates may be given as percentages (brokerage_rate_pct, loan_interest_rate_pct) or fractions.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_update_config(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE before jsonb; after jsonb; v_status text; cfg event_config%ROWTYPE;
  v_brk numeric; v_loan numeric; v_start timestamptz; v_max numeric; v_min numeric; v_move numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT to_jsonb(c) - 'updated_at' INTO before FROM event_config c WHERE id = 1;
  BEGIN
    v_brk := coalesce(nullif(p->>'brokerage_rate_pct', '')::numeric / 100, nullif(p->>'brokerage_rate', '')::numeric);
    v_loan := coalesce(nullif(p->>'loan_interest_rate_pct', '')::numeric / 100, nullif(p->>'loan_interest_rate', '')::numeric);
    v_start := nullif(p->>'event_start_at', '')::timestamptz;
    v_max := nullif(p->>'max_order_value', '')::numeric;
    v_min := nullif(p->>'min_order_value', '')::numeric;
    v_move := nullif(p->>'max_price_move_pct', '')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_CONFIG', 'One of the values is not a valid number or date.', 400);
  END;
  IF v_status <> 'NOT_STARTED' AND ((p ? 'initial_capital' AND nullif(p->>'initial_capital', '')::numeric IS DISTINCT FROM cfg.initial_capital)
                                 OR (p ? 'institutional_cash' AND nullif(p->>'institutional_cash', '')::numeric IS DISTINCT FROM cfg.institutional_cash)) THEN
    PERFORM jse_fail('EVENT_STARTED', 'Starting capital can only be changed before the event starts (then RESET).', 409);
  END IF;
  IF v_brk IS NOT NULL AND (v_brk < 0 OR v_brk >= 1) THEN PERFORM jse_fail('INVALID_CONFIG', 'Brokerage must be between 0% and 100%.', 400); END IF;
  IF v_loan IS NOT NULL AND (v_loan < 0 OR v_loan >= 1) THEN PERFORM jse_fail('INVALID_CONFIG', 'Loan interest must be between 0% and 100%.', 400); END IF;
  IF v_move IS NOT NULL AND (v_move <= 0 OR v_move > 10) THEN PERFORM jse_fail('INVALID_CONFIG', 'Maximum price movement must be above 0% and at most the ±10% event cap.', 400); END IF;
  IF coalesce(v_min, cfg.min_order_value) >= coalesce(v_max, cfg.max_order_value) THEN
    PERFORM jse_fail('INVALID_CONFIG', 'Minimum order value must be lower than the maximum order value.', 400);
  END IF;
  UPDATE event_config SET
    event_name              = coalesce(nullif(trim(p->>'event_name'), ''), event_name),
    event_start_at          = coalesce(v_start, event_start_at),
    initial_capital         = coalesce(nullif(p->>'initial_capital', '')::numeric, initial_capital),
    institutional_cash      = coalesce(nullif(p->>'institutional_cash', '')::numeric, institutional_cash),
    brokerage_rate          = coalesce(v_brk, brokerage_rate),
    max_price_move_pct      = coalesce(v_move, max_price_move_pct),
    min_order_value         = coalesce(v_min, min_order_value),
    max_order_value         = coalesce(v_max, max_order_value),
    loan_max_principal      = coalesce(nullif(p->>'loan_max_principal', '')::numeric, loan_max_principal),
    loan_interest_rate      = coalesce(v_loan, loan_interest_rate),
    cash_rule_limit         = coalesce(nullif(p->>'cash_rule_limit', '')::numeric, cash_rule_limit),
    min_buy_trades          = coalesce(nullif(p->>'min_buy_trades', '')::integer, min_buy_trades),
    min_sell_trades         = coalesce(nullif(p->>'min_sell_trades', '')::integer, min_sell_trades),
    ipo_application_hours   = coalesce(nullif(p->>'ipo_application_hours', '')::numeric, ipo_application_hours),
    loans_enabled           = coalesce((p->>'loans_enabled')::boolean, loans_enabled),
    auto_loan_on_settlement = coalesce((p->>'auto_loan_on_settlement')::boolean, auto_loan_on_settlement),
    loan_repayment_required = coalesce((p->>'loan_repayment_required')::boolean, loan_repayment_required),
    institution_overdraft   = coalesce((p->>'institution_overdraft')::boolean, institution_overdraft),
    institution_brokerage   = coalesce((p->>'institution_brokerage')::boolean, institution_brokerage),
    auto_list_ipos          = coalesce((p->>'auto_list_ipos')::boolean, auto_list_ipos),
    min_cash_buffer         = 0,
    participant_order_entry = false,
    updated_at = now(), updated_by = jse_actor_name(a)
  WHERE id = 1;
  IF p ? 'institutional_cash' AND nullif(p->>'institutional_cash', '') IS NOT NULL THEN
    UPDATE institutions SET initial_cash = (p->>'institutional_cash')::numeric;
  END IF;
  SELECT to_jsonb(c) - 'updated_at' INTO after FROM event_config c WHERE id = 1;
  PERFORM jse_audit(a, 'CONFIG_UPDATED', 'event_config', '1', NULL, NULL, before, after,
    jsonb_build_object('changed', (SELECT coalesce(jsonb_agg(k), '[]'::jsonb) FROM jsonb_object_keys(after) k WHERE after->k IS DISTINCT FROM before->k AND k <> 'updated_by')));
  RETURN jsonb_build_object('success', true, 'config', after);
EXCEPTION WHEN check_violation OR invalid_text_representation OR numeric_value_out_of_range OR invalid_datetime_format THEN
  PERFORM jse_fail('INVALID_CONFIG', 'One of the values is not valid.', 400);
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Team roster (Team, Team Name, Section, Broker, Members). Atomic: every row is validated first.
-- Team names must come from the IKS pool, stay unique, and cannot change once names are locked.
-- teams.broker_id is the one canonical broker assignment.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_update_teams(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  r jsonb; v_errors jsonb := '[]'::jsonb; v_plan jsonb := '[]'::jsonb; v_broker integer; v_team teams%ROWTYPE; v_i integer := 0;
  v_name text; v_locked boolean; x jsonb; v_n integer := 0; v_dupe record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT team_names_locked_at IS NOT NULL INTO v_locked FROM event_config WHERE id = 1;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No team rows were supplied.', 400); END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(nullif(r->>'team', ''), '(blank)')); CONTINUE; END IF;
    v_broker := NULL;
    IF coalesce(trim(r->>'broker'), '') <> '' THEN
      SELECT id INTO v_broker FROM brokers WHERE code = upper(trim(r->>'broker')) OR upper(name) = upper(trim(r->>'broker'));
      IF v_broker IS NULL THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': unknown broker ' || (r->>'broker')); CONTINUE; END IF;
    END IF;
    v_name := NULL;
    IF coalesce(trim(r->>'name'), '') <> '' THEN
      SELECT name INTO v_name FROM team_name_pool WHERE lower(name) = lower(trim(r->>'name')) AND active;
      IF v_name IS NULL THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': "' || trim(r->>'name') || '" is not in the Indian Knowledge System team-name pool'); CONTINUE;
      END IF;
      IF v_locked AND v_name <> v_team.name THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': team names are locked for the event (current name ' || v_team.name || ')'); CONTINUE;
      END IF;
    END IF;
    IF length(coalesce(r->>'section', '')) > 120 OR length(coalesce(r->>'members', '')) > 1000 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ': section or members text is too long'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('id', v_team.id, 'code', v_team.code, 'name', coalesce(v_name, v_team.name),
      'section', coalesce(nullif(trim(r->>'section'), ''), v_team.section), 'members', coalesce(nullif(trim(r->>'members'), ''), v_team.members),
      'broker_id', coalesce(v_broker, v_team.broker_id), 'active', coalesce((r->>'active')::boolean, v_team.active),
      'before', jsonb_build_object('name', v_team.name, 'section', v_team.section, 'members', v_team.members, 'broker_id', v_team.broker_id, 'active', v_team.active));
  END LOOP;
  -- the same team twice, or a name used by two teams once the file is applied
  FOR v_dupe IN SELECT e->>'code' AS code, count(*) AS n FROM jsonb_array_elements(v_plan) e GROUP BY 1 HAVING count(*) > 1 LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', v_dupe.code || ' appears ' || v_dupe.n || ' times in the file');
  END LOOP;
  FOR v_dupe IN
    WITH final AS (
      SELECT t.code, coalesce((SELECT e->>'name' FROM jsonb_array_elements(v_plan) e WHERE (e->>'id')::integer = t.id LIMIT 1), t.name) AS name FROM teams t)
    SELECT lower(name) AS nm, string_agg(code, ', ' ORDER BY code) AS codes, count(*) AS n FROM final GROUP BY lower(name) HAVING count(*) > 1
  LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', 'Team name "' || v_dupe.nm || '" would be used by ' || v_dupe.codes);
  END LOOP;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ROSTER_ERRORS', 'error', 'Nothing was saved. Fix the rows listed and try again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan));
  END IF;
  -- apply (names through temporary values so swaps never collide)
  UPDATE teams t SET name = '~' || t.code FROM jsonb_array_elements(v_plan) e WHERE t.id = (e->>'id')::integer AND t.name <> e->>'name';
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE teams SET name = x->>'name', section = x->>'section', members = x->>'members', broker_id = (x->>'broker_id')::integer,
           active = (x->>'active')::boolean, updated_at = now()
    WHERE id = (x->>'id')::integer;
    IF (x->'before') IS DISTINCT FROM jsonb_build_object('name', x->>'name', 'section', x->>'section', 'members', x->>'members',
                                                          'broker_id', (x->>'broker_id')::integer, 'active', (x->>'active')::boolean) THEN
      PERFORM jse_audit(a, 'TEAM_UPDATED', 'team', x->>'code', (x->>'id')::integer, NULL,
        (x->'before') || jsonb_build_object('broker', (SELECT code FROM brokers WHERE id = (x->'before'->>'broker_id')::integer)),
        jsonb_build_object('name', x->>'name', 'section', x->>'section', 'members', x->>'members', 'active', (x->>'active')::boolean,
                           'broker', (SELECT code FROM brokers WHERE id = (x->>'broker_id')::integer)), NULL);
      v_n := v_n + 1;
    END IF;
  END LOOP;
  UPDATE app_users u SET display_name = t.name, updated_at = now() FROM teams t WHERE u.team_id = t.id AND u.role = 'PARTICIPANT' AND u.display_name <> t.name;
  PERFORM jse_audit(a, 'TEAMS_UPDATED', 'team', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_n));
  RETURN jsonb_build_object('success', true, 'updated', jsonb_array_length(v_plan), 'changed', v_n);
END $$;

-- Broker roster (Broker Code, Broker Name, optional Contact and Desk). Atomic; the 10 brokers stay the broker population.
CREATE OR REPLACE FUNCTION jse_update_brokers(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; v_errors jsonb := '[]'::jsonb; v_plan jsonb := '[]'::jsonb; b brokers%ROWTYPE; v_i integer := 0; x jsonb; v_n integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No broker rows were supplied.', 400); END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO b FROM brokers WHERE code = upper(trim(coalesce(r->>'broker', r->>'code', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown broker code ' || coalesce(nullif(coalesce(r->>'broker', r->>'code'), ''), '(blank)')); CONTINUE; END IF;
    IF length(coalesce(r->>'name', '')) > 120 OR length(coalesce(r->>'contact', '')) > 200 OR length(coalesce(r->>'desk', '')) > 120 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', b.code || ': text too long'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('id', b.id, 'code', b.code,
      'name', coalesce(nullif(trim(r->>'name'), ''), b.name),
      'contact', CASE WHEN r ? 'contact' THEN nullif(trim(r->>'contact'), '') ELSE b.contact END,
      'desk', CASE WHEN r ? 'desk' THEN nullif(trim(r->>'desk'), '') ELSE b.desk END,
      'before', jsonb_build_object('name', b.name, 'contact', b.contact, 'desk', b.desk));
  END LOOP;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_plan) e GROUP BY e->>'code' HAVING count(*) > 1) THEN
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', 'A broker code appears more than once in the file');
  END IF;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ROSTER_ERRORS', 'error', 'Nothing was saved. Fix the rows listed and try again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan)); END IF;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE brokers SET name = x->>'name', contact = x->>'contact', desk = x->>'desk' WHERE id = (x->>'id')::integer;
    UPDATE app_users SET display_name = x->>'name', updated_at = now() WHERE role = 'BROKER' AND broker_id = (x->>'id')::integer AND display_name <> x->>'name';
    IF (x->'before') IS DISTINCT FROM jsonb_build_object('name', x->>'name', 'contact', x->>'contact', 'desk', x->>'desk') THEN
      PERFORM jse_audit(a, 'BROKER_UPDATED', 'broker', x->>'code', NULL, NULL, x->'before',
        jsonb_build_object('name', x->>'name', 'contact', x->>'contact', 'desk', x->>'desk'), NULL);
      v_n := v_n + 1;
    END IF;
  END LOOP;
  PERFORM jse_audit(a, 'BROKERS_UPDATED', 'broker', NULL, NULL, NULL, NULL, NULL, jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_n));
  RETURN jsonb_build_object('success', true, 'updated', jsonb_array_length(v_plan), 'changed', v_n);
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
                                          'team', t.code, 'broker', b.code, 'active', u2.active, 'last_login_at', u2.last_login_at,
                                          'must_change_password', u2.must_change_password) ORDER BY u2.role, u2.username)
      FROM app_users u2 LEFT JOIN teams t ON t.id = u2.team_id LEFT JOIN brokers b ON b.id = u2.broker_id), '[]'::jsonb));
  END IF;
  PERFORM jse_require_admin_password(a, p);
  IF v_action = 'RESET_PASSWORD' THEN
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

-- Free-form audit entries for administrative read actions (exports, imports)
CREATE OR REPLACE FUNCTION jse_audit_note(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE v_action text := upper(coalesce(p->>'action', ''));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_action NOT IN ('EXPORT_EVENT_EXCEL', 'EXPORT_EVENT_JSON', 'EXPORT_CSV', 'CREDENTIALS_ISSUED') THEN PERFORM jse_fail('INVALID_ACTION', 'Unknown audit note.', 400); END IF;
  PERFORM jse_audit(a, v_action, 'export', NULL, NULL, NULL, NULL, NULL, p - 'action' - 'admin_password');
  RETURN jsonb_build_object('success', true);
END $$;

INSERT INTO schema_migrations(version) VALUES ('003_ops');
