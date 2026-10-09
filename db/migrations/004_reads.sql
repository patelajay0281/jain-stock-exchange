-- JAIN STOCK EXCHANGE (JSE) v272
-- 004_reads.sql: read models used by the API (market, portfolios, tracking, queues,
-- ledgers, audit, commissions, intelligence, institutional, admin state, exports).

-- ---------------------------------------------------------------------------
-- Team metrics: Net Worth = liquid cash + Σ(quantity × current price). Loans are NOT deducted.
-- ₹50K closing cash rule: profit cash (realised trading profit still held as cash) is exempt;
-- the rest of the cash ("base cash counted") must be at most cash_rule_limit at close.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW jse_team_metrics AS
WITH cfg AS (SELECT * FROM event_config WHERE id = 1),
     ev  AS (SELECT status FROM event_control WHERE id = 1),
     hv  AS (SELECT h.team_id, sum(h.quantity * s.price) AS holdings_value, sum(h.cost_basis) AS cost_basis,
                    count(*) FILTER (WHERE h.quantity > 0) AS positions
             FROM holdings h JOIN securities s ON s.id = h.security_id GROUP BY h.team_id),
     base AS (
       SELECT t.id AS team_id, t.code, t.seq, t.name, t.section, t.members, t.active, b.id AS broker_id, b.code AS broker, b.name AS broker_name,
              t.cash, coalesce(hv.holdings_value, 0)::numeric(18,2) AS holdings_value, coalesce(hv.cost_basis, 0) AS cost_basis,
              coalesce(hv.positions, 0) AS positions, t.realized_pnl, t.brokerage_paid,
              t.short_sell_attempts, t.cash_shortfall_attempts, t.insufficient_balance_rejections,
              coalesce(l.original_principal, 0) AS loan_original, coalesce(l.principal_outstanding, 0) AS loan_principal,
              coalesce(l.interest_outstanding, 0) AS loan_interest, coalesce(l.interest_charged, 0) AS loan_interest_charged,
              coalesce(l.interest_paid, 0) AS loan_interest_paid, coalesce(l.principal_repaid, 0) AS loan_principal_repaid,
              coalesce(l.status, 'NONE') AS loan_status,
              greatest(0, least(t.cash, t.realized_pnl)) AS profit_cash_exempt,
              cfg.initial_capital, cfg.cash_rule_limit, ev.status AS event_status
       FROM teams t CROSS JOIN cfg CROSS JOIN ev
       LEFT JOIN brokers b ON b.id = t.broker_id
       LEFT JOIN hv ON hv.team_id = t.id
       LEFT JOIN loans l ON l.team_id = t.id)
SELECT base.*,
       (cash + holdings_value)::numeric(18,2) AS net_worth,
       (cash + holdings_value - initial_capital)::numeric(18,2) AS pnl,
       round((cash + holdings_value - initial_capital) * 100 / initial_capital, 4) AS return_pct,
       (holdings_value - cost_basis)::numeric(18,2) AS unrealized_pnl,
       (cash - profit_cash_exempt)::numeric(18,2) AS base_cash_counted,
       (cash - profit_cash_exempt) <= cash_rule_limit AS cash_rule_met,
       CASE WHEN event_status IN ('CLOSED', 'FINALIZED')
            THEN CASE WHEN (cash - profit_cash_exempt) <= cash_rule_limit THEN 'SATISFIED' ELSE 'NOT_SATISFIED' END
            ELSE 'PROVISIONAL' END AS cash_rule_status,
       CASE WHEN event_status IN ('CLOSED', 'FINALIZED')
            THEN CASE WHEN (cash - profit_cash_exempt) <= cash_rule_limit THEN 'ELIGIBLE' ELSE 'LOCKED' END
            ELSE 'PROVISIONAL' END AS portfolio_access,
       CASE WHEN event_status IN ('CLOSED', 'FINALIZED') THEN (cash - profit_cash_exempt) <= cash_rule_limit ELSE true END AS in_winner_pool,
       (loan_principal + loan_interest)::numeric(18,2) AS loan_liability
FROM base;

-- Ranked metrics with the official winner (highest Net Worth in the pool; tie -> team code ascending)
CREATE OR REPLACE FUNCTION jse_ranked_teams() RETURNS TABLE(m jsonb, rank_overall integer, rank_pool integer, is_winner boolean)
LANGUAGE sql STABLE AS $$
  WITH r AS (
    SELECT tm.*,
           row_number() OVER (ORDER BY net_worth DESC, code ASC)::integer AS rk,
           CASE WHEN in_winner_pool THEN row_number() OVER (PARTITION BY in_winner_pool ORDER BY net_worth DESC, code ASC)::integer END AS rkp
    FROM jse_team_metrics tm WHERE tm.active)
  SELECT to_jsonb(r) - 'initial_capital' - 'cash_rule_limit' - 'event_status', rk, rkp, coalesce(rkp = 1, false) FROM r
$$;

-- ---------------------------------------------------------------------------
-- Market (public)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_security_json(s securities) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', s.id, 'symbol', s.symbol, 'name', s.name, 'kind', s.kind, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
    'price', s.price, 'previous_price', s.previous_price, 'base_price', s.base_price,
    'change', s.price - s.previous_price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2),
    'day_change_pct', round(jse_pct(s.price, s.base_price), 2), 'lot_size', s.lot_size,
    'trade_count', s.trade_count, 'traded_value', s.traded_value, 'last_trade_at', s.last_trade_at, 'updated_at', s.updated_at)
$$;

CREATE OR REPLACE FUNCTION jse_market() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH ev AS (SELECT * FROM event_control WHERE id = 1),
       cfg AS (SELECT * FROM event_config WHERE id = 1),
       s AS (SELECT * FROM securities WHERE active),
       idx AS (SELECT coalesce(sum(price), 0) AS v, coalesce(sum(base_price), 0) AS b, coalesce(sum(previous_price), 0) AS p FROM s)
  SELECT jsonb_build_object(
    'success', true,
    'status', ev.status, 'status_changed_at', ev.status_changed_at, 'server_time', now(),
    'event_name', cfg.event_name,
    'index', jsonb_build_object('name', 'CMS INDEX', 'value', idx.v, 'base_value', idx.b, 'change', idx.v - idx.b,
                                'change_pct', CASE WHEN idx.b = 0 THEN 0 ELSE round((idx.v - idx.b) * 100 / idx.b, 2) END),
    'breadth', (SELECT jsonb_build_object('advances', count(*) FILTER (WHERE price > base_price), 'declines', count(*) FILTER (WHERE price < base_price),
                                          'unchanged', count(*) FILTER (WHERE price = base_price)) FROM s),
    'updated_at', (SELECT max(updated_at) FROM s),
    'price_band_pct', cfg.max_price_move_pct, 'price_tick', cfg.price_tick,
    'ipos', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'IPO'), '[]'::jsonb),
    'stocks', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'EQUITY'), '[]'::jsonb))
  FROM ev, cfg, idx
$$;

CREATE OR REPLACE FUNCTION jse_event_status() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'status', ev.status, 'status_changed_at', ev.status_changed_at, 'started_at', ev.started_at,
    'closed_at', ev.closed_at, 'finalized_at', ev.finalized_at, 'reset_count', ev.reset_count, 'server_time', now(),
    'event_name', cfg.event_name,
    'config', jsonb_build_object('initial_capital', cfg.initial_capital, 'institutional_cash', cfg.institutional_cash,
      'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size, 'ipo_lot_size', cfg.ipo_lot_size, 'price_tick', cfg.price_tick,
      'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value, 'max_price_move_pct', cfg.max_price_move_pct,
      'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate, 'min_cash_buffer', cfg.min_cash_buffer,
      'cash_rule_limit', cfg.cash_rule_limit, 'loans_enabled', cfg.loans_enabled, 'auto_loan_on_settlement', cfg.auto_loan_on_settlement,
      'participant_order_entry', cfg.participant_order_entry, 'institution_overdraft', cfg.institution_overdraft),
    'counts', (SELECT jsonb_build_object(
      'teams', (SELECT count(*) FROM teams WHERE active), 'stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
      'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active), 'brokers', (SELECT count(*) FROM brokers WHERE active),
      'exchange_pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
      'bank_pending', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
      'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
      'rejected', count(*) FILTER (WHERE status IN ('EXCHANGE_REJECTED', 'BANK_REJECTED')),
      'orders', count(*)) FROM orders))
  FROM event_control ev, event_config cfg WHERE ev.id = 1 AND cfg.id = 1
$$;

-- ---------------------------------------------------------------------------
-- Participant portfolios (all teams) and detail
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_portfolios(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_rows jsonb; v_status text; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT jsonb_agg(m || jsonb_build_object('rank', rank_overall, 'rank_in_pool', rank_pool, 'winner', is_winner) ORDER BY (m->>'seq')::integer)
  INTO v_rows FROM jse_ranked_teams();
  RETURN jsonb_build_object('success', true, 'event_status', v_status,
    'criterion', 'Winner = highest Net Worth (liquid cash + market value of holdings). Loans are not deducted. Ties go to the lower team code.',
    'pool_rule', CASE WHEN v_status IN ('CLOSED', 'FINALIZED') THEN 'Winner pool: teams that satisfy the ₹' || cfg.cash_rule_limit || ' closing cash rule'
                      ELSE 'Winner pool: all teams (provisional while the market is open)' END,
    'initial_capital', cfg.initial_capital, 'cash_rule_limit', cfg.cash_rule_limit,
    'stats', (SELECT jsonb_build_object('teams', count(*), 'total_net_worth', sum(net_worth), 'average_net_worth', round(avg(net_worth), 2),
              'highest_net_worth', max(net_worth), 'lowest_net_worth', min(net_worth), 'total_cash', sum(cash), 'total_holdings', sum(holdings_value),
              'cash_rule_met', count(*) FILTER (WHERE cash_rule_met), 'cash_rule_not_met', count(*) FILTER (WHERE NOT cash_rule_met),
              'profitable', count(*) FILTER (WHERE pnl > 0), 'short_sell_attempts', sum(short_sell_attempts),
              'cash_shortfall_attempts', sum(cash_shortfall_attempts), 'insufficient_balance_rejections', sum(insufficient_balance_rejections),
              'total_brokerage', sum(brokerage_paid), 'loans_outstanding', sum(loan_principal + loan_interest))
              FROM jse_team_metrics WHERE active),
    'winner', (SELECT m || jsonb_build_object('rank', rank_overall) FROM jse_ranked_teams() WHERE is_winner LIMIT 1),
    'teams', coalesce(v_rows, '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_portfolio_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE t teams%ROWTYPE; v_m jsonb; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM t.id THEN
    PERFORM jse_fail('FORBIDDEN', 'You can view only your own team.', 403);
  END IF;
  SELECT m || jsonb_build_object('rank', rank_overall, 'rank_in_pool', rank_pool, 'winner', is_winner) INTO v_m
  FROM jse_ranked_teams() WHERE (m->>'team_id')::integer = t.id;
  RETURN jsonb_build_object('success', true, 'team', v_m,
    'starting_capital', cfg.initial_capital, 'cash_limit', cfg.cash_rule_limit, 'min_cash_buffer', cfg.min_cash_buffer,
    'loan_limit', cfg.loan_max_principal, 'loan_rate', cfg.loan_interest_rate,
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', h.quantity, 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2), 'cost_basis', round(h.cost_basis, 2),
        'current_price', s.price, 'market_value', h.quantity * s.price, 'unrealized_pnl', round(h.quantity * s.price - h.cost_basis, 2),
        'change_pct', round(jse_pct(s.price, s.previous_price), 2)) ORDER BY h.quantity * s.price DESC)
      FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = t.id AND h.quantity > 0), '[]'::jsonb),
    'sold', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'security', s.name,
        'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, 'quantity', st.quantity, 'sell_price', st.price,
        'trade_value', st.trade_value, 'brokerage', st.brokerage, 'net_proceeds', st.trade_value - st.brokerage,
        'realized_pnl', st.realized_pnl, 'counterparty', CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institution' ELSE 'Market' END,
        'settled_at', st.settled_at) ORDER BY st.settled_at DESC)
      FROM settlements st JOIN orders o ON o.id = st.order_id JOIN securities s ON s.id = st.security_id
      WHERE st.team_id = t.id AND st.reversed_at IS NULL
        AND ((st.account_type = 'TEAM' AND st.side = 'SELL') OR (st.account_type = 'INSTITUTION' AND st.side = 'BUY'))), '[]'::jsonb),
    'bought', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', st.quantity, 'price', st.price, 'trade_value', st.trade_value, 'brokerage', st.brokerage, 'loan_drawn', st.loan_drawn,
        'settled_at', st.settled_at) ORDER BY st.settled_at DESC)
      FROM settlements st JOIN orders o ON o.id = st.order_id JOIN securities s ON s.id = st.security_id
      WHERE st.team_id = t.id AND st.reversed_at IS NULL
        AND ((st.account_type = 'TEAM' AND st.side = 'BUY') OR (st.account_type = 'INSTITUTION' AND st.side = 'SELL'))), '[]'::jsonb),
    'ipo_allotments', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'lots', al.lots, 'quantity', al.quantity, 'price', al.price, 'amount', al.amount))
      FROM ipo_allotments al JOIN securities s ON s.id = al.security_id WHERE al.team_id = t.id AND al.reversed_at IS NULL), '[]'::jsonb),
    'loan', (SELECT jsonb_build_object('original_principal', l.original_principal, 'current_principal', l.principal_outstanding,
        'interest', l.interest_outstanding, 'interest_charged', l.interest_charged, 'interest_paid', l.interest_paid,
        'principal_repaid', l.principal_repaid, 'total_liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'draws', l.draws,
        'repayment_status', CASE l.status WHEN 'NONE' THEN 'NO LOAN' WHEN 'REPAID' THEN 'REPAID' ELSE 'OUTSTANDING' END)
      FROM loans l WHERE l.team_id = t.id),
    'loan_transactions', coalesce((SELECT jsonb_agg(jsonb_build_object('kind', lt.kind, 'amount', lt.amount, 'automatic', lt.automatic,
        'order_no', o.order_no, 'note', lt.note, 'created_at', lt.created_at) ORDER BY lt.id DESC)
      FROM loan_transactions lt LEFT JOIN orders o ON o.id = lt.order_id WHERE lt.team_id = t.id), '[]'::jsonb),
    'short_sell_history', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'security', s.name,
        'quantity', r.quantity, 'holding_before', r.holding_before, 'stage', r.stage, 'status', o.status, 'created_at', r.created_at) ORDER BY r.created_at DESC)
      FROM risk_events r LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
      WHERE r.team_id = t.id AND r.kind = 'SHORT_SELL_ATTEMPT'), '[]'::jsonb),
    'cash_shortfall_history', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'security', s.name,
        'required_cash', r.required_amount, 'available_cash', r.available_cash, 'shortage', r.shortage, 'status', o.status, 'created_at', r.created_at) ORDER BY r.created_at DESC)
      FROM risk_events r LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
      WHERE r.team_id = t.id AND r.kind = 'CASH_SHORTFALL_ATTEMPT'), '[]'::jsonb),
    'insufficient_balance_history', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol,
        'required_cash', r.required_amount, 'available_cash', r.available_cash, 'shortage', r.shortage, 'note', r.note, 'status', o.status, 'created_at', r.created_at) ORDER BY r.created_at DESC)
      FROM risk_events r LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
      WHERE r.team_id = t.id AND r.kind = 'INSUFFICIENT_BALANCE_REJECTION'), '[]'::jsonb),
    'recent_orders', coalesce((SELECT jsonb_agg(x ORDER BY (x->>'id')::bigint DESC) FROM (
        SELECT jse_order_json(o.id) AS x FROM orders o WHERE o.team_id = t.id ORDER BY o.id DESC LIMIT 25) q), '[]'::jsonb),
    'recent_ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'type', c.entry_type, 'debit', c.debit, 'credit', c.credit,
        'balance_after', c.balance_after, 'note', c.note, 'order_no', o.order_no, 'created_at', c.created_at) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger WHERE team_id = t.id ORDER BY id DESC LIMIT 25) c LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Order tracking (filters + KPIs + pagination) and single-order workflow
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_tracking(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_status text := nullif(upper(trim(coalesce(p->>'status', ''))), '');
  v_side text := nullif(upper(trim(coalesce(p->>'side', ''))), '');
  v_kind text := nullif(upper(trim(coalesce(p->>'kind', ''))), '');
  v_acct text := nullif(upper(trim(coalesce(p->>'account', ''))), '');
  v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(200, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 50)));
  v_res jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  IF a->>'role' = 'PARTICIPANT' THEN
    v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN
    SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team'));
    IF v_team IS NULL THEN v_team := -1; END IF;
  END IF;
  IF v_status = 'OPEN' THEN v_status := NULL; END IF;

  WITH f AS (
    SELECT o.*, s.symbol, s.name AS security_name, s.kind, t.code AS team_code, t.name AS team_name, b.code AS broker_code, i.code AS institution_code
    FROM orders o JOIN securities s ON s.id = o.security_id JOIN teams t ON t.id = o.team_id
    LEFT JOIN brokers b ON b.id = o.broker_id LEFT JOIN institutions i ON i.id = o.institution_id
    WHERE (v_team IS NULL OR o.team_id = v_team)
      AND (v_status IS NULL OR o.status = v_status OR (v_status = 'REJECTED' AND o.status IN ('EXCHANGE_REJECTED', 'BANK_REJECTED'))
           OR (v_status = 'PENDING' AND o.status IN ('EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING')))
      AND (v_side IS NULL OR o.side = v_side)
      AND (v_kind IS NULL OR s.kind = v_kind OR (v_kind = 'STOCK' AND s.kind = 'EQUITY'))
      AND (v_acct IS NULL OR o.account_type = v_acct)
      AND (v_q IS NULL OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR s.symbol ILIKE '%' || v_q || '%'
           OR s.name ILIKE '%' || v_q || '%' OR coalesce(b.code, '') ILIKE '%' || v_q || '%'))
  SELECT jsonb_build_object('success', true,
    'kpis', (SELECT jsonb_build_object('orders', count(*),
        'exchange_pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
        'exchange_approved', count(*) FILTER (WHERE status = 'EXCHANGE_APPROVED'),
        'bank_pending', count(*) FILTER (WHERE status = 'BANK_PENDING'),
        'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'exchange_rejected', count(*) FILTER (WHERE status = 'EXCHANGE_REJECTED'),
        'bank_rejected', count(*) FILTER (WHERE status = 'BANK_REJECTED'),
        'buy', count(*) FILTER (WHERE side = 'BUY'), 'sell', count(*) FILTER (WHERE side = 'SELL'),
        'trade_value', coalesce(sum(trade_value), 0), 'settled_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'short_sell_flags', count(*) FILTER (WHERE short_sell_flag), 'cash_shortfall_flags', count(*) FILTER (WHERE cash_shortfall_flag)) FROM f),
    'page', v_page, 'page_size', v_size,
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', x.id, 'order_no', x.order_no, 'account_type', x.account_type, 'team', x.team_code,
        'team_name', x.team_name, 'broker', x.broker_code, 'institution', x.institution_code, 'symbol', x.symbol, 'security', x.security_name,
        'kind', x.kind, 'side', x.side, 'quantity', x.quantity, 'price', x.price, 'trade_value', x.trade_value, 'brokerage', x.brokerage,
        'settlement_amount', x.settlement_amount, 'status', x.status, 'reject_code', x.reject_code, 'reject_reason', x.reject_reason,
        'short_sell_flag', x.short_sell_flag, 'cash_shortfall_flag', x.cash_shortfall_flag, 'created_by', x.created_by_name,
        'created_at', x.created_at, 'exchange_by', x.exchange_by_name, 'exchange_at', x.exchange_at, 'bank_by', x.bank_by_name,
        'bank_at', x.bank_at, 'updated_at', x.updated_at) ORDER BY x.updated_at DESC, x.id DESC)
      FROM (SELECT * FROM f ORDER BY f.updated_at DESC, f.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) x), '[]'::jsonb))
  INTO v_res;
  RETURN v_res;
END $$;

CREATE OR REPLACE FUNCTION jse_order_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE o orders%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', '')));
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM o.team_id THEN PERFORM jse_fail('FORBIDDEN', 'Not your order.', 403); END IF;
  RETURN jsonb_build_object('success', true, 'order', jse_order_json(o.id),
    'events', coalesce((SELECT jsonb_agg(jsonb_build_object('event', e.event, 'from', e.from_status, 'to', e.to_status, 'actor', e.actor_name,
        'role', e.actor_role, 'note', e.note, 'data', e.data, 'at', e.created_at) ORDER BY e.id) FROM order_events e WHERE e.order_id = o.id), '[]'::jsonb),
    'settlement', (SELECT to_jsonb(st) FROM settlements st WHERE st.order_id = o.id AND st.reversed_at IS NULL),
    'risk', coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) FROM risk_events r WHERE r.order_id = o.id), '[]'::jsonb),
    'audit', coalesce((SELECT jsonb_agg(jsonb_build_object('action', al.action, 'actor', al.actor_username, 'role', al.actor_role,
        'details', al.details, 'at', al.created_at) ORDER BY al.id) FROM audit_log al WHERE al.order_id = o.id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Exchange and Bank queues with independent pre-checks
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_exchange_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'VIEWER');
  RETURN jsonb_build_object('success', true,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'holding', av.holding, 'open_sell_other', av.open_sell, 'available_qty', av.available,
        'free_cash', CASE WHEN o.account_type = 'TEAM' THEN jse_available_cash(o.team_id, o.id) END,
        'market_price', s.price, 'price_diff_pct', round(jse_pct(o.price, s.price), 2),
        'short_sell_risk', (o.account_type = 'TEAM' AND o.side = 'SELL' AND o.quantity > av.available),
        'cash_risk', (o.account_type = 'TEAM' AND o.side = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id)),
        'age_seconds', extract(epoch FROM now() - o.created_at)::integer) AS j
      FROM orders o JOIN securities s ON s.id = o.security_id
      CROSS JOIN LATERAL jse_available_qty(o.team_id, o.security_id, o.id) av
      WHERE o.status = 'EXCHANGE_PENDING' ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.exchange_at DESC) FROM (
      SELECT id, exchange_at FROM orders WHERE exchange_at IS NOT NULL ORDER BY exchange_at DESC LIMIT 25) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object('pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
       'approved_today', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING', 'BANK_SETTLED', 'BANK_REJECTED') AND exchange_at IS NOT NULL),
       'rejected', count(*) FILTER (WHERE status = 'EXCHANGE_REJECTED')) FROM orders));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'min_cash_buffer', cfg.min_cash_buffer, 'loan_limit', cfg.loan_max_principal,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'claimed_by', o.bank_claimed_name, 'claimed_at', o.bank_claimed_at,
        'team_side', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN 'BUY' ELSE 'SELL' END,
        'cash', t.cash, 'holding', coalesce(h.quantity, 0), 'market_price', s.price,
        'price_ok', abs(o.price - s.price) <= s.price * cfg.max_price_move_pct / 100,
        'required', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL')
                         THEN round(o.quantity * o.price, 2) + CASE WHEN o.account_type = 'TEAM' OR cfg.institution_brokerage THEN round(o.quantity * o.price * cfg.brokerage_rate, 2) ELSE 0 END END,
        'loan_room', greatest(0, cfg.loan_max_principal - coalesce(l.original_principal, 0)),
        'institution_holding', CASE WHEN o.account_type = 'INSTITUTION' THEN coalesce(ih.quantity, 0) END,
        'age_seconds', extract(epoch FROM now() - coalesce(o.exchange_at, o.created_at))::integer) AS j
      FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
      LEFT JOIN holdings h ON h.team_id = o.team_id AND h.security_id = o.security_id
      LEFT JOIN loans l ON l.team_id = o.team_id
      LEFT JOIN institutional_holdings ih ON ih.institution_id = o.institution_id AND ih.security_id = o.security_id
      WHERE o.status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) || jsonb_build_object('loan_drawn', x.loan_drawn) ORDER BY x.bank_at DESC) FROM (
      SELECT o.id, o.bank_at, coalesce(st.loan_drawn, 0) AS loan_drawn FROM orders o LEFT JOIN settlements st ON st.order_id = o.id AND st.reversed_at IS NULL
      WHERE o.bank_at IS NOT NULL ORDER BY o.bank_at DESC LIMIT 25) x), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'rejected', count(*) FILTER (WHERE status = 'BANK_REJECTED'),
       'settled_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
       'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
       'insufficient_balance', (SELECT count(*) FROM risk_events WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION'),
       'loans_outstanding', (SELECT coalesce(sum(principal_outstanding), 0) FROM loans),
       'interest_outstanding', (SELECT coalesce(sum(interest_outstanding), 0) FROM loans),
       'interest_earned', (SELECT coalesce(sum(interest_charged), 0) FROM loans)) FROM orders));
END $$;

-- Loan overview for the Bank desk
CREATE OR REPLACE FUNCTION jse_loans(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'limit', cfg.loan_max_principal, 'rate', cfg.loan_interest_rate, 'min_cash_buffer', cfg.min_cash_buffer,
    'loans', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'cash', t.cash, 'original_principal', l.original_principal,
        'principal', l.principal_outstanding, 'interest', l.interest_outstanding, 'liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'status', l.status,
        'can_draw', cfg.loans_enabled AND t.cash <= cfg.min_cash_buffer AND l.original_principal < cfg.loan_max_principal,
        'max_repay', least(l.principal_outstanding + l.interest_outstanding, greatest(0, t.cash - cfg.min_cash_buffer))) ORDER BY t.seq)
      FROM teams t JOIN loans l ON l.team_id = t.id WHERE l.status <> 'NONE' OR t.cash <= cfg.min_cash_buffer), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Cash ledger with reconciliation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_cash(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_type text := nullif(upper(trim(coalesce(p->>'type', ''))), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
  v_q text := nullif(trim(coalesce(p->>'q', '')), '');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER', 'PARTICIPANT', 'EXCHANGE');
  IF a->>'role' = 'PARTICIPANT' THEN v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1);
  END IF;
  RETURN jsonb_build_object('success', true, 'page', v_page, 'page_size', v_size,
    'summary', (SELECT jsonb_build_object('entries', count(*), 'debits', coalesce(sum(debit), 0), 'credits', coalesce(sum(credit), 0),
        'by_type', (SELECT coalesce(jsonb_object_agg(entry_type, jsonb_build_object('count', n, 'debit', d, 'credit', c)), '{}'::jsonb)
                    FROM (SELECT entry_type, count(*) n, sum(debit) d, sum(credit) c FROM cash_ledger
                          WHERE (v_team IS NULL OR team_id = v_team) GROUP BY entry_type) z))
      FROM cash_ledger WHERE (v_team IS NULL OR team_id = v_team) AND (v_type IS NULL OR entry_type = v_type)),
    'reconciliation', (SELECT jsonb_build_object('teams_checked', count(*), 'mismatches', count(*) FILTER (WHERE abs(t.cash - x.net) > 0.001 OR abs(t.cash - x.last_bal) > 0.001),
        'mismatched_teams', coalesce(jsonb_agg(t.code) FILTER (WHERE abs(t.cash - x.net) > 0.001 OR abs(t.cash - x.last_bal) > 0.001), '[]'::jsonb),
        'ok', count(*) FILTER (WHERE abs(t.cash - x.net) > 0.001 OR abs(t.cash - x.last_bal) > 0.001) = 0)
      FROM teams t JOIN LATERAL (
        SELECT coalesce(sum(credit) - sum(debit), 0) AS net,
               coalesce((SELECT balance_after FROM cash_ledger c2 WHERE c2.team_id = t.id ORDER BY c2.id DESC LIMIT 1), 0) AS last_bal
        FROM cash_ledger c WHERE c.team_id = t.id) x ON true
      WHERE v_team IS NULL OR t.id = v_team),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'created_at', c.created_at, 'team', t.code, 'order_no', o.order_no,
        'type', c.entry_type, 'debit', c.debit, 'credit', c.credit, 'balance_after', c.balance_after, 'note', c.note, 'actor', c.actor_name) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger c0 WHERE (v_team IS NULL OR c0.team_id = v_team) AND (v_type IS NULL OR c0.entry_type = v_type)
              AND (v_q IS NULL OR c0.note ILIKE '%' || v_q || '%')
            ORDER BY c0.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) c
      JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_audit_log(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_action text := nullif(upper(trim(coalesce(p->>'action', ''))), '');
  v_team integer; v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'EXCHANGE', 'BANK');
  IF coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1); END IF;
  RETURN jsonb_build_object('success', true, 'page', v_page, 'page_size', v_size,
    'actions', coalesce((SELECT jsonb_agg(DISTINCT action) FROM audit_log), '[]'::jsonb),
    'total', (SELECT count(*) FROM audit_log al WHERE (v_action IS NULL OR al.action = v_action) AND (v_team IS NULL OR al.team_id = v_team)),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', al.id, 'created_at', al.created_at, 'actor', al.actor_username, 'email', al.actor_email,
        'role', al.actor_role, 'action', al.action, 'entity', al.entity, 'entity_id', al.entity_id, 'team', t.code, 'order_no', o.order_no,
        'before', al.before_state, 'after', al.after_state, 'details', al.details, 'ip', al.ip, 'session', al.session_id) ORDER BY al.id DESC)
      FROM (SELECT * FROM audit_log a0 WHERE (v_action IS NULL OR a0.action = v_action) AND (v_team IS NULL OR a0.team_id = v_team)
              AND (v_q IS NULL OR a0.entity_id ILIKE '%' || v_q || '%' OR a0.actor_username ILIKE '%' || v_q || '%' OR a0.details::text ILIKE '%' || v_q || '%')
            ORDER BY a0.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) al
      LEFT JOIN teams t ON t.id = al.team_id LEFT JOIN orders o ON o.id = al.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Broker commission (ranked)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_commissions(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'VIEWER', 'INSTITUTIONAL');
  RETURN jsonb_build_object('success', true, 'rate', (SELECT brokerage_rate FROM event_config WHERE id = 1),
    'brokers', coalesce((SELECT jsonb_agg(x ORDER BY (x->>'rank')::integer) FROM (
      SELECT jsonb_build_object('rank', row_number() OVER (ORDER BY coalesce(c.amount, 0) DESC, b.code), 'broker', b.code, 'name', b.name,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id),
        'orders', coalesce(c.n, 0), 'buy_orders', coalesce(c.nb, 0), 'sell_orders', coalesce(c.ns, 0),
        'buy_volume', coalesce(c.bv, 0), 'sell_volume', coalesce(c.sv, 0), 'buy_quantity', coalesce(c.bq, 0), 'sell_quantity', coalesce(c.sq, 0),
        'total_trade_value', coalesce(c.tv, 0), 'brokerage_earned', coalesce(c.amount, 0),
        'pending_orders', (SELECT count(*) FROM orders o WHERE o.broker_id = b.id AND o.status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING'))) AS x
      FROM brokers b LEFT JOIN (
        SELECT bc.broker_id, count(*) n, count(*) FILTER (WHERE bc.side = 'BUY') nb, count(*) FILTER (WHERE bc.side = 'SELL') ns,
               sum(bc.trade_value) FILTER (WHERE bc.side = 'BUY') bv, sum(bc.trade_value) FILTER (WHERE bc.side = 'SELL') sv,
               sum(o.quantity) FILTER (WHERE bc.side = 'BUY') bq, sum(o.quantity) FILTER (WHERE bc.side = 'SELL') sq,
               sum(bc.trade_value) tv, sum(bc.amount) amount
        FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id WHERE bc.reversed_at IS NULL GROUP BY bc.broker_id) c ON c.broker_id = b.id) q), '[]'::jsonb),
    'totals', (SELECT jsonb_build_object('orders', count(*), 'trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(amount), 0))
               FROM broker_commissions WHERE reversed_at IS NULL));
END $$;

-- ---------------------------------------------------------------------------
-- Market news list (public) and Market Intelligence (public)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_news_list(p jsonb) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'news', coalesce(jsonb_agg(x ORDER BY (x->>'id')::bigint DESC), '[]'::jsonb))
  FROM (SELECT jsonb_build_object('id', n.id, 'symbol', s.symbol, 'name', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
          'mood', replace(n.mood, '_', ' '), 'headline', n.headline, 'requested_pct', n.requested_pct, 'applied_pct', round(n.applied_pct, 2),
          'previous_price', n.previous_price, 'new_price', n.new_price, 'reversed', n.reversed_at IS NOT NULL,
          'created_by', n.created_by_name, 'created_at', n.created_at) AS x
        FROM market_news n JOIN securities s ON s.id = n.security_id
        ORDER BY n.id DESC LIMIT least(200, greatest(1, coalesce(nullif(p->>'limit', '')::integer, 30)))) q
$$;

CREATE OR REPLACE FUNCTION jse_insights() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH s AS (SELECT * FROM securities WHERE active),
       ev AS (SELECT status FROM event_control WHERE id = 1),
       rk AS (SELECT * FROM jse_ranked_teams()),
       tm AS (SELECT * FROM jse_team_metrics WHERE active)
  SELECT jsonb_build_object('success', true, 'status', ev.status, 'server_time', now(),
    'index', (SELECT jse_market()->'index'),
    'breadth', (SELECT jsonb_build_object('advances', count(*) FILTER (WHERE price > base_price), 'declines', count(*) FILTER (WHERE price < base_price),
               'unchanged', count(*) FILTER (WHERE price = base_price)) FROM s),
    'top_gainers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, x.base_price) DESC) FROM (SELECT * FROM s WHERE price > base_price ORDER BY jse_pct(price, base_price) DESC LIMIT 5) x), '[]'::jsonb),
    'top_losers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, x.base_price)) FROM (SELECT * FROM s WHERE price < base_price ORDER BY jse_pct(price, base_price) LIMIT 5) x), '[]'::jsonb),
    'most_traded', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.traded_value DESC) FROM (SELECT * FROM s WHERE trade_count > 0 ORDER BY traded_value DESC LIMIT 8) x), '[]'::jsonb),
    'net_worth', (SELECT jsonb_build_object('highest', max(net_worth), 'average', round(avg(net_worth), 2), 'lowest', min(net_worth),
                  'total', sum(net_worth), 'teams', count(*)) FROM tm),
    'totals', (SELECT jsonb_build_object('trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(brokerage), 0), 'trades', count(*),
                  'institutional_trades', count(*) FILTER (WHERE account_type = 'INSTITUTION'))
               FROM settlements WHERE reversed_at IS NULL),
    'orders', (SELECT jsonb_build_object('total', count(*), 'pending', count(*) FILTER (WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
                  'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'), 'rejected', count(*) FILTER (WHERE status IN ('EXCHANGE_REJECTED','BANK_REJECTED'))) FROM orders),
    'winner_pool', CASE WHEN ev.status IN ('CLOSED', 'FINALIZED') THEN 'Teams satisfying the closing cash rule' ELSE 'All teams (provisional)' END,
    'winner', (SELECT jsonb_build_object('team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric,
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2)) FROM rk WHERE is_winner LIMIT 1),
    'leaderboard', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_pool, 'team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric,
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2), 'cash_rule_met', (m->>'cash_rule_met')::boolean) ORDER BY rank_pool)
                  FROM rk WHERE rank_pool IS NOT NULL AND rank_pool <= 10), '[]'::jsonb),
    'latest_news', (SELECT jse_news_list('{"limit":8}'::jsonb)->'news'),
    'institutional', (SELECT jsonb_build_object(
        'accounts', coalesce((SELECT jsonb_agg(jsonb_build_object('code', i.code, 'name', i.name, 'cash', i.cash,
            'holdings_value', coalesce((SELECT sum(ih.quantity * s2.price) FROM institutional_holdings ih JOIN securities s2 ON s2.id = ih.security_id WHERE ih.institution_id = i.id), 0)))
            FROM institutions i), '[]'::jsonb),
        'recent', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'side', o.side, 'symbol', s2.symbol, 'quantity', o.quantity,
            'price', o.price, 'trade_value', o.trade_value, 'status', o.status, 'counterparty', t.code, 'at', o.updated_at) ORDER BY o.updated_at DESC)
            FROM (SELECT * FROM orders WHERE account_type = 'INSTITUTION' ORDER BY updated_at DESC LIMIT 8) o
            JOIN securities s2 ON s2.id = o.security_id JOIN teams t ON t.id = o.team_id), '[]'::jsonb))),
    'tape', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'side', st.side, 'quantity', st.quantity, 'price', st.price,
              'price_before', st.price_before, 'account_type', st.account_type, 'at', st.settled_at) ORDER BY st.settled_at DESC)
              FROM (SELECT * FROM settlements WHERE reversed_at IS NULL ORDER BY id DESC LIMIT 12) st JOIN securities s2 ON s2.id = st.security_id), '[]'::jsonb))
  FROM ev
$$;

-- ---------------------------------------------------------------------------
-- Institutional desk
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_institutional(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE i institutions%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO i FROM institutions WHERE id = coalesce(nullif(p->>'institution_id', '')::integer, nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'institutions', (SELECT jsonb_agg(jsonb_build_object('id', x.id, 'code', x.code, 'name', x.name) ORDER BY x.id) FROM institutions x),
    'account', jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name, 'initial_cash', i.initial_cash, 'cash', i.cash,
       'holdings_value', coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0),
       'net_worth', i.cash + coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0),
       'pnl', i.cash + coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0) - i.initial_cash),
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', ih.quantity, 'avg_price', round(ih.cost_basis / nullif(ih.quantity, 0), 2), 'current_price', s.price,
        'market_value', ih.quantity * s.price, 'unrealized_pnl', round(ih.quantity * s.price - ih.cost_basis, 2)) ORDER BY ih.quantity * s.price DESC)
      FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id AND ih.quantity > 0), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(o.id) ORDER BY o.id DESC) FROM (SELECT id FROM orders WHERE institution_id = i.id ORDER BY id DESC LIMIT 60) o), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('orders', count(*), 'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'pending', count(*) FILTER (WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
       'bought_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'BUY'), 0),
       'sold_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'SELL'), 0)) FROM orders WHERE institution_id = i.id),
    'ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('type', l.entry_type, 'debit', l.debit, 'credit', l.credit, 'balance_after', l.balance_after,
        'note', l.note, 'at', l.created_at) ORDER BY l.id DESC) FROM (SELECT * FROM institution_ledger WHERE institution_id = i.id ORDER BY id DESC LIMIT 30) l), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Event admin dashboard state
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_admin_state(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jse_event_status() || jsonb_build_object(
    'config_full', (SELECT to_jsonb(c) FROM event_config c WHERE id = 1),
    'stats', (SELECT jsonb_build_object('total_trade_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'total_brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'pending_orders', count(*) FILTER (WHERE status IN ('EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
        'settled_orders', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected_orders', count(*) FILTER (WHERE status IN ('EXCHANGE_REJECTED','BANK_REJECTED')),
        'institutional_orders', count(*) FILTER (WHERE account_type = 'INSTITUTION'),
        'news_items', (SELECT count(*) FROM market_news WHERE reversed_at IS NULL),
        'loans_outstanding', (SELECT coalesce(sum(principal_outstanding + interest_outstanding), 0) FROM loans),
        'risk', (SELECT jsonb_build_object('short_sell', count(*) FILTER (WHERE kind = 'SHORT_SELL_ATTEMPT'),
                   'cash_shortfall', count(*) FILTER (WHERE kind = 'CASH_SHORTFALL_ATTEMPT'),
                   'insufficient_balance', count(*) FILTER (WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION')) FROM risk_events)) FROM orders),
    'market', (SELECT jsonb_build_object('index', jse_market()->'index', 'breadth', jse_market()->'breadth')),
    'journal', coalesce((SELECT jsonb_agg(jsonb_build_object('id', j.id, 'action', j.action, 'summary', j.summary, 'actor', j.actor_name, 'at', j.created_at,
        'undone_at', j.undone_at, 'undone_by', j.undone_by, 'redone_at', j.redone_at, 'redone_by', j.redone_by,
        'superseded', coalesce((j.payload->>'superseded')::boolean, false),
        'state', CASE WHEN coalesce((j.payload->>'superseded')::boolean, false) THEN 'REDONE'
                      WHEN j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN 'UNDONE' ELSE 'ACTIVE' END) ORDER BY j.id DESC)
      FROM (SELECT * FROM action_journal ORDER BY id DESC LIMIT 40) j), '[]'::jsonb),
    'allotments', (SELECT jsonb_build_object('rows', count(*), 'teams', count(DISTINCT team_id), 'amount', coalesce(sum(amount), 0),
        'by_ipo', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'teams', z.n, 'lots', z.lots, 'shares', z.q, 'amount', z.amt) ORDER BY s.display_order)
                  FROM (SELECT security_id, count(*) n, sum(lots) lots, sum(quantity) q, sum(amount) amt FROM ipo_allotments WHERE reversed_at IS NULL GROUP BY security_id) z
                  JOIN securities s ON s.id = z.security_id), '[]'::jsonb))
      FROM ipo_allotments WHERE reversed_at IS NULL),
    'brokers', (SELECT jsonb_agg(jsonb_build_object('code', code, 'name', name) ORDER BY code) FROM brokers),
    'users', (SELECT jsonb_object_agg(role, n) FROM (SELECT role, count(*) n FROM app_users WHERE active GROUP BY role) u));
END $$;

-- ---------------------------------------------------------------------------
-- Certificates / final report
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_certificates(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1),
    'status', (SELECT status FROM event_control WHERE id = 1), 'generated_at', now(),
    'ranking', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_overall, 'rank_in_pool', rank_pool, 'winner', is_winner, 'team', m->>'code',
        'name', m->>'name', 'section', m->>'section', 'members', m->>'members', 'broker', m->>'broker', 'net_worth', (m->>'net_worth')::numeric,
        'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2), 'cash_rule_met', (m->>'cash_rule_met')::boolean,
        'cash_rule_status', m->>'cash_rule_status') ORDER BY coalesce(rank_pool, 100000 + rank_overall))
      FROM jse_ranked_teams()), '[]'::jsonb),
    'top_brokers', (SELECT jse_commissions(a, '{}'::jsonb)->'brokers'));
END $$;

CREATE OR REPLACE FUNCTION jse_reports(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'generated_at', now(),
    'event', jse_event_status(),
    'portfolios', jse_portfolios(a, '{}'::jsonb) - 'teams',
    'commissions', jse_commissions(a, '{}'::jsonb),
    'insights', jse_insights(),
    'reconciliation', jse_cash(a, '{"page_size":10}'::jsonb)->'reconciliation');
END $$;

INSERT INTO schema_migrations(version) VALUES ('004_reads');
