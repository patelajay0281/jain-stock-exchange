-- JAIN STOCK EXCHANGE (JSE) v311
-- 005_exports.sql: one function per export sheet; rows are returned as arrays for compact transfer.
-- Every sheet reads the same canonical tables / views as the live dashboards.

CREATE OR REPLACE FUNCTION jse_export_sheets() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT '[
    ["winner","Winner & Runner-Up"],["assessment","Assessment & Eligibility"],["teams","Team Details"],["participants","Participant Details"],
    ["broker_roster","Broker Roster"],["brokers","Broker Performance"],
    ["cash","Cash"],["holdings","Holdings"],["sold_stocks","Sold Stocks"],["sold_ipos","Sold IPOs"],
    ["networth","Net Worth & PL"],["loans","Loans & Interest"],["cash_rule","Cash Rule"],
    ["short_sell","Short Selling Attempts"],["cash_shortfall","Cash Shortfall Attempts"],["insufficient_balance","Insufficient Balance Rejections"],
    ["orders","Order Tracking"],["rejected","Rejected Orders"],["slips","Trading Slips"],["instructions","Participant Instructions"],
    ["trades","Trade History"],["ledger","Cash Ledger"],["commission","Broker Commission"],["institutional","Institutional Investors"],
    ["ipo_applications","IPO Applications"],["ipo_allotments","IPO Allotments"],
    ["news","Market News"],["prices","Price History"],["journal","Action Journal"],["audit","Audit Logs"]]'::jsonb
$$;

CREATE OR REPLACE FUNCTION jse_export(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_sheet text := lower(coalesce(p->>'sheet', '')); v_cols jsonb; v_rows jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  IF v_sheet = 'winner' THEN
    v_cols := '["Award","Rank (eligible)","Overall rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","Settled BUY","Settled SELL","Loan repaid","Closing cash rule","Eligibility"]';
    SELECT jsonb_agg(jsonb_build_array(CASE award WHEN 'WINNER' THEN 'WINNER' WHEN 'RUNNER_UP' THEN 'RUNNER-UP' ELSE '' END, rank_eligible, rank_overall,
             m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2), (m->>'settled_buys')::integer, (m->>'settled_sells')::integer,
             CASE WHEN (m->>'loan_repaid')::boolean THEN 'YES' ELSE 'NO' END, m->>'cash_rule_status', m->>'eligibility_status')
           ORDER BY coalesce(rank_eligible, 100000 + rank_overall)) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'assessment' THEN
    v_cols := '["Team","Team name","Broker","Settled BUY","Min BUY","Settled SELL","Min SELL","Assessment","Loan liability","Loan repaid","Base cash counted","Cash limit","Closing cash rule","Eligibility","Gaps"]';
    SELECT jsonb_agg(jsonb_build_array(code, name, broker, settled_buys, min_buy_trades, settled_sells, min_sell_trades,
             CASE WHEN assessment_met THEN 'MET' ELSE 'NOT MET' END, loan_liability, CASE WHEN loan_repaid THEN 'YES' ELSE 'NO' END,
             base_cash_counted, cash_rule_limit, cash_rule_status, eligibility_status, array_to_string(eligibility_gaps, '; ')) ORDER BY seq) INTO v_rows
    FROM jse_team_metrics;
  ELSIF v_sheet = 'teams' THEN
    v_cols := '["Team","Team Name","Section","Broker","Members","Broker name","Broker contact","Broker desk","Name meaning","Active"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, b.code, t.members, b.name, b.contact, b.desk, np.meaning, t.active) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id LEFT JOIN team_name_pool np ON lower(np.name) = lower(t.name);
  ELSIF v_sheet = 'participants' THEN
    v_cols := '["Team","Team name","Section","Members","Broker","Login","Login active","Last login"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, t.section, t.members, b.code, u.username, u.active, u.last_login_at) ORDER BY t.seq) INTO v_rows
    FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id LEFT JOIN app_users u ON u.team_id = t.id AND u.role = 'PARTICIPANT';
  ELSIF v_sheet = 'broker_roster' THEN
    v_cols := '["Broker Code","Broker Name","Contact","Desk","Teams assigned","Team codes","Broker login"]';
    SELECT jsonb_agg(jsonb_build_array(b.code, b.name, b.contact, b.desk, (SELECT count(*) FROM teams t WHERE t.broker_id = b.id),
             (SELECT string_agg(t.code || ' ' || t.name, ', ' ORDER BY t.seq) FROM teams t WHERE t.broker_id = b.id),
             (SELECT string_agg(u.username, ', ') FROM app_users u WHERE u.role = 'BROKER' AND u.broker_id = b.id)) ORDER BY b.code) INTO v_rows
    FROM brokers b;
  ELSIF v_sheet = 'brokers' THEN
    v_cols := '["Rank","Broker","Name","Teams","Orders","Buy orders","Sell orders","Buy value","Sell value","Total trade value","Brokerage earned"]';
    SELECT jsonb_agg(jsonb_build_array((x->>'rank')::integer, x->>'broker', x->>'name', (x->>'teams')::integer, (x->>'orders')::integer, (x->>'buy_orders')::integer,
             (x->>'sell_orders')::integer, (x->>'buy_volume')::numeric, (x->>'sell_volume')::numeric, (x->>'total_trade_value')::numeric, (x->>'brokerage_earned')::numeric)
           ORDER BY (x->>'rank')::integer) INTO v_rows FROM jsonb_array_elements(jse_commissions(a, '{"page_size":10}'::jsonb)->'brokers') x;
  ELSIF v_sheet = 'cash' THEN
    v_cols := '["Team","Team name","Liquid Cash","Realised P/L","Profit Cash Exempt","Base Cash Counted","Cash Limit","Closing cash rule","Loan Liability"]';
    SELECT jsonb_agg(jsonb_build_array(code, name, cash, realized_pnl, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             cash_rule_status, loan_liability) ORDER BY seq) INTO v_rows FROM jse_team_metrics;
  ELSIF v_sheet = 'holdings' THEN
    v_cols := '["Team","Team name","Security","Name","Type","Quantity","Average Price","Cost incl. brokerage","Current Price","Market Value","Unrealised P/L"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, t.name, s.symbol, s.name, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, h.quantity,
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
    v_cols := '["Rank","Team","Team name","Broker","Liquid Cash","Holdings Value","Net Worth","P/L","Return %","Realised P/L","Unrealised P/L","Brokerage Paid","Loan Original","Loan Principal","Interest Outstanding","Interest Paid","Closing cash rule","Portfolio Access","Eligibility","Short Sell Attempts","Cash Shortfall Attempts","Insufficient Balance Rejections"]';
    SELECT jsonb_agg(jsonb_build_array(rank_overall, m->>'code', m->>'name', m->>'broker', (m->>'cash')::numeric, (m->>'holdings_value')::numeric,
             (m->>'net_worth')::numeric, (m->>'pnl')::numeric, round((m->>'return_pct')::numeric, 2), (m->>'realized_pnl')::numeric,
             (m->>'unrealized_pnl')::numeric, (m->>'brokerage_paid')::numeric, (m->>'loan_original')::numeric, (m->>'loan_principal')::numeric,
             (m->>'loan_interest')::numeric, (m->>'loan_interest_paid')::numeric, m->>'cash_rule_status', m->>'portfolio_access', m->>'eligibility_status',
             (m->>'short_sell_attempts')::integer, (m->>'cash_shortfall_attempts')::integer, (m->>'insufficient_balance_rejections')::integer)
           ORDER BY rank_overall) INTO v_rows FROM jse_ranked_teams();
  ELSIF v_sheet = 'loans' THEN
    v_cols := '["Team","Original Principal","Current Principal","Interest Outstanding","Interest Charged","Interest Paid","Principal Repaid","Total Liability","Draws","Status"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, l.original_principal, l.principal_outstanding, l.interest_outstanding, l.interest_charged, l.interest_paid,
             l.principal_repaid, l.principal_outstanding + l.interest_outstanding, l.draws, l.status) ORDER BY t.seq) INTO v_rows
    FROM loans l JOIN teams t ON t.id = l.team_id;
  ELSIF v_sheet = 'cash_rule' THEN
    v_cols := '["Team","Liquid Cash","Profit Cash Exempt","Base Cash Counted","Cash Limit","Rule met now","Closing cash rule","Portfolio Access","Eligible"]';
    SELECT jsonb_agg(jsonb_build_array(code, cash, profit_cash_exempt, base_cash_counted, cash_rule_limit,
             CASE WHEN cash_rule_met THEN 'YES' ELSE 'NO' END, cash_rule_status, portfolio_access, eligible) ORDER BY seq) INTO v_rows
    FROM jse_team_metrics;
  ELSIF v_sheet IN ('short_sell', 'cash_shortfall', 'insufficient_balance') THEN
    v_cols := '["Timestamp","Team","Order ID","Security","Side","Quantity","Holding Before","Required Cash","Available Cash","Shortage","Stage","Order Status","Note"]';
    SELECT jsonb_agg(jsonb_build_array(r.created_at, t.code, o.order_no, s.symbol, r.side, r.quantity, r.holding_before, r.required_amount, r.available_cash,
             r.shortage, r.stage, o.status, r.note) ORDER BY r.created_at) INTO v_rows
    FROM risk_events r JOIN teams t ON t.id = r.team_id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN securities s ON s.id = r.security_id
    WHERE r.kind = CASE v_sheet WHEN 'short_sell' THEN 'SHORT_SELL_ATTEMPT' WHEN 'cash_shortfall' THEN 'CASH_SHORTFALL_ATTEMPT' ELSE 'INSUFFICIENT_BALANCE_REJECTION' END;
  ELSIF v_sheet IN ('orders', 'rejected') THEN
    v_cols := '["Order ID","Account","Team","Team name","Broker","Institution","Instruction","Security","Type","Side","Quantity","Price","Trade Value","Brokerage %","Brokerage","Settlement Amount","Status","Stage","Reject Code","Reject Reason","Short Sell Flag","Cash Shortfall Flag","Submitted By","Submitted At","Executed By","Executed At","Slip No","Exchange By","Exchange At","Bank By","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, o.account_type, t.code, t.name, b.code, i.code, ins.instruction_no, s.symbol, CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END, o.side,
             o.quantity, o.price, o.trade_value, round(coalesce(o.brokerage_rate, 0) * 100, 4), o.brokerage, o.settlement_amount, o.status, jse_stage_label(o.status, o.reject_code),
             o.reject_code, o.reject_reason, o.short_sell_flag, o.cash_shortfall_flag, o.created_by_name, o.created_at, o.executed_by_name, o.executed_at, sl.slip_no,
             o.exchange_by_name, o.exchange_at, o.bank_by_name, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id LEFT JOIN brokers b ON b.id = o.broker_id
    LEFT JOIN institutions i ON i.id = o.institution_id LEFT JOIN instructions ins ON ins.id = o.instruction_id LEFT JOIN trading_slips sl ON sl.order_id = o.id
    WHERE v_sheet = 'orders' OR o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED');
  ELSIF v_sheet = 'slips' THEN
    v_cols := '["Slip No","Order ID","Executed At","Team","Team name","Broker","Broker name","Institution","Security","Name","Asset type","Side","Quantity","Execution Price","Trade Value","Brokerage %","Brokerage","Settlement Value","Pit Manager","Exchange","Bank","Status"]';
    SELECT jsonb_agg(jsonb_build_array(x->>'slip_no', x->>'order_no', x->>'executed_at', x->>'team', x->>'team_name', x->>'broker', x->>'broker_name', x->>'institution',
             x->>'symbol', x->>'security', x->>'asset_type', x->>'side', (x->>'quantity')::integer, (x->>'price')::numeric, (x->>'trade_value')::numeric,
             round(coalesce((x->>'brokerage_rate')::numeric, 0) * 100, 4), (x->>'brokerage')::numeric, (x->>'settlement_value')::numeric, x->>'executed_by',
             x->>'exchange_status', x->>'bank_status', x->>'stage') ORDER BY x->>'slip_no') INTO v_rows
    FROM (SELECT jse_slip_json(sl) AS x FROM trading_slips sl) q;
  ELSIF v_sheet = 'instructions' THEN
    v_cols := '["Instruction","Created At","Team","Team name","Broker","Security","Side","Quantity","Price seen","Note","Status","Order","Order status","Handled At","Handled By","Decline reason"]';
    SELECT jsonb_agg(jsonb_build_array(i.instruction_no, i.created_at, t.code, t.name, b.code, s.symbol, i.side, i.quantity, i.price_seen, i.note, i.status,
             o.order_no, o.status, i.handled_at, i.handled_by_name, i.decline_reason) ORDER BY i.id) INTO v_rows
    FROM instructions i JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN brokers b ON b.id = i.broker_id LEFT JOIN orders o ON o.id = i.order_id;
  ELSIF v_sheet = 'trades' THEN
    v_cols := '["Settled At","Order ID","Account","Team","Institution","Security","Side","Quantity","Price","Trade Value","Brokerage","Team Cash Before","Team Cash After","Holding Before","Holding After","Loan Drawn","Loan Interest","Market Price","Realised P/L","Settled By"]';
    SELECT jsonb_agg(jsonb_build_array(st.settled_at, o.order_no, st.account_type, t.code, i.code, s.symbol, st.side, st.quantity, st.price, st.trade_value,
             st.brokerage, st.team_cash_before, st.team_cash_after, st.holding_before, st.holding_after, st.loan_drawn, st.loan_interest, st.price_before,
             st.realized_pnl, st.settled_by_name) ORDER BY st.id) INTO v_rows
    FROM settlements st JOIN orders o ON o.id = st.order_id JOIN teams t ON t.id = st.team_id JOIN securities s ON s.id = st.security_id
    LEFT JOIN institutions i ON i.id = st.institution_id WHERE st.reversed_at IS NULL;
  ELSIF v_sheet = 'ledger' THEN
    v_cols := '["Timestamp","Team","Order ID","Type","Debit","Credit","Balance After","Notes","Actor"]';
    SELECT jsonb_agg(jsonb_build_array(c.created_at, t.code, o.order_no, c.entry_type, c.debit, c.credit, c.balance_after, c.note, c.actor_name) ORDER BY c.id) INTO v_rows
    FROM cash_ledger c JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id;
  ELSIF v_sheet = 'commission' THEN
    v_cols := '["Date/time","Broker","Broker name","Order","Team","Team name","Security","Side","Quantity","Price","Trade value","Brokerage rate %","Commission","Status"]';
    SELECT jsonb_agg(jsonb_build_array(bc.created_at, b.code, b.name, o.order_no, t.code, t.name, s.symbol, bc.side, o.quantity, o.price, bc.trade_value,
             round(bc.rate * 100, 4), bc.amount, CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END) ORDER BY bc.id) INTO v_rows
    FROM broker_commissions bc JOIN brokers b ON b.id = bc.broker_id JOIN teams t ON t.id = bc.team_id JOIN orders o ON o.id = bc.order_id
    JOIN securities s ON s.id = o.security_id;
  ELSIF v_sheet = 'institutional' THEN
    v_cols := '["Order ID","Institution","Counterparty Team","Security","Side","Quantity","Price","Trade Value","Status","Reject Reason","Submitted At","Executed At","Slip No","Bank At"]';
    SELECT jsonb_agg(jsonb_build_array(o.order_no, i.code, t.code, s.symbol, o.side, o.quantity, o.price, o.trade_value, o.status, o.reject_reason, o.created_at,
             o.executed_at, sl.slip_no, o.bank_at) ORDER BY o.id) INTO v_rows
    FROM orders o JOIN institutions i ON i.id = o.institution_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
    LEFT JOIN trading_slips sl ON sl.order_id = o.id;
  ELSIF v_sheet = 'ipo_applications' THEN
    v_cols := '["Team","IPO","Lots","Shares","Amount","Team name","IPO code","IPO name","Status","Updated At"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, ap.lots, ap.quantity, ap.amount, t.name, s.ipo_code, s.name, ap.status, ap.updated_at) ORDER BY t.seq, s.display_order) INTO v_rows
    FROM ipo_applications ap JOIN teams t ON t.id = ap.team_id JOIN securities s ON s.id = ap.security_id;
  ELSIF v_sheet = 'ipo_allotments' THEN
    v_cols := '["Team","IPO","Lots","Shares","Amount","Team name","IPO code","IPO name","Issue Price","Batch","Loaded At","Reversed"]';
    SELECT jsonb_agg(jsonb_build_array(t.code, s.symbol, al.lots, al.quantity, al.amount, t.name, s.ipo_code, s.name, al.price, al.batch_id, al.created_at,
             al.reversed_at IS NOT NULL) ORDER BY t.seq, s.display_order, al.id) INTO v_rows
    FROM ipo_allotments al JOIN teams t ON t.id = al.team_id JOIN securities s ON s.id = al.security_id;
  ELSIF v_sheet = 'news' THEN
    v_cols := '["Timestamp","Company","Symbol","Severity","Headline","Requested %","Applied %","Previous Price","New Price","Reversed","Published By"]';
    SELECT jsonb_agg(jsonb_build_array(n.created_at, s.name, s.symbol, replace(n.mood, '_', ' '), n.headline, n.requested_pct, round(n.applied_pct, 2), n.previous_price,
             n.new_price, n.reversed_at IS NOT NULL, n.created_by_name) ORDER BY n.id) INTO v_rows
    FROM market_news n JOIN securities s ON s.id = n.security_id;
  ELSIF v_sheet = 'prices' THEN
    v_cols := '["Timestamp","Security","Source","Previous Price","New Price","Change %","News ID"]';
    SELECT jsonb_agg(jsonb_build_array(ph.created_at, s.symbol, ph.source, ph.previous_price, ph.new_price, round(ph.change_pct, 2), ph.news_id) ORDER BY ph.id) INTO v_rows
    FROM price_history ph JOIN securities s ON s.id = ph.security_id;
  ELSIF v_sheet = 'journal' THEN
    v_cols := '["ID","Timestamp","Action","Summary","Actor","State","Undone At","Undone By","Redone At","Redone By"]';
    SELECT jsonb_agg(jsonb_build_array(j.id, j.created_at, j.action, j.summary, j.actor_name,
             CASE WHEN coalesce((j.payload->>'superseded')::boolean, false) THEN 'REDONE'
                  WHEN j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN 'UNDONE' ELSE 'ACTIVE' END,
             j.undone_at, j.undone_by, j.redone_at, j.redone_by) ORDER BY j.id) INTO v_rows
    FROM action_journal j;
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
