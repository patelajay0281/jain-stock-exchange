-- JAIN STOCK EXCHANGE (JSE) v272
-- 005_exports.sql: one function per export sheet; rows are returned as arrays for compact transfer.

CREATE OR REPLACE FUNCTION jse_export_sheets() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT '[
    ["winner","Winner"],["teams","Team Details"],["participants","Participant Details"],["brokers","Broker Details"],
    ["cash","Cash"],["holdings","Holdings"],["sold_stocks","Sold Stocks"],["sold_ipos","Sold IPOs"],
    ["networth","Net Worth & PL"],["loans","Loans & Interest"],["cash_rule","Cash Rule"],
    ["short_sell","Short Selling Attempts"],["cash_shortfall","Cash Shortfall Attempts"],["insufficient_balance","Insufficient Balance Rejections"],
    ["orders","Order Tracking"],["rejected","Rejected Orders"],["trades","Trade History"],["ledger","Cash Ledger"],
    ["commission","Broker Commission"],["institutional","Institutional Investors"],["news","Market News"],
    ["prices","Price History"],["audit","Audit Logs"]]'::jsonb
$$;

CREATE OR REPLACE FUNCTION jse_export(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_sheet text := lower(coalesce(p->>'sheet', '')); v_cols jsonb; v_rows jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_sheet = 'winner' THEN
    v_cols := '["Rank (winner pool)","Overall rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","₹50K Rule","Cash Rule Status","Winner"]';
    SELECT jsonb_agg(jsonb_build_array(rank_pool, rank_overall, m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2),
             CASE WHEN (m->>'cash_rule_met')::boolean THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, m->>'cash_rule_status', CASE WHEN is_winner THEN 'WINNER' ELSE '' END)
           ORDER BY coalesce(rank_pool, 100000 + rank_overall)) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'teams' THEN
    v_cols := '["Team","Team name","Section","Members","Broker","Broker name","Active"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, t.members, b.code, b.name, t.active) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id;
  ELSIF v_sheet = 'participants' THEN
    v_cols := '["Team","Team name","Section","Members","Login","Login active","Last login"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, t.members, u.username, u.active, u.last_login_at) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN app_users u ON u.team_id = t.id AND u.role = 'PARTICIPANT';
  ELSIF v_sheet = 'brokers' THEN
    v_cols := '["Rank","Broker","Name","Teams","Orders","Buy orders","Sell orders","Buy value","Sell value","Total trade value","Brokerage earned"]';
    SELECT jsonb_agg(jsonb_build_array((x->>'rank')::integer, x->>'broker', x->>'name', (x->>'teams')::integer, (x->>'orders')::integer, (x->>'buy_orders')::integer,
             (x->>'sell_orders')::integer, (x->>'buy_volume')::numeric, (x->>'sell_volume')::numeric, (x->>'total_trade_value')::numeric, (x->>'brokerage_earned')::numeric)
           ORDER BY (x->>'rank')::integer) INTO v_rows FROM jsonb_array_elements(jse_commissions(a, '{}'::jsonb)->'brokers') x;
  ELSIF v_sheet = 'cash' THEN
    v_cols := '["Team","Liquid Cash","Realised P/L","Profit Cash Exempt","Base Cash Counted","Cash Limit","₹50K Rule","Loan Liability"]';
    SELECT jsonb_agg(jsonb_build_array(code, cash, realized_pnl, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             CASE WHEN cash_rule_met THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, loan_liability) ORDER BY seq) INTO v_rows FROM jse_team_metrics;
  ELSIF v_sheet = 'holdings' THEN
    v_cols := '["Team","Security","Name","Type","Quantity","Average Price","Cost incl. brokerage","Current Price","Market Value","Unrealised P/L"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, s.name, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, h.quantity,
             round(h.trade_cost / nullif(h.quantity, 0), 2), round(h.cost_basis, 2), s.price, h.quantity * s.price, round(h.quantity * s.price - h.cost_basis, 2))
           ORDER BY t.seq, s.display_order) INTO v_rows
    FROM holdings h JOIN teams t ON t.id = h.team_id JOIN securities s ON s.id = h.security_id WHERE h.quantity > 0;
  ELSIF v_sheet IN ('sold_stocks', 'sold_ipos') THEN
    v_cols := '["Team","Security","Name","Type","Quantity","Sell Price","Trade Value","Brokerage","Net Proceeds","Realised P/L","Counterparty","Timestamp","Order ID"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, s.name, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, st.quantity, st.price, st.trade_value,
             st.brokerage, st.trade_value - st.brokerage, st.realized_pnl, CASE WHEN st.account_type = 'INSTITUTION' THEN 'Institution' ELSE 'Market' END,
             st.settled_at, o.order_no) ORDER BY st.settled_at) INTO v_rows
    FROM settlements st JOIN teams t ON t.id = st.team_id JOIN securities s ON s.id = st.security_id JOIN orders o ON o.id = st.order_id
    WHERE st.reversed_at IS NULL AND ((st.account_type = 'TEAM' AND st.side = 'SELL') OR (st.account_type = 'INSTITUTION' AND st.side = 'BUY'))
      AND s.kind = CASE WHEN v_sheet = 'sold_ipos' THEN 'IPO' ELSE 'EQUITY' END;
  ELSIF v_sheet = 'networth' THEN
    v_cols := '["Rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","Realised P/L","Unrealised P/L","Brokerage Paid","Loan Original","Loan Principal","Interest Outstanding","Interest Paid","₹50K Rule","Portfolio Access","Short Sell Attempts","Cash Shortfall Attempts","Insufficient Balance Rejections"]';
    SELECT jsonb_agg(jsonb_build_array(rank_overall, m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2), (m->>'realized_pnl')::numeric,
             (m->>'unrealized_pnl')::numeric, (m->>'brokerage_paid')::numeric, (m->>'loan_original')::numeric, (m->>'loan_principal')::numeric,
             (m->>'loan_interest')::numeric, (m->>'loan_interest_paid')::numeric,
             CASE WHEN (m->>'cash_rule_met')::boolean THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, m->>'portfolio_access',
             (m->>'short_sell_attempts')::integer, (m->>'cash_shortfall_attempts')::integer, (m->>'insufficient_balance_rejections')::integer)
           ORDER BY rank_overall) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'loans' THEN
    v_cols := '["Team","Original Principal","Current Principal","Interest Outstanding","Interest Charged","Interest Paid","Principal Repaid","Total Liability","Draws","Status"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, l.original_principal, l.principal_outstanding, l.interest_outstanding, l.interest_charged, l.interest_paid,
             l.principal_repaid, l.principal_outstanding + l.interest_outstanding, l.draws, l.status) ORDER BY t.seq) INTO v_rows
    FROM loans l JOIN teams t ON t.id = l.team_id;
  ELSIF v_sheet = 'cash_rule' THEN
    v_cols := '["Team","Liquid Cash","Profit Cash Exempt","Base Cash Counted","Cash Limit","₹50K Rule","Cash Rule Status","Portfolio Access","In Winner Pool"]';
    SELECT jsonb_agg(jsonb_build_array(code, cash, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             CASE WHEN cash_rule_met THEN 'SATISFIED' ELSE 'NOT SATISFIED' END, cash_rule_status, portfolio_access, in_winner_pool) ORDER BY seq) INTO v_rows
    FROM jse_team_metrics;
  ELSIF v_sheet IN ('short_sell', 'cash_shortfall', 'insufficient_balance') THEN
    v_cols := '["Timestamp","Team","Order ID","Security","Side","Quantity","Holding Before","Required Cash","Available Cash","Shortage","Stage","Order Status","Note"]';
    SELECT jsonb_agg(jsonb_build_array(r.created_at, t.code, o.order_no, s.symbol, r.side, r.quantity, r.holding_before, r.required_amount, r.available_cash,
             r.shortage, r.stage, o.status, r.note) ORDER BY r.created_at) INTO v_rows
    FROM risk_events r JOIN teams t ON t.id = r.team_id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
    WHERE r.kind = CASE v_sheet WHEN 'short_sell' THEN 'SHORT_SELL_ATTEMPT' WHEN 'cash_shortfall' THEN 'CASH_SHORTFALL_ATTEMPT' ELSE 'INSUFFICIENT_BALANCE_REJECTION' END;
  ELSIF v_sheet IN ('orders', 'rejected') THEN
    v_cols := '["Order ID","Account","Team","Broker","Institution","Security","Type","Side","Quantity","Price","Trade Value","Brokerage","Settlement Amount","Status","Reject Code","Reject Reason","Short Sell Flag","Cash Shortfall Flag","Created By","Created At","Exchange By","Exchange At","Bank By","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, o.account_type, t.code, b.code, i.code, s.symbol, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, o.side,
             o.quantity, o.price, o.trade_value, o.brokerage, o.settlement_amount, o.status, o.reject_code, o.reject_reason, o.short_sell_flag,
             o.cash_shortfall_flag, o.created_by_name, o.created_at, o.exchange_by_name, o.exchange_at, o.bank_by_name, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id LEFT JOIN brokers b ON b.id = o.broker_id
    LEFT JOIN institutions i ON i.id = o.institution_id
    WHERE v_sheet = 'orders' OR o.status IN ('EXCHANGE_REJECTED', 'BANK_REJECTED');
  ELSIF v_sheet = 'trades' THEN
    v_cols := '["Settled At","Order ID","Account","Team","Institution","Security","Side","Quantity","Price","Trade Value","Brokerage","Team Cash Before","Team Cash After","Loan Drawn","Price Before","Price After","Realised P/L","Settled By"]';
    SELECT jsonb_agg(jsonb_build_array(st.settled_at, o.order_no, st.account_type, t.code, i.code, s.symbol, st.side, st.quantity, st.price, st.trade_value,
             st.brokerage, st.team_cash_before, st.team_cash_after, st.loan_drawn, st.price_before, st.price_after, st.realized_pnl, st.settled_by_name) ORDER BY st.id) INTO v_rows
    FROM settlements st JOIN orders o ON o.id = st.order_id JOIN teams t ON t.id = st.team_id JOIN securities s ON s.id = st.security_id
    LEFT JOIN institutions i ON i.id = st.institution_id WHERE st.reversed_at IS NULL;
  ELSIF v_sheet = 'ledger' THEN
    v_cols := '["Timestamp","Team","Order ID","Type","Debit","Credit","Balance After","Notes","Actor"]';
    SELECT jsonb_agg(jsonb_build_array(c.created_at, t.code, o.order_no, c.entry_type, c.debit, c.credit, c.balance_after, c.note, c.actor_name) ORDER BY c.id) INTO v_rows
    FROM cash_ledger c JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id;
  ELSIF v_sheet = 'commission' THEN
    v_cols := '["Timestamp","Broker","Team","Order ID","Side","Trade Value","Rate","Commission"]';
    SELECT jsonb_agg(jsonb_build_array(bc.created_at, b.code, t.code, o.order_no, bc.side, bc.trade_value, bc.rate, bc.amount) ORDER BY bc.id) INTO v_rows
    FROM broker_commissions bc JOIN brokers b ON b.id = bc.broker_id JOIN teams t ON t.id = bc.team_id JOIN orders o ON o.id = bc.order_id WHERE bc.reversed_at IS NULL;
  ELSIF v_sheet = 'institutional' THEN
    v_cols := '["Order ID","Institution","Counterparty Team","Security","Side","Quantity","Price","Trade Value","Status","Reject Reason","Created At","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, i.code, t.code, s.symbol, o.side, o.quantity, o.price, o.trade_value, o.status, o.reject_reason, o.created_at, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN institutions i ON i.id = o.institution_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id;
  ELSIF v_sheet = 'news' THEN
    v_cols := '["Timestamp","Security","Mood","Headline","Requested %","Applied %","Previous Price","New Price","Reversed","Published By"]';
    SELECT jsonb_agg(jsonb_build_array(n.created_at, s.symbol, replace(n.mood, '_', ' '), n.headline, n.requested_pct, round(n.applied_pct, 2), n.previous_price,
             n.new_price, n.reversed_at IS NOT NULL, n.created_by_name) ORDER BY n.id) INTO v_rows
    FROM market_news n JOIN securities s ON s.id = n.security_id;
  ELSIF v_sheet = 'prices' THEN
    v_cols := '["Timestamp","Security","Source","Previous Price","New Price","Change %","Order ID","News ID"]';
    SELECT jsonb_agg(jsonb_build_array(ph.created_at, s.symbol, ph.source, ph.previous_price, ph.new_price, round(ph.change_pct, 2), o.order_no, ph.news_id) ORDER BY ph.id) INTO v_rows
    FROM price_history ph JOIN securities s ON s.id = ph.security_id LEFT JOIN orders o ON o.id = ph.order_id;
  ELSIF v_sheet = 'audit' THEN
    v_cols := '["Timestamp","User","Email","Role","Action","Entity","Entity ID","Team","Order ID","Before","After","Details","IP"]';
    SELECT jsonb_agg(jsonb_build_array(al.created_at, al.actor_username, al.actor_email, al.actor_role, al.action, al.entity, al.entity_id, t.code, o.order_no,
             al.before_state::text, al.after_state::text, al.details::text, al.ip) ORDER BY al.id) INTO v_rows
    FROM audit_log al LEFT JOIN teams t ON t.id = al.team_id LEFT JOIN orders o ON o.id = al.order_id;
  ELSE
    PERFORM jse_fail('UNKNOWN_SHEET', 'Unknown export sheet.', 404);
  END IF;
  RETURN jsonb_build_object('success', true, 'sheet', v_sheet,
    'title', (SELECT x->>1 FROM jsonb_array_elements(jse_export_sheets()) x WHERE x->>0 = v_sheet),
    'columns', v_cols, 'rows', coalesce(v_rows, '[]'::jsonb));
END $$;

INSERT INTO schema_migrations(version) VALUES ('005_exports');
