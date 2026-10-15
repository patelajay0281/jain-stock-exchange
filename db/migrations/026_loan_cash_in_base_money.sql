-- 026: Show borrowed funds still held as cash in the Base Cash Left figure. Loan liability remains separately tracked.
CREATE OR REPLACE FUNCTION public.jse_portfolio_detail(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE t teams%ROWTYPE; v_m jsonb; cfg event_config%ROWTYPE; b brokers%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'BROKER', 'PARTICIPANT');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO t FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')));
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM t.id THEN
    PERFORM jse_fail('FORBIDDEN', 'You can view only your own team.', 403);
  END IF;
  IF a->>'role' = 'BROKER' AND t.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
    PERFORM jse_fail('FORBIDDEN', 'You can view only the teams assigned to you.', 403);
  END IF;
  SELECT * INTO b FROM brokers WHERE id = t.broker_id;
  SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) INTO v_m
  FROM jse_ranked_teams() WHERE (m->>'team_id')::integer = t.id;
  RETURN jsonb_build_object('success', true, 'team', v_m,
    'identity', jsonb_build_object('code', t.code, 'name', t.name, 'section', t.section, 'members', t.members,
      'name_meaning', (SELECT meaning FROM team_name_pool WHERE lower(name) = lower(t.name)),
      'name_category', (SELECT category FROM team_name_pool WHERE lower(name) = lower(t.name))),
    'broker', CASE WHEN b.id IS NULL THEN NULL ELSE jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk) END,
    -- the participant capital strip (one server-side calculation): own starting capital vs the loan credit facility
    'capital', jsonb_build_object('base_capital', cfg.initial_capital, 'loan_sanctioned', cfg.loan_max_principal,
      'loan_available', CASE WHEN cfg.loans_enabled THEN greatest(0, cfg.loan_max_principal - (v_m->>'loan_original')::numeric) ELSE 0 END,
      'base_money_left', greatest(0, (v_m->>'cash')::numeric - (v_m->>'profit_cash_exempt')::numeric),
      'liquid_cash', (v_m->>'cash')::numeric, 'holdings_value', (v_m->>'holdings_value')::numeric, 'net_worth', (v_m->>'net_worth')::numeric,
      'portfolio_pnl', (v_m->>'pnl')::numeric, 'realized_pnl', (v_m->>'realized_pnl')::numeric, 'unrealized_pnl', (v_m->>'unrealized_pnl')::numeric,
      'brokerage_paid', (v_m->>'brokerage_paid')::numeric, 'max_financing', cfg.initial_capital + cfg.loan_max_principal),
    'rules', jsonb_build_object('starting_capital', cfg.initial_capital, 'cash_limit', cfg.cash_rule_limit, 'loan_limit', cfg.loan_max_principal,
      'loan_rate', cfg.loan_interest_rate, 'brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades, 'loan_repayment_required', cfg.loan_repayment_required),
    'assessment', jsonb_build_object('buy', (v_m->>'settled_buys')::integer, 'sell', (v_m->>'settled_sells')::integer,
      'min_buy', cfg.min_buy_trades, 'min_sell', cfg.min_sell_trades, 'met', (v_m->>'assessment_met')::boolean,
      'basis', 'Settled listed-stock trades of your team (including trades with an institutional counterparty, counted from your side). IPO allotments, rejected and unsettled orders do not count.'),
    'eligibility', jsonb_build_object('eligible', (v_m->>'eligible')::boolean, 'status', v_m->>'eligibility_status', 'gaps', v_m->'eligibility_gaps',
      'final', (v_m->>'final_evaluation')::boolean),
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', h.quantity, 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2), 'cost_basis', round(h.cost_basis, 2),
        'current_price', s.price, 'market_value', h.quantity * s.price, 'unrealized_pnl', round(h.quantity * s.price - h.cost_basis, 2),
        'change_pct', round(jse_pct(s.price, s.previous_price), 2), 'listed', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL) ORDER BY h.quantity * s.price DESC)
      FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = t.id AND h.quantity > 0), '[]'::jsonb),
    'sold', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'security', s.name,
        'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, 'quantity', st.quantity, 'sell_price', st.price,
        'trade_value', st.trade_value, 'brokerage', st.brokerage, 'net_proceeds', st.trade_value - st.brokerage,
        'realized_pnl', st.realized_pnl, 'counterparty', CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
        'settled_at', st.settled_at) ORDER BY st.settled_at DESC)
      FROM settlements st JOIN orders o ON o.id = st.order_id JOIN securities s ON s.id = st.security_id
      WHERE st.team_id = t.id AND st.reversed_at IS NULL
        AND ((st.account_type = 'TEAM' AND st.side = 'SELL') OR (st.account_type = 'INSTITUTION' AND st.side = 'BUY'))), '[]'::jsonb),
    'bought', coalesce((SELECT jsonb_agg(jsonb_build_object('order_no', o.order_no, 'symbol', s.symbol, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', st.quantity, 'price', st.price, 'trade_value', st.trade_value, 'brokerage', st.brokerage, 'loan_drawn', st.loan_drawn,
        'counterparty', CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
        'settled_at', st.settled_at) ORDER BY st.settled_at DESC)
      FROM settlements st JOIN orders o ON o.id = st.order_id JOIN securities s ON s.id = st.security_id
      WHERE st.team_id = t.id AND st.reversed_at IS NULL
        AND ((st.account_type = 'TEAM' AND st.side = 'BUY') OR (st.account_type = 'INSTITUTION' AND st.side = 'SELL'))), '[]'::jsonb),
    'ipo_allotments', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'lots', al.lots, 'quantity', al.quantity, 'price', al.price, 'amount', al.amount))
      FROM ipo_allotments al JOIN securities s ON s.id = al.security_id WHERE al.team_id = t.id AND al.reversed_at IS NULL), '[]'::jsonb),
    'ipo_applications', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'lots', ap.lots, 'amount', ap.amount, 'status', ap.status))
      FROM ipo_applications ap JOIN securities s ON s.id = ap.security_id WHERE ap.team_id = t.id), '[]'::jsonb),
    'loan', (SELECT jsonb_build_object('original_principal', l.original_principal, 'current_principal', l.principal_outstanding,
        'interest', l.interest_outstanding, 'interest_charged', l.interest_charged, 'interest_paid', l.interest_paid,
        'principal_repaid', l.principal_repaid, 'total_liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'draws', l.draws,
        'repaid', l.principal_outstanding + l.interest_outstanding = 0,
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
    'slips', coalesce((SELECT jsonb_agg(jsonb_build_object('slip_no', sl.slip_no, 'order_no', o.order_no, 'issued_at', sl.issued_at, 'symbol', s.symbol,
        'side', o.side, 'quantity', o.quantity, 'price', o.executed_price, 'status', o.status) ORDER BY sl.id DESC)
      FROM (SELECT * FROM trading_slips WHERE order_id IN (SELECT id FROM orders WHERE team_id = t.id) ORDER BY id DESC LIMIT 25) sl
      JOIN orders o ON o.id = sl.order_id JOIN securities s ON s.id = o.security_id), '[]'::jsonb),
    'recent_ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'type', c.entry_type, 'debit', c.debit, 'credit', c.credit,
        'balance_after', c.balance_after, 'note', c.note, 'order_no', o.order_no, 'created_at', c.created_at) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger WHERE team_id = t.id ORDER BY id DESC LIMIT 30) c LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $function$
;
