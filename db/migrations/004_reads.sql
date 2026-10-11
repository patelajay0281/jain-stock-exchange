-- JAIN STOCK EXCHANGE (JSE) v311
-- 004_reads.sql: read models used by the API (CMS INDEX, market board, IPO page, portfolios with assessment and
-- eligibility, order tracking with the canonical six-step flow, Pit Manager queue, trading slips, broker desk,
-- Exchange / Bank queues, ledgers, audit, commissions, Market Intelligence, admin state, certificates).

-- ---------------------------------------------------------------------------
-- CMS INDEX — one canonical calculation, staged composition: the active listed equities plus every IPO
-- that has officially listed (each IPO once, at its listing price as the component base).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_cms_index() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('name', 'CMS INDEX',
    'value', coalesce(sum(price), 0),
    'base_value', coalesce(sum(coalesce(index_base_price, base_price)), 0),
    'change', coalesce(sum(price), 0) - coalesce(sum(coalesce(index_base_price, base_price)), 0),
    'change_pct', CASE WHEN coalesce(sum(coalesce(index_base_price, base_price)), 0) = 0 THEN 0
                       ELSE round((sum(price) - sum(coalesce(index_base_price, base_price))) * 100 / sum(coalesce(index_base_price, base_price)), 2) END,
    'components', count(*),
    'equity_components', count(*) FILTER (WHERE kind = 'EQUITY'),
    'ipo_components', count(*) FILTER (WHERE kind = 'IPO'),
    'ipos_included', coalesce(jsonb_agg(symbol ORDER BY listed_at) FILTER (WHERE kind = 'IPO'), '[]'::jsonb),
    'methodology', 'Sum of component prices. Components: the listed equities plus each IPO once it lists (base = its listing price).')
  FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL)
$$;

-- ---------------------------------------------------------------------------
-- Team metrics: Net Worth = liquid cash + Σ(quantity × current price) (the closing price once the market closes).
-- Assessment: settled listed-stock BUY / SELL trades placed by the team (IPO allotments are not trades).
-- Eligibility: assessment met + loan fully repaid (when required) + closing cash rule (evaluated at close).
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS jse_team_metrics;
CREATE VIEW jse_team_metrics AS
WITH cfg AS (SELECT * FROM event_config WHERE id = 1),
     ev  AS (SELECT status FROM event_control WHERE id = 1),
     hv  AS (SELECT h.team_id, sum(h.quantity * s.price) AS holdings_value, sum(h.cost_basis) AS cost_basis,
                    count(*) FILTER (WHERE h.quantity > 0) AS positions
             FROM holdings h JOIN securities s ON s.id = h.security_id GROUP BY h.team_id),
     tr  AS (SELECT team_id, count(*) FILTER (WHERE side = 'BUY') AS buys, count(*) FILTER (WHERE side = 'SELL') AS sells
             FROM settlements WHERE reversed_at IS NULL AND account_type = 'TEAM' GROUP BY team_id),
     base AS (
       SELECT t.id AS team_id, t.code, t.seq, t.name, t.section, t.members, t.active,
              b.id AS broker_id, b.code AS broker, b.name AS broker_name, b.contact AS broker_contact, b.desk AS broker_desk,
              t.cash, coalesce(hv.holdings_value, 0)::numeric(18,2) AS holdings_value, coalesce(hv.cost_basis, 0) AS cost_basis,
              coalesce(hv.positions, 0) AS positions, t.realized_pnl, t.brokerage_paid,
              t.short_sell_attempts, t.cash_shortfall_attempts, t.insufficient_balance_rejections,
              coalesce(tr.buys, 0)::integer AS settled_buys, coalesce(tr.sells, 0)::integer AS settled_sells,
              cfg.min_buy_trades, cfg.min_sell_trades,
              coalesce(l.original_principal, 0) AS loan_original, coalesce(l.principal_outstanding, 0) AS loan_principal,
              coalesce(l.interest_outstanding, 0) AS loan_interest, coalesce(l.interest_charged, 0) AS loan_interest_charged,
              coalesce(l.interest_paid, 0) AS loan_interest_paid, coalesce(l.principal_repaid, 0) AS loan_principal_repaid,
              coalesce(l.status, 'NONE') AS loan_status, cfg.loan_repayment_required,
              greatest(0, least(t.cash, t.realized_pnl)) AS profit_cash_exempt,
              cfg.initial_capital, cfg.cash_rule_limit, ev.status AS event_status
       FROM teams t CROSS JOIN cfg CROSS JOIN ev
       LEFT JOIN brokers b ON b.id = t.broker_id
       LEFT JOIN hv ON hv.team_id = t.id
       LEFT JOIN tr ON tr.team_id = t.id
       LEFT JOIN loans l ON l.team_id = t.id),
     m AS (
       SELECT base.*,
              (cash + holdings_value)::numeric(18,2) AS net_worth,
              (cash + holdings_value - initial_capital)::numeric(18,2) AS pnl,
              round((cash + holdings_value - initial_capital) * 100 / initial_capital, 4) AS return_pct,
              (holdings_value - cost_basis)::numeric(18,2) AS unrealized_pnl,
              (cash - profit_cash_exempt)::numeric(18,2) AS base_cash_counted,
              (cash - profit_cash_exempt) <= cash_rule_limit AS cash_rule_met,
              (settled_buys >= min_buy_trades AND settled_sells >= min_sell_trades) AS assessment_met,
              (loan_principal + loan_interest) = 0 AS loan_repaid,
              (loan_principal + loan_interest)::numeric(18,2) AS loan_liability,
              event_status IN ('CLOSED', 'FINALIZED') AS final_evaluation
       FROM base)
SELECT m.*,
  CASE WHEN final_evaluation THEN CASE WHEN cash_rule_met THEN 'SATISFIED' ELSE 'NOT_SATISFIED' END ELSE 'PROVISIONAL' END AS cash_rule_status,
  (NOT loan_repayment_required OR loan_repaid) AS loan_rule_met,
  (assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND (NOT final_evaluation OR cash_rule_met)) AS eligible,
  array_remove(ARRAY[
    CASE WHEN settled_buys < min_buy_trades THEN 'BUY ' || settled_buys || ' / ' || min_buy_trades END,
    CASE WHEN settled_sells < min_sell_trades THEN 'SELL ' || settled_sells || ' / ' || min_sell_trades END,
    CASE WHEN loan_repayment_required AND NOT loan_repaid THEN 'Loan not fully repaid' END,
    CASE WHEN final_evaluation AND NOT cash_rule_met THEN 'Closing cash above ' || jse_inr(cash_rule_limit::bigint) || ' (base cash rule)' END], NULL) AS eligibility_gaps,
  CASE WHEN assessment_met AND (NOT loan_repayment_required OR loan_repaid) AND (NOT final_evaluation OR cash_rule_met)
       THEN CASE WHEN final_evaluation THEN 'ELIGIBLE' ELSE 'ELIGIBLE · PROVISIONAL' END
       ELSE CASE WHEN final_evaluation THEN 'NOT ELIGIBLE' ELSE 'NOT YET ELIGIBLE' END END AS eligibility_status,
  CASE WHEN final_evaluation THEN CASE WHEN cash_rule_met THEN 'ELIGIBLE' ELSE 'LOCKED' END ELSE 'PROVISIONAL' END AS portfolio_access
FROM m;

-- The one canonical ranking: overall by Net Worth; Winner and Runner-Up = first and second among eligible teams
-- (ties → lower team code). Used by portfolios, Market Intelligence, certificates and exports.
DROP FUNCTION IF EXISTS jse_ranked_teams();
CREATE FUNCTION jse_ranked_teams() RETURNS TABLE(m jsonb, rank_overall integer, rank_eligible integer, award text)
LANGUAGE sql STABLE AS $$
  WITH r AS (
    SELECT tm.*,
           row_number() OVER (ORDER BY net_worth DESC, code ASC)::integer AS rk,
           CASE WHEN eligible THEN row_number() OVER (PARTITION BY eligible ORDER BY net_worth DESC, code ASC)::integer END AS rke
    FROM jse_team_metrics tm WHERE tm.active)
  SELECT to_jsonb(r) - 'initial_capital' - 'cash_rule_limit' - 'event_status' - 'rk' - 'rke', rk, rke,
         CASE rke WHEN 1 THEN 'WINNER' WHEN 2 THEN 'RUNNER_UP' END
  FROM r
$$;

-- ---------------------------------------------------------------------------
-- Market (public). Board: the IPO Market (IPOs before listing) and the Listed Market (equities + listed IPOs),
-- the latest real price change first. The server's CMS INDEX is the only index value.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_security_json(s securities) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', s.id, 'symbol', s.symbol, 'name', s.name, 'kind', s.kind, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
    'ipo_code', s.ipo_code, 'sector', s.sector,
    'price', s.price, 'previous_price', s.previous_price, 'base_price', s.base_price,
    'change', s.price - s.previous_price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2),
    'day_change_pct', round(jse_pct(s.price, coalesce(s.index_base_price, s.base_price)), 2), 'lot_size', s.lot_size,
    'trade_count', s.trade_count, 'traded_value', s.traded_value, 'last_trade_at', s.last_trade_at, 'updated_at', s.updated_at,
    'last_price_change_at', s.last_price_change_at,
    'stage', CASE WHEN s.kind = 'IPO' THEN jse_ipo_stage(s.id) ELSE 'LISTED' END,
    'listed', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL, 'listed_at', s.listed_at,
    'in_index', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL,
    'tradable', s.active AND (s.kind = 'EQUITY' OR s.listed_at IS NOT NULL))
$$;

CREATE OR REPLACE FUNCTION jse_market() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH ev AS (SELECT * FROM event_control WHERE id = 1),
       cfg AS (SELECT * FROM event_config WHERE id = 1),
       s AS (SELECT * FROM securities WHERE active)
  SELECT jsonb_build_object(
    'success', true,
    'status', ev.status, 'status_changed_at', ev.status_changed_at,
    'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at,
    'index', jse_cms_index(),
    'breadth', (SELECT jsonb_build_object('advances', count(*) FILTER (WHERE price > coalesce(index_base_price, base_price)),
                                          'declines', count(*) FILTER (WHERE price < coalesce(index_base_price, base_price)),
                                          'unchanged', count(*) FILTER (WHERE price = coalesce(index_base_price, base_price)))
                FROM s WHERE kind = 'EQUITY' OR listed_at IS NOT NULL),
    'updated_at', ev.market_updated_at,
    'ipo_window', jse_ipo_window(),
    'price_band_pct', cfg.max_price_move_pct, 'price_tick', cfg.price_tick, 'brokerage_rate', cfg.brokerage_rate,
    'board', jsonb_build_object(
      'ipo_market', coalesce((SELECT jsonb_agg(x.symbol ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'IPO' AND x.listed_at IS NULL), '[]'::jsonb),
      'listed_market', coalesce((SELECT jsonb_agg(x.symbol ORDER BY x.last_price_change_at DESC NULLS LAST, x.display_order, x.id)
                                 FROM s x WHERE x.kind = 'EQUITY' OR x.listed_at IS NOT NULL), '[]'::jsonb)),
    'ipos', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'IPO'), '[]'::jsonb),
    'stocks', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.display_order, x.id) FROM s x WHERE x.kind = 'EQUITY'), '[]'::jsonb))
  FROM ev, cfg
$$;

CREATE OR REPLACE FUNCTION jse_event_status() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'status', ev.status, 'status_changed_at', ev.status_changed_at, 'started_at', ev.started_at,
    'index', jse_cms_index(),
    'closed_at', ev.closed_at, 'finalized_at', ev.finalized_at, 'reset_count', ev.reset_count,
    'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at, 'ipo_window', jse_ipo_window(),
    'config', jsonb_build_object('initial_capital', cfg.initial_capital, 'institutional_cash', cfg.institutional_cash,
      'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size, 'ipo_lot_size', cfg.ipo_lot_size, 'price_tick', cfg.price_tick,
      'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value, 'max_price_move_pct', cfg.max_price_move_pct,
      'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,
      'cash_rule_limit', cfg.cash_rule_limit, 'loans_enabled', cfg.loans_enabled, 'auto_loan_on_settlement', cfg.auto_loan_on_settlement,
      'loan_repayment_required', cfg.loan_repayment_required, 'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades,
      'event_start_at', cfg.event_start_at, 'ipo_application_hours', cfg.ipo_application_hours, 'auto_list_ipos', cfg.auto_list_ipos,
      'institution_overdraft', cfg.institution_overdraft, 'institution_brokerage', cfg.institution_brokerage,
      'max_total_capital', cfg.initial_capital + cfg.loan_max_principal),
    'counts', (SELECT jsonb_build_object(
      'teams', (SELECT count(*) FROM teams WHERE active), 'stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
      'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active), 'brokers', (SELECT count(*) FROM brokers WHERE active),
      'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
      'exchange_pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
      'bank_pending', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
      'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
      'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED')),
      'orders', count(*)) FROM orders))
  FROM event_control ev, event_config cfg WHERE ev.id = 1 AND cfg.id = 1
$$;

-- ---------------------------------------------------------------------------
-- IPO page (public, canonical prospectus source) and the participant's own application / allotment
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_ipo_page() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at, 'window', jse_ipo_window(),
    'status', (SELECT status FROM event_control WHERE id = 1),
    'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'sector', s.sector,
        'issue_price', s.base_price, 'lot_size', s.lot_size, 'lot_value', s.lot_size * s.base_price,
        'stage', jse_ipo_stage(s.id), 'listed', s.listed_at IS NOT NULL, 'listed_at', s.listed_at,
        'listing_price', CASE WHEN s.listed_at IS NOT NULL THEN s.index_base_price END, 'price', s.price, 'in_index', s.listed_at IS NOT NULL,
        'prospectus', jsonb_build_object(
          'company_description', pr.company_description, 'issue_details', pr.issue_details, 'business_overview', pr.business_overview,
          'financial_information', pr.financial_information, 'risk_factors', pr.risk_factors, 'use_of_proceeds', pr.use_of_proceeds,
          'promoters_management', pr.promoters_management, 'other_information', pr.other_information,
          'document_url', pr.document_url, 'document_name', pr.document_name, 'document_size', pr.document_size,
          'document_uploaded_at', pr.document_uploaded_at, 'has_document', pr.document_data IS NOT NULL, 'updated_at', pr.updated_at)
      ) ORDER BY s.display_order, s.id)
      FROM securities s LEFT JOIN ipo_prospectus pr ON pr.security_id = s.id WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb))
  FROM event_config cfg WHERE cfg.id = 1
$$;

CREATE OR REPLACE FUNCTION jse_ipo_mine(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_team integer;
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'ADMIN', 'VIEWER', 'BROKER');
  v_team := CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                 ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END;
  IF v_team IS NULL THEN RETURN jsonb_build_object('success', true, 'team', NULL, 'items', '[]'::jsonb); END IF;
  IF a->>'role' = 'BROKER' AND (SELECT broker_id FROM teams WHERE id = v_team) IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN
    PERFORM jse_fail('FORBIDDEN', 'Not one of your teams.', 403);
  END IF;
  RETURN jsonb_build_object('success', true, 'team', (SELECT code FROM teams WHERE id = v_team), 'cash', (SELECT cash FROM teams WHERE id = v_team),
    'items', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol,
        'application', (SELECT jsonb_build_object('lots', ap.lots, 'shares', ap.quantity, 'amount', ap.amount, 'status', ap.status, 'updated_at', ap.updated_at)
                        FROM ipo_applications ap WHERE ap.team_id = v_team AND ap.security_id = s.id),
        'allotment', (SELECT jsonb_build_object('lots', al.lots, 'shares', al.quantity, 'amount', al.amount, 'at', al.created_at)
                      FROM ipo_allotments al WHERE al.team_id = v_team AND al.security_id = s.id AND al.reversed_at IS NULL)) ORDER BY s.display_order)
      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_applications(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'window', jse_ipo_window(),
    'summary', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'stage', jse_ipo_stage(s.id),
        'teams', (SELECT count(*) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'lots', (SELECT coalesce(sum(lots), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'amount', (SELECT coalesce(sum(amount), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'allotted_teams', (SELECT count(*) FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL),
        'allotted_lots', (SELECT coalesce(sum(lots), 0) FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL)) ORDER BY s.display_order)
      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'team_name', t.name, 'ipo', s.symbol, 'lots', ap.lots, 'shares', ap.quantity,
        'amount', ap.amount, 'status', ap.status, 'updated_at', ap.updated_at) ORDER BY t.seq, s.display_order)
      FROM ipo_applications ap JOIN teams t ON t.id = ap.team_id JOIN securities s ON s.id = ap.security_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Participant portfolios (all teams) and detail
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_portfolios(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_rows jsonb; v_status text; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  SELECT jsonb_agg(m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) ORDER BY (m->>'seq')::integer)
  INTO v_rows FROM jse_ranked_teams();
  RETURN jsonb_build_object('success', true, 'event_status', v_status, 'final', v_status IN ('CLOSED', 'FINALIZED'),
    'criterion', 'Net Worth = liquid cash + holdings × closing price (loans are not deducted). Winner = highest eligible Net Worth; Runner-Up = second highest. Ties go to the lower team code.',
    'eligibility_rule', 'Eligible = at least ' || cfg.min_buy_trades || ' settled BUY and ' || cfg.min_sell_trades || ' settled SELL listed-stock trades (IPO allotments do not count)' ||
                        CASE WHEN cfg.loan_repayment_required THEN ' + loan fully repaid' ELSE '' END || ' + closing cash rule (base cash ≤ ' || jse_inr(cfg.cash_rule_limit::bigint) || ', evaluated at close).',
    'initial_capital', cfg.initial_capital, 'cash_rule_limit', cfg.cash_rule_limit, 'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades,
    'loan_repayment_required', cfg.loan_repayment_required,
    'stats', (SELECT jsonb_build_object('teams', count(*), 'total_net_worth', sum(net_worth), 'average_net_worth', round(avg(net_worth), 2),
              'highest_net_worth', max(net_worth), 'lowest_net_worth', min(net_worth), 'total_cash', sum(cash), 'total_holdings', sum(holdings_value),
              'eligible', count(*) FILTER (WHERE eligible), 'assessment_met', count(*) FILTER (WHERE assessment_met),
              'loans_unpaid', count(*) FILTER (WHERE NOT loan_repaid),
              'cash_rule_met', count(*) FILTER (WHERE cash_rule_met), 'cash_rule_not_met', count(*) FILTER (WHERE NOT cash_rule_met),
              'profitable', count(*) FILTER (WHERE pnl > 0), 'short_sell_attempts', sum(short_sell_attempts),
              'cash_shortfall_attempts', sum(cash_shortfall_attempts), 'insufficient_balance_rejections', sum(insufficient_balance_rejections),
              'total_brokerage', sum(brokerage_paid), 'loans_outstanding', sum(loan_principal + loan_interest))
              FROM jse_team_metrics WHERE active),
    'winner', (SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) FROM jse_ranked_teams() WHERE award = 'WINNER'),
    'runner_up', (SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award) FROM jse_ranked_teams() WHERE award = 'RUNNER_UP'),
    'teams', coalesce(v_rows, '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_portfolio_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
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
    'rules', jsonb_build_object('starting_capital', cfg.initial_capital, 'cash_limit', cfg.cash_rule_limit, 'loan_limit', cfg.loan_max_principal,
      'loan_rate', cfg.loan_interest_rate, 'brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades, 'loan_repayment_required', cfg.loan_repayment_required),
    'assessment', jsonb_build_object('buy', (v_m->>'settled_buys')::integer, 'sell', (v_m->>'settled_sells')::integer,
      'min_buy', cfg.min_buy_trades, 'min_sell', cfg.min_sell_trades, 'met', (v_m->>'assessment_met')::boolean,
      'basis', 'Settled listed-stock trades placed for your team. IPO allotments, rejected and unsettled orders do not count.'),
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
END $$;

-- ---------------------------------------------------------------------------
-- Order tracking: the single source of truth for transaction progress
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_tracking(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_broker integer; v_inst integer;
  v_status text := nullif(upper(trim(coalesce(p->>'status', ''))), '');
  v_side text := nullif(upper(trim(coalesce(p->>'side', ''))), '');
  v_kind text := nullif(upper(trim(coalesce(p->>'kind', ''))), '');
  v_acct text := nullif(upper(trim(coalesce(p->>'account', ''))), '');
  v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(200, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 50)));
  v_res jsonb;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'PIT_MANAGER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  IF a->>'role' = 'PARTICIPANT' THEN
    v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN
    SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team'));
    IF v_team IS NULL THEN v_team := -1; END IF;
  END IF;
  IF a->>'role' = 'BROKER' THEN v_broker := coalesce(nullif(a->>'broker_id', '')::integer, -1); END IF;
  IF a->>'role' = 'INSTITUTIONAL' THEN v_inst := coalesce(nullif(a->>'institution_id', '')::integer, -1); END IF;
  IF v_status = 'OPEN' THEN v_status := 'PENDING'; END IF;

  WITH f AS (
    SELECT o.*, s.symbol, s.name AS security_name, s.kind, t.code AS team_code, t.name AS team_name, b.code AS broker_code, b.name AS broker_name,
           i.code AS institution_code, sl.slip_no, ins.instruction_no
    FROM orders o JOIN securities s ON s.id = o.security_id JOIN teams t ON t.id = o.team_id
    LEFT JOIN brokers b ON b.id = o.broker_id LEFT JOIN institutions i ON i.id = o.institution_id
    LEFT JOIN trading_slips sl ON sl.order_id = o.id LEFT JOIN instructions ins ON ins.id = o.instruction_id
    WHERE (v_team IS NULL OR o.team_id = v_team)
      AND (v_broker IS NULL OR o.broker_id = v_broker)
      AND (v_inst IS NULL OR o.institution_id = v_inst)
      AND (v_status IS NULL OR o.status = v_status
           OR (v_status = 'REJECTED' AND o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED'))
           OR (v_status = 'PENDING' AND o.status IN ('PIT_PENDING', 'EXCHANGE_PENDING', 'EXCHANGE_APPROVED', 'BANK_PENDING'))
           OR (v_status = 'STALE' AND o.reject_code = 'PRICE_STALE')
           OR (v_status = 'EXECUTED' AND o.executed_at IS NOT NULL))
      AND (v_side IS NULL OR o.side = v_side)
      AND (v_kind IS NULL OR s.kind = v_kind OR (v_kind = 'STOCK' AND s.kind = 'EQUITY'))
      AND (v_acct IS NULL OR o.account_type = v_acct)
      AND (v_q IS NULL OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR t.name ILIKE '%' || v_q || '%'
           OR s.symbol ILIKE '%' || v_q || '%' OR s.name ILIKE '%' || v_q || '%' OR coalesce(b.code, '') ILIKE '%' || v_q || '%'
           OR coalesce(sl.slip_no, '') ILIKE '%' || v_q || '%' OR coalesce(ins.instruction_no, '') ILIKE '%' || v_q || '%'))
  SELECT jsonb_build_object('success', true,
    'kpis', (SELECT jsonb_build_object('orders', count(*),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'pit_rejected', count(*) FILTER (WHERE status = 'PIT_REJECTED' AND coalesce(reject_code, '') <> 'PRICE_STALE'),
        'stale', count(*) FILTER (WHERE reject_code = 'PRICE_STALE'),
        'executed', count(*) FILTER (WHERE executed_at IS NOT NULL),
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
        'team_name', x.team_name, 'broker', x.broker_code, 'broker_name', x.broker_name, 'institution', x.institution_code, 'symbol', x.symbol,
        'security', x.security_name, 'kind', x.kind, 'side', x.side, 'quantity', x.quantity, 'price', x.price, 'trade_value', x.trade_value,
        'brokerage', x.brokerage, 'brokerage_rate', x.brokerage_rate, 'settlement_amount', x.settlement_amount, 'status', x.status,
        'stage', jse_stage_label(x.status, x.reject_code), 'reject_code', x.reject_code, 'reject_reason', x.reject_reason,
        'short_sell_flag', x.short_sell_flag, 'cash_shortfall_flag', x.cash_shortfall_flag, 'created_by', x.created_by_name,
        'created_at', x.created_at, 'instruction_no', x.instruction_no, 'executed_at', x.executed_at, 'executed_by', x.executed_by_name,
        'slip_no', x.slip_no, 'pit_at', x.pit_at, 'exchange_by', x.exchange_by_name, 'exchange_at', x.exchange_at, 'bank_by', x.bank_by_name,
        'bank_at', x.bank_at, 'updated_at', x.updated_at) ORDER BY x.updated_at DESC, x.id DESC)
      FROM (SELECT * FROM f ORDER BY f.updated_at DESC, f.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) x), '[]'::jsonb))
  INTO v_res;
  RETURN v_res;
END $$;

-- The canonical six-step processing flow of one order (every timestamp, actor and outcome)
CREATE OR REPLACE FUNCTION jse_order_flow(p_id bigint) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_array(
    jsonb_build_object('step', 'INSTRUCTION', 'label', 'Participant Instruction',
      'state', CASE WHEN o.account_type = 'INSTITUTION' THEN 'NA' WHEN ins.id IS NOT NULL THEN 'DONE' ELSE 'IN_PERSON' END,
      'at', ins.created_at, 'by', CASE WHEN ins.id IS NOT NULL THEN t.name || ' (' || t.code || ')' END,
      'detail', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional desk order (counterparty ' || t.code || ')'
                     WHEN ins.id IS NOT NULL THEN ins.instruction_no || ': ' || ins.side || ' ' || ins.quantity || ' ' || s.symbol ||
                          coalesce(' · market price seen ' || jse_inr(ins.price_seen), '') || coalesce(' · note: ' || ins.note, '')
                     ELSE 'Instruction given to the broker in person at the desk' END),
    jsonb_build_object('step', 'BROKER_SUBMISSION', 'label', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional Submission' ELSE 'Broker Submission' END,
      'state', 'DONE', 'at', o.created_at, 'by', o.created_by_name || coalesce(' · ' || b.name || ' (' || b.code || ')', ''),
      'detail', o.side || ' ' || o.quantity || ' ' || s.symbol || ' at the market price ' || jse_inr(o.price) || ' · trade value ' || jse_inr(o.trade_value) ||
                ' · brokerage ' || jse_rate_text(coalesce(o.brokerage_rate, CASE WHEN o.trade_value > 0 THEN o.brokerage / o.trade_value END)) || ' = ' || jse_inr(o.brokerage)),
    jsonb_build_object('step', 'PIT_EXECUTION', 'label', 'Pit Manager Execution',
      'state', CASE WHEN o.executed_at IS NOT NULL THEN 'DONE' WHEN o.status = 'PIT_PENDING' THEN 'CURRENT' WHEN o.status = 'PIT_REJECTED' THEN 'REJECTED' ELSE 'NA' END,
      'at', coalesce(o.executed_at, o.pit_at), 'by', coalesce(o.executed_by_name, o.pit_by_name),
      'detail', CASE WHEN o.executed_at IS NOT NULL THEN 'Executed ' || o.executed_quantity || ' @ ' || jse_inr(o.executed_price) || ' · trading slip ' || coalesce(sl.slip_no, '—')
                     WHEN o.status = 'PIT_PENDING' THEN 'Waiting for the Pit Manager to execute'
                     WHEN o.status = 'PIT_REJECTED' THEN coalesce(o.reject_reason, 'Rejected by the Pit Manager')
                     ELSE 'Recorded before the Pit Manager stage existed' END),
    jsonb_build_object('step', 'EXCHANGE_REVIEW', 'label', 'Exchange Review',
      'state', CASE WHEN o.status = 'EXCHANGE_REJECTED' THEN 'REJECTED' WHEN o.status = 'EXCHANGE_PENDING' THEN 'CURRENT'
                    WHEN o.exchange_at IS NOT NULL THEN 'DONE' WHEN o.status IN ('PIT_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', o.exchange_at, 'by', o.exchange_by_name,
      'detail', CASE WHEN o.status = 'EXCHANGE_REJECTED' THEN coalesce(o.reject_reason, 'Rejected by the Exchange')
                     WHEN o.status = 'EXCHANGE_PENDING' THEN 'Executed; waiting for Exchange review'
                     WHEN o.exchange_at IS NOT NULL THEN 'Approved' || CASE WHEN o.short_sell_approved THEN ' (short-selling warning forwarded to the Bank)' ELSE '' END
                     ELSE NULL END),
    jsonb_build_object('step', 'BANK_SETTLEMENT', 'label', 'Bank Settlement',
      'state', CASE WHEN o.status = 'BANK_SETTLED' THEN 'DONE' WHEN o.status = 'BANK_REJECTED' THEN 'REJECTED'
                    WHEN o.status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN 'CURRENT'
                    WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', o.bank_at, 'by', coalesce(o.bank_by_name, o.bank_claimed_name),
      'detail', CASE WHEN o.status = 'BANK_SETTLED' THEN 'Settled ' || jse_inr(o.settlement_amount) || CASE WHEN o.side = 'BUY' AND o.account_type = 'TEAM' THEN ' (trade value + brokerage)'
                                                                                              WHEN o.account_type = 'TEAM' THEN ' (trade value − brokerage)' ELSE '' END ||
                                                     CASE WHEN st.loan_drawn > 0 THEN ' · automatic loan ' || jse_inr(st.loan_drawn) || ' (interest ' || jse_inr(st.loan_interest) || ')' ELSE '' END
                     WHEN o.status = 'BANK_REJECTED' THEN coalesce(o.reject_reason, 'Rejected by the Bank')
                     WHEN o.status = 'BANK_PENDING' THEN 'Being verified by ' || coalesce(o.bank_claimed_name, 'the Bank')
                     WHEN o.status = 'EXCHANGE_APPROVED' THEN 'Waiting for the Bank' ELSE NULL END),
    jsonb_build_object('step', 'UPDATES', 'label', 'Market / Cash / Holdings Updated',
      'state', CASE WHEN o.status = 'BANK_SETTLED' THEN 'DONE' WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'SKIPPED' ELSE 'WAITING' END,
      'at', st.settled_at, 'by', st.settled_by_name,
      'detail', CASE WHEN st.id IS NOT NULL THEN t.code || ' cash ' || jse_inr(st.team_cash_before) || ' → ' || jse_inr(st.team_cash_after) || ' · ' || s.symbol || ' holding ' ||
                     st.holding_before || ' → ' || st.holding_after || ' · market price unchanged (' || jse_inr(st.price_before) || '; prices move only on Market News)'
                     WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'No cash or holding change (order rejected)' ELSE NULL END))
  FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id
  LEFT JOIN instructions ins ON ins.id = o.instruction_id
  LEFT JOIN trading_slips sl ON sl.order_id = o.id
  LEFT JOIN settlements st ON st.order_id = o.id AND st.reversed_at IS NULL
  WHERE o.id = p_id
$$;

CREATE OR REPLACE FUNCTION jse_order_detail(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE o orders%ROWTYPE; s securities%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'EXCHANGE', 'BANK', 'BROKER', 'PIT_MANAGER', 'INSTITUTIONAL', 'VIEWER', 'PARTICIPANT');
  SELECT * INTO o FROM orders WHERE id = nullif(p->>'order_id', '')::bigint OR order_no = upper(trim(coalesce(p->>'order_no', '')))
     OR id = (SELECT order_id FROM trading_slips WHERE slip_no = upper(trim(coalesce(p->>'slip_no', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('ORDER_NOT_FOUND', 'Order not found.', 404); END IF;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM o.team_id THEN PERFORM jse_fail('FORBIDDEN', 'Not your order.', 403); END IF;
  IF a->>'role' = 'BROKER' AND o.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not one of your teams'' orders.', 403); END IF;
  IF a->>'role' = 'INSTITUTIONAL' AND o.institution_id IS DISTINCT FROM nullif(a->>'institution_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not your institution''s order.', 403); END IF;
  SELECT * INTO s FROM securities WHERE id = o.security_id;
  RETURN jsonb_build_object('success', true, 'order', jse_order_json(o.id), 'flow', jse_order_flow(o.id),
    'assessment', jsonb_build_object('counts', o.account_type = 'TEAM' AND o.status = 'BANK_SETTLED',
      'explanation', CASE WHEN o.account_type <> 'TEAM' THEN 'Institutional order: does not count toward a team''s assessment.'
                          WHEN o.status = 'BANK_SETTLED' THEN 'Counts as 1 settled ' || o.side || ' trade toward the assessment.'
                          WHEN o.status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED') THEN 'Rejected orders do not count toward the assessment.'
                          ELSE 'Counts toward the assessment only once the Bank settles it.' END),
    'events', coalesce((SELECT jsonb_agg(jsonb_build_object('event', e.event, 'from', e.from_status, 'to', e.to_status, 'actor', e.actor_name,
        'role', e.actor_role, 'note', e.note, 'data', e.data, 'at', e.created_at) ORDER BY e.id) FROM order_events e WHERE e.order_id = o.id), '[]'::jsonb),
    'settlement', (SELECT to_jsonb(st) FROM settlements st WHERE st.order_id = o.id AND st.reversed_at IS NULL),
    'risk', coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) FROM risk_events r WHERE r.order_id = o.id), '[]'::jsonb),
    'audit', coalesce((SELECT jsonb_agg(jsonb_build_object('action', al.action, 'actor', al.actor_username, 'role', al.actor_role,
        'details', al.details, 'at', al.created_at) ORDER BY al.id) FROM audit_log al WHERE al.order_id = o.id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Pit Manager queue: one queue of broker-submitted orders awaiting execution
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_pit_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER', 'VIEWER');
  RETURN jsonb_build_object('success', true,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'stale', o.price <> s.price, 'age_seconds', extract(epoch FROM now() - o.created_at)::integer,
        'holding', CASE WHEN o.account_type = 'TEAM' THEN av.holding END, 'available_qty', CASE WHEN o.account_type = 'TEAM' THEN av.available END,
        'short_sell_risk', (o.account_type = 'TEAM' AND o.side = 'SELL' AND o.quantity > av.available)) AS j
      FROM orders o JOIN securities s ON s.id = o.security_id
      CROSS JOIN LATERAL jse_available_qty(o.team_id, o.security_id, o.id) av
      WHERE o.status = 'PIT_PENDING' ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.pit_at DESC, x.id DESC) FROM (
      SELECT id, pit_at FROM orders WHERE pit_at IS NOT NULL ORDER BY pit_at DESC, id DESC LIMIT 30) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object('pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
       'executed', count(*) FILTER (WHERE executed_at IS NOT NULL),
       'rejected', count(*) FILTER (WHERE status = 'PIT_REJECTED' AND coalesce(reject_code, '') NOT IN ('PRICE_STALE', 'MARKET_CLOSED')),
       'stale', count(*) FILTER (WHERE reject_code = 'PRICE_STALE')) FROM orders));
END $$;

-- ---------------------------------------------------------------------------
-- Trading slips (one per executed order; proves the executed order record)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_slip_json(p_slip trading_slips) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('slip_no', p_slip.slip_no, 'order_no', o.order_no, 'order_id', o.id, 'issued_at', p_slip.issued_at,
    'account_type', o.account_type, 'team', t.code, 'team_name', t.name, 'broker', b.code, 'broker_name', b.name, 'institution', i.code, 'institution_name', i.name,
    'symbol', s.symbol, 'security', s.name, 'asset_type', CASE WHEN s.kind = 'IPO' THEN 'IPO (listed)' ELSE 'Equity' END,
    'side', o.side, 'quantity', o.executed_quantity, 'price', o.executed_price, 'trade_value', o.trade_value,
    'brokerage_rate', coalesce(o.brokerage_rate, CASE WHEN o.trade_value > 0 THEN round(o.brokerage / o.trade_value, 6) END), 'brokerage', o.brokerage,
    'settlement_value', o.settlement_amount, 'executed_at', o.executed_at, 'executed_by', o.executed_by_name,
    'submitted_at', o.created_at, 'submitted_by', o.created_by_name, 'instruction_no', ins.instruction_no,
    'status', o.status, 'stage', jse_stage_label(o.status, o.reject_code),
    'exchange_status', CASE WHEN o.status = 'EXCHANGE_PENDING' THEN 'PENDING' WHEN o.status = 'EXCHANGE_REJECTED' THEN 'REJECTED'
                            WHEN o.exchange_at IS NOT NULL THEN 'APPROVED' ELSE 'PENDING' END,
    'exchange_at', o.exchange_at, 'exchange_by', o.exchange_by_name,
    'bank_status', CASE WHEN o.status = 'BANK_SETTLED' THEN 'SETTLED' WHEN o.status = 'BANK_REJECTED' THEN 'REJECTED'
                        WHEN o.status IN ('EXCHANGE_APPROVED', 'BANK_PENDING') THEN 'PENDING' WHEN o.status = 'EXCHANGE_REJECTED' THEN 'NOT APPLICABLE' ELSE 'WAITING' END,
    'bank_at', o.bank_at, 'bank_by', o.bank_by_name, 'reject_reason', o.reject_reason)
  FROM orders o JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
  LEFT JOIN brokers b ON b.id = o.broker_id LEFT JOIN institutions i ON i.id = o.institution_id
  LEFT JOIN instructions ins ON ins.id = o.instruction_id
  WHERE o.id = p_slip.order_id
$$;

CREATE OR REPLACE FUNCTION jse_slips(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_team integer; v_broker integer; v_inst integer; v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(200, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 50)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER', 'VIEWER', 'EXCHANGE', 'BANK', 'BROKER', 'PARTICIPANT', 'INSTITUTIONAL');
  IF a->>'role' = 'PARTICIPANT' THEN v_team := (a->>'team_id')::integer;
  ELSIF coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1);
  END IF;
  IF a->>'role' = 'BROKER' THEN v_broker := coalesce(nullif(a->>'broker_id', '')::integer, -1); END IF;
  IF a->>'role' = 'INSTITUTIONAL' THEN v_inst := coalesce(nullif(a->>'institution_id', '')::integer, -1); END IF;
  RETURN jsonb_build_object('success', true, 'page', v_page, 'page_size', v_size,
    'total', (SELECT count(*) FROM trading_slips sl JOIN orders o ON o.id = sl.order_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
              WHERE (v_team IS NULL OR o.team_id = v_team) AND (v_broker IS NULL OR o.broker_id = v_broker) AND (v_inst IS NULL OR o.institution_id = v_inst)
                AND (v_q IS NULL OR sl.slip_no ILIKE '%' || v_q || '%' OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR s.symbol ILIKE '%' || v_q || '%')),
    'rows', coalesce((SELECT jsonb_agg(jse_slip_json(x) ORDER BY x.id DESC) FROM (
      SELECT sl.* FROM trading_slips sl JOIN orders o ON o.id = sl.order_id JOIN teams t ON t.id = o.team_id JOIN securities s ON s.id = o.security_id
      WHERE (v_team IS NULL OR o.team_id = v_team) AND (v_broker IS NULL OR o.broker_id = v_broker) AND (v_inst IS NULL OR o.institution_id = v_inst)
        AND (v_q IS NULL OR sl.slip_no ILIKE '%' || v_q || '%' OR o.order_no ILIKE '%' || v_q || '%' OR t.code ILIKE '%' || v_q || '%' OR s.symbol ILIKE '%' || v_q || '%')
      ORDER BY sl.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) x), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_slip(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE sl trading_slips%ROWTYPE; o orders%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'PIT_MANAGER', 'VIEWER', 'EXCHANGE', 'BANK', 'BROKER', 'PARTICIPANT', 'INSTITUTIONAL');
  SELECT * INTO sl FROM trading_slips WHERE slip_no = upper(trim(coalesce(p->>'slip_no', '')))
     OR order_id = nullif(p->>'order_id', '')::bigint OR order_id = (SELECT id FROM orders WHERE order_no = upper(trim(coalesce(p->>'order_no', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('SLIP_NOT_FOUND', 'No trading slip found (a slip exists only after the Pit Manager executes the order).', 404); END IF;
  SELECT * INTO o FROM orders WHERE id = sl.order_id;
  IF a->>'role' = 'PARTICIPANT' AND (a->>'team_id')::integer IS DISTINCT FROM o.team_id THEN PERFORM jse_fail('FORBIDDEN', 'Not your trading slip.', 403); END IF;
  IF a->>'role' = 'BROKER' AND o.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not one of your teams'' slips.', 403); END IF;
  IF a->>'role' = 'INSTITUTIONAL' AND o.institution_id IS DISTINCT FROM nullif(a->>'institution_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not your institution''s slip.', 403); END IF;
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1), 'slip', jse_slip_json(sl));
END $$;

-- ---------------------------------------------------------------------------
-- Broker Desk: only the broker's assigned teams, their instructions and orders
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_broker_desk(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE b brokers%ROWTYPE; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  IF a->>'role' = 'BROKER' THEN
    SELECT * INTO b FROM brokers WHERE id = nullif(a->>'broker_id', '')::integer;
  ELSE
    SELECT * INTO b FROM brokers WHERE code = upper(trim(coalesce(nullif(p->>'broker', ''), (SELECT min(code) FROM brokers))));
  END IF;
  IF NOT FOUND THEN PERFORM jse_fail('BROKER_NOT_FOUND', 'Broker not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'broker', jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk),
    'brokers', CASE WHEN a->>'role' = 'BROKER' THEN NULL ELSE (SELECT jsonb_agg(jsonb_build_object('code', code, 'name', name) ORDER BY code) FROM brokers) END,
    'rules', jsonb_build_object('brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'stock_lot_size', cfg.stock_lot_size, 'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades),
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', tm.code, 'name', tm.name, 'section', tm.section, 'members', tm.members,
        'cash', tm.cash, 'free_cash', jse_available_cash(tm.team_id, NULL), 'loan_room', jse_loan_room(tm.team_id),
        'holdings_value', tm.holdings_value, 'net_worth', tm.net_worth, 'settled_buys', tm.settled_buys, 'settled_sells', tm.settled_sells,
        'assessment_met', tm.assessment_met, 'loan_liability', tm.loan_liability, 'eligibility_status', tm.eligibility_status,
        'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'quantity', h.quantity,
              'available', (SELECT available FROM jse_available_qty(tm.team_id, s.id, NULL)), 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2),
              'price', s.price, 'value', h.quantity * s.price, 'tradable', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL) ORDER BY h.quantity * s.price DESC)
            FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = tm.team_id AND h.quantity > 0), '[]'::jsonb),
        'open_orders', (SELECT count(*) FROM orders o WHERE o.team_id = tm.team_id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')))
        ORDER BY tm.seq)
      FROM jse_team_metrics tm WHERE tm.broker_id = b.id AND tm.active), '[]'::jsonb),
    'instructions', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'instruction_no', i.instruction_no, 'team', t.code, 'team_name', t.name,
        'symbol', s.symbol, 'security', s.name, 'side', i.side, 'quantity', i.quantity, 'note', i.note, 'price_seen', i.price_seen, 'market_price', s.price,
        'status', i.status, 'created_at', i.created_at, 'handled_at', i.handled_at, 'handled_by', i.handled_by_name, 'decline_reason', i.decline_reason,
        'order_no', o.order_no, 'order_status', o.status) ORDER BY (i.status = 'OPEN') DESC, i.id DESC)
      FROM (SELECT * FROM instructions WHERE broker_id = b.id AND (status = 'OPEN' OR created_at > now() - interval '12 hours') ORDER BY id DESC LIMIT 80) i
      JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN orders o ON o.id = i.order_id), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.id DESC) FROM (
        SELECT o.id FROM orders o WHERE o.broker_id = b.id ORDER BY o.id DESC LIMIT 60) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object(
        'teams', (SELECT count(*) FROM teams WHERE broker_id = b.id AND active),
        'open_instructions', (SELECT count(*) FROM instructions WHERE broker_id = b.id AND status = 'OPEN'),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'awaiting_exchange', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
        'awaiting_bank', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
        'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED'))) FROM orders WHERE broker_id = b.id));
END $$;

CREATE OR REPLACE FUNCTION jse_instructions(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_team integer; v_broker integer;
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'BROKER', 'ADMIN', 'VIEWER');
  IF a->>'role' = 'PARTICIPANT' THEN v_team := (a->>'team_id')::integer; END IF;
  IF a->>'role' = 'BROKER' THEN v_broker := coalesce(nullif(a->>'broker_id', '')::integer, -1); END IF;
  IF v_team IS NULL AND coalesce(p->>'team', '') <> '' THEN SELECT id INTO v_team FROM teams WHERE code = upper(trim(p->>'team')); v_team := coalesce(v_team, -1); END IF;
  RETURN jsonb_build_object('success', true,
    'broker', (SELECT jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk)
               FROM teams t JOIN brokers b ON b.id = t.broker_id WHERE a->>'role' = 'PARTICIPANT' AND t.id = v_team),
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'instruction_no', i.instruction_no, 'team', t.code, 'team_name', t.name,
        'broker', b.code, 'symbol', s.symbol, 'security', s.name, 'side', i.side, 'quantity', i.quantity, 'note', i.note,
        'price_seen', i.price_seen, 'market_price', s.price, 'status', i.status, 'created_at', i.created_at, 'handled_at', i.handled_at,
        'handled_by', i.handled_by_name, 'decline_reason', i.decline_reason, 'order_no', o.order_no, 'order_status', o.status,
        'order_stage', jse_stage_label(o.status, o.reject_code)) ORDER BY i.id DESC)
      FROM (SELECT * FROM instructions WHERE (v_team IS NULL OR team_id = v_team) AND (v_broker IS NULL OR broker_id = v_broker) ORDER BY id DESC LIMIT 200) i
      JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN brokers b ON b.id = i.broker_id
      LEFT JOIN orders o ON o.id = i.order_id), '[]'::jsonb));
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
        'loan_room', CASE WHEN o.account_type = 'TEAM' THEN jse_loan_room(o.team_id) END,
        'short_sell_risk', (o.account_type = 'TEAM' AND o.side = 'SELL' AND o.quantity > av.available),
        'cash_risk', (o.account_type = 'TEAM' AND o.side = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id) + jse_loan_room(o.team_id)),
        'loan_needed', (o.account_type = 'TEAM' AND o.side = 'BUY' AND o.settlement_amount > jse_available_cash(o.team_id, o.id)),
        'age_seconds', extract(epoch FROM now() - coalesce(o.executed_at, o.created_at))::integer) AS j
      FROM orders o CROSS JOIN LATERAL jse_available_qty(o.team_id, o.security_id, o.id) av
      WHERE o.status = 'EXCHANGE_PENDING' ORDER BY o.id LIMIT 300) q), '[]'::jsonb),
    'recent', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.exchange_at DESC) FROM (
      SELECT id, exchange_at FROM orders WHERE exchange_at IS NOT NULL ORDER BY exchange_at DESC LIMIT 25) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object('pending', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
       'awaiting_pit', count(*) FILTER (WHERE status = 'PIT_PENDING'),
       'approved', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING', 'BANK_SETTLED', 'BANK_REJECTED') AND exchange_at IS NOT NULL),
       'rejected', count(*) FILTER (WHERE status = 'EXCHANGE_REJECTED')) FROM orders));
END $$;

CREATE OR REPLACE FUNCTION jse_bank_queue(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'loan_limit', cfg.loan_max_principal, 'loan_rate', cfg.loan_interest_rate,
    'auto_loan', cfg.loans_enabled AND cfg.auto_loan_on_settlement,
    'pending', coalesce((SELECT jsonb_agg(q.j ORDER BY q.id) FROM (
      SELECT o.id, jse_order_json(o.id) || jsonb_build_object(
        'claimed_by', o.bank_claimed_name, 'claimed_at', o.bank_claimed_at,
        'team_side', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL') THEN 'BUY' ELSE 'SELL' END,
        'cash', t.cash, 'holding', coalesce(h.quantity, 0),
        'required', CASE WHEN (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL')
                         THEN o.trade_value + round(o.trade_value * coalesce(o.brokerage_rate, cfg.brokerage_rate), 2) END,
        'loan_room', greatest(0, cfg.loan_max_principal - coalesce(l.original_principal, 0)),
        'institution_holding', CASE WHEN o.account_type = 'INSTITUTION' THEN coalesce(ih.quantity, 0) END,
        'age_seconds', extract(epoch FROM now() - coalesce(o.exchange_at, o.created_at))::integer) AS j
      FROM orders o JOIN teams t ON t.id = o.team_id
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
  RETURN jsonb_build_object('success', true, 'limit', cfg.loan_max_principal, 'rate', cfg.loan_interest_rate,
    'rules', 'Interest ' || jse_rate_text(cfg.loan_interest_rate) || ' is charged on every draw. Repayment pays interest first, then principal; after a partial repayment, fresh ' ||
             jse_rate_text(cfg.loan_interest_rate) || ' interest is charged on the principal that remains. The full loan must be repaid for eligibility.',
    'loans', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'team_name', t.name, 'cash', t.cash, 'original_principal', l.original_principal,
        'principal', l.principal_outstanding, 'interest', l.interest_outstanding, 'liability', l.principal_outstanding + l.interest_outstanding,
        'remaining_limit', greatest(0, cfg.loan_max_principal - l.original_principal), 'status', l.status, 'draws', l.draws,
        'can_draw', cfg.loans_enabled AND l.original_principal < cfg.loan_max_principal,
        'max_repay', least(l.principal_outstanding + l.interest_outstanding, t.cash)) ORDER BY (l.status = 'OUTSTANDING') DESC, t.seq)
      FROM teams t JOIN loans l ON l.team_id = t.id WHERE l.status <> 'NONE'), '[]'::jsonb));
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
  PERFORM jse_require_role(a, 'ADMIN', 'BANK', 'VIEWER', 'PARTICIPANT');
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
    'rows', coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'created_at', c.created_at, 'team', t.code, 'team_name', t.name, 'order_no', o.order_no,
        'type', c.entry_type, 'debit', c.debit, 'credit', c.credit, 'balance_after', c.balance_after, 'note', c.note, 'actor', c.actor_name) ORDER BY c.id DESC)
      FROM (SELECT * FROM cash_ledger c0 WHERE (v_team IS NULL OR c0.team_id = v_team) AND (v_type IS NULL OR c0.entry_type = v_type)
              AND (v_q IS NULL OR c0.note ILIKE '%' || v_q || '%')
            ORDER BY c0.id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) c
      JOIN teams t ON t.id = c.team_id LEFT JOIN orders o ON o.id = c.order_id), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Audit log (immutable event history)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_audit_log(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_action text := nullif(upper(trim(coalesce(p->>'action', ''))), '');
  v_team integer; v_q text := nullif(trim(coalesce(p->>'q', '')), '');
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
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
-- Broker commission: ranking and the per-transaction register (reconciles to settled transactions)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_commissions(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_broker integer; v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'VIEWER');
  IF a->>'role' = 'BROKER' THEN v_broker := nullif(a->>'broker_id', '')::integer;
  ELSIF coalesce(p->>'broker', '') <> '' THEN SELECT id INTO v_broker FROM brokers WHERE code = upper(trim(p->>'broker')); v_broker := coalesce(v_broker, -1);
  END IF;
  RETURN jsonb_build_object('success', true, 'rate', (SELECT brokerage_rate FROM event_config WHERE id = 1),
    'own_broker', CASE WHEN a->>'role' = 'BROKER' THEN (SELECT code FROM brokers WHERE id = v_broker) END,
    'brokers', coalesce((SELECT jsonb_agg(x ORDER BY (x->>'rank')::integer) FROM (
      SELECT jsonb_build_object('rank', row_number() OVER (ORDER BY coalesce(c.amount, 0) DESC, b.code), 'broker', b.code, 'name', b.name,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id),
        'orders', coalesce(c.n, 0), 'buy_orders', coalesce(c.nb, 0), 'sell_orders', coalesce(c.ns, 0),
        'buy_volume', coalesce(c.bv, 0), 'sell_volume', coalesce(c.sv, 0), 'buy_quantity', coalesce(c.bq, 0), 'sell_quantity', coalesce(c.sq, 0),
        'total_trade_value', coalesce(c.tv, 0), 'brokerage_earned', coalesce(c.amount, 0),
        'pending_orders', (SELECT count(*) FROM orders o WHERE o.broker_id = b.id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING'))) AS x
      FROM brokers b LEFT JOIN (
        SELECT bc.broker_id, count(*) n, count(*) FILTER (WHERE bc.side = 'BUY') nb, count(*) FILTER (WHERE bc.side = 'SELL') ns,
               sum(bc.trade_value) FILTER (WHERE bc.side = 'BUY') bv, sum(bc.trade_value) FILTER (WHERE bc.side = 'SELL') sv,
               sum(o.quantity) FILTER (WHERE bc.side = 'BUY') bq, sum(o.quantity) FILTER (WHERE bc.side = 'SELL') sq,
               sum(bc.trade_value) tv, sum(bc.amount) amount
        FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id WHERE bc.reversed_at IS NULL GROUP BY bc.broker_id) c ON c.broker_id = b.id) q
      -- a broker sees only its own row (with its rank); staff see every broker
      WHERE a->>'role' <> 'BROKER' OR x->>'broker' = (SELECT code FROM brokers WHERE id = v_broker)), '[]'::jsonb),
    'transactions_total', (SELECT count(*) FROM broker_commissions bc WHERE v_broker IS NULL OR bc.broker_id = v_broker),
    'page', v_page, 'page_size', v_size,
    'transactions', coalesce((SELECT jsonb_agg(jsonb_build_object('created_at', bc.created_at, 'broker', b.code, 'broker_name', b.name,
        'order_no', o.order_no, 'team', t.code, 'team_name', t.name, 'symbol', s.symbol, 'security', s.name, 'side', bc.side,
        'quantity', o.quantity, 'price', o.price, 'trade_value', bc.trade_value, 'rate', bc.rate, 'amount', bc.amount,
        'status', CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END, 'reversed_at', bc.reversed_at) ORDER BY bc.id DESC)
      FROM (SELECT * FROM broker_commissions WHERE v_broker IS NULL OR broker_id = v_broker ORDER BY id DESC LIMIT v_size OFFSET (v_page - 1) * v_size) bc
      JOIN brokers b ON b.id = bc.broker_id JOIN orders o ON o.id = bc.order_id JOIN teams t ON t.id = bc.team_id JOIN securities s ON s.id = o.security_id), '[]'::jsonb),
    'totals', (SELECT jsonb_build_object('orders', count(*), 'trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(amount), 0))
               FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)),
    'reconciliation', (SELECT jsonb_build_object('commission_total', c.total, 'settled_brokerage_total', st.total, 'ok', c.total = st.total)
      FROM (SELECT coalesce(sum(amount), 0) AS total FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)) c,
           (SELECT coalesce(sum(st0.brokerage), 0) AS total FROM settlements st0 JOIN orders o0 ON o0.id = st0.order_id
            WHERE st0.reversed_at IS NULL AND st0.account_type = 'TEAM' AND o0.broker_id IS NOT NULL AND (v_broker IS NULL OR o0.broker_id = v_broker)) st));
END $$;

-- ---------------------------------------------------------------------------
-- Market News list (public)
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

-- ---------------------------------------------------------------------------
-- Market Intelligence (administrator / faculty only; embedded in Event Admin). Same canonical data as
-- portfolios, tracking and the market board.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_insights() RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH s AS (SELECT * FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL)),
       ev AS (SELECT status FROM event_control WHERE id = 1),
       rk AS (SELECT * FROM jse_ranked_teams()),
       tm AS (SELECT * FROM jse_team_metrics WHERE active),
       idx AS (SELECT jse_cms_index() AS j),
       br AS (SELECT count(*) FILTER (WHERE price > coalesce(index_base_price, base_price)) AS adv,
                     count(*) FILTER (WHERE price < coalesce(index_base_price, base_price)) AS dec,
                     count(*) FILTER (WHERE price = coalesce(index_base_price, base_price)) AS unch FROM s),
       flow AS (SELECT coalesce(sum(trade_value) FILTER (WHERE account_type = 'TEAM' AND side = 'BUY'), 0) AS team_buy,
                       coalesce(sum(trade_value) FILTER (WHERE account_type = 'TEAM' AND side = 'SELL'), 0) AS team_sell,
                       coalesce(sum(trade_value) FILTER (WHERE account_type = 'INSTITUTION' AND side = 'BUY'), 0) AS inst_buy,
                       coalesce(sum(trade_value) FILTER (WHERE account_type = 'INSTITUTION' AND side = 'SELL'), 0) AS inst_sell,
                       count(*) AS trades, coalesce(sum(trade_value), 0) AS value, coalesce(sum(brokerage), 0) AS brokerage
                FROM settlements WHERE reversed_at IS NULL),
       press AS (SELECT o.security_id,
                        sum(o.trade_value) FILTER (WHERE (o.account_type = 'TEAM' AND o.side = 'BUY') OR (o.account_type = 'INSTITUTION' AND o.side = 'BUY')) AS buy_v,
                        sum(o.trade_value) FILTER (WHERE (o.account_type = 'TEAM' AND o.side = 'SELL') OR (o.account_type = 'INSTITUTION' AND o.side = 'SELL')) AS sell_v,
                        count(*) AS n
                 FROM orders o WHERE o.created_at > now() - interval '30 minutes' AND o.status NOT IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED')
                 GROUP BY o.security_id)
  SELECT jsonb_build_object('success', true, 'status', ev.status,
    'index', idx.j,
    'breadth', jsonb_build_object('advances', br.adv, 'declines', br.dec, 'unchanged', br.unch),
    'sentiment', jsonb_build_object(
      'label', CASE WHEN (idx.j->>'change_pct')::numeric >= 0.5 AND br.adv > br.dec THEN 'BULLISH'
                    WHEN (idx.j->>'change_pct')::numeric <= -0.5 AND br.dec > br.adv THEN 'BEARISH' ELSE 'NEUTRAL' END,
      'index_change_pct', (idx.j->>'change_pct')::numeric,
      'recent_news', (SELECT jsonb_build_object('positive', count(*) FILTER (WHERE mood IN ('POSITIVE','VERY_POSITIVE','SUPER_POSITIVE')),
                        'negative', count(*) FILTER (WHERE mood IN ('NEGATIVE','SEVERE','VERY_SEVERE')), 'normal', count(*) FILTER (WHERE mood = 'NORMAL'))
                      FROM (SELECT mood FROM market_news WHERE reversed_at IS NULL ORDER BY id DESC LIMIT 12) z)),
    'flow', jsonb_build_object('team_buy_value', flow.team_buy, 'team_sell_value', flow.team_sell, 'net_team_flow', flow.team_buy - flow.team_sell,
      'trades', flow.trades, 'settled_value', flow.value, 'brokerage', flow.brokerage),
    'institutional_signal', jsonb_build_object('bought_value', flow.inst_buy, 'sold_value', flow.inst_sell, 'net', flow.inst_buy - flow.inst_sell,
      'label', CASE WHEN flow.inst_buy - flow.inst_sell > 0 THEN 'NET BUYING' WHEN flow.inst_buy - flow.inst_sell < 0 THEN 'NET SELLING' ELSE 'NEUTRAL' END),
    'top_gainers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, coalesce(x.index_base_price, x.base_price)) DESC)
                             FROM (SELECT * FROM s WHERE price > coalesce(index_base_price, base_price) ORDER BY jse_pct(price, coalesce(index_base_price, base_price)) DESC LIMIT 5) x), '[]'::jsonb),
    'top_losers', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY jse_pct(x.price, coalesce(x.index_base_price, x.base_price)))
                            FROM (SELECT * FROM s WHERE price < coalesce(index_base_price, base_price) ORDER BY jse_pct(price, coalesce(index_base_price, base_price)) LIMIT 5) x), '[]'::jsonb),
    'most_traded', coalesce((SELECT jsonb_agg(jse_security_json(x) ORDER BY x.traded_value DESC) FROM (SELECT * FROM s WHERE trade_count > 0 ORDER BY traded_value DESC LIMIT 8) x), '[]'::jsonb),
    'buy_pressure', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'name', s2.name, 'buy_value', coalesce(pr.buy_v, 0), 'sell_value', coalesce(pr.sell_v, 0), 'orders', pr.n)
                               ORDER BY coalesce(pr.buy_v, 0) - coalesce(pr.sell_v, 0) DESC)
                              FROM (SELECT * FROM press WHERE coalesce(buy_v, 0) > coalesce(sell_v, 0) ORDER BY coalesce(buy_v, 0) - coalesce(sell_v, 0) DESC LIMIT 5) pr
                              JOIN securities s2 ON s2.id = pr.security_id), '[]'::jsonb),
    'sell_pressure', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s2.symbol, 'name', s2.name, 'buy_value', coalesce(pr.buy_v, 0), 'sell_value', coalesce(pr.sell_v, 0), 'orders', pr.n)
                                ORDER BY coalesce(pr.sell_v, 0) - coalesce(pr.buy_v, 0) DESC)
                               FROM (SELECT * FROM press WHERE coalesce(sell_v, 0) > coalesce(buy_v, 0) ORDER BY coalesce(sell_v, 0) - coalesce(buy_v, 0) DESC LIMIT 5) pr
                               JOIN securities s2 ON s2.id = pr.security_id), '[]'::jsonb),
    'sectors', coalesce((SELECT jsonb_agg(jsonb_build_object('sector', z.sector, 'securities', z.n, 'avg_change_pct', z.chg, 'traded_value', z.tv, 'advances', z.adv, 'declines', z.dec)
                          ORDER BY z.chg DESC)
                         FROM (SELECT coalesce(sector, 'Other') AS sector, count(*) AS n, round(avg(jse_pct(price, coalesce(index_base_price, base_price))), 2) AS chg,
                                      sum(traded_value) AS tv, count(*) FILTER (WHERE price > coalesce(index_base_price, base_price)) AS adv,
                                      count(*) FILTER (WHERE price < coalesce(index_base_price, base_price)) AS dec
                               FROM s GROUP BY coalesce(sector, 'Other')) z), '[]'::jsonb),
    'net_worth', (SELECT jsonb_build_object('highest', max(net_worth), 'average', round(avg(net_worth), 2), 'lowest', min(net_worth),
                  'total', sum(net_worth), 'teams', count(*), 'eligible', count(*) FILTER (WHERE eligible), 'assessment_met', count(*) FILTER (WHERE assessment_met),
                  'profitable', count(*) FILTER (WHERE pnl > 0)) FROM tm),
    'orders', (SELECT jsonb_build_object('total', count(*), 'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
                  'pending', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
                  'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'), 'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
                  'stale', count(*) FILTER (WHERE reject_code = 'PRICE_STALE')) FROM orders),
    'final', ev.status IN ('CLOSED', 'FINALIZED'),
    'winner', (SELECT jsonb_build_object('team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric, 'broker', m->>'broker',
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2)) FROM rk WHERE award = 'WINNER'),
    'runner_up', (SELECT jsonb_build_object('team', m->>'code', 'name', m->>'name', 'net_worth', (m->>'net_worth')::numeric, 'broker', m->>'broker',
                  'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2)) FROM rk WHERE award = 'RUNNER_UP'),
    'leaderboard', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award, 'team', m->>'code', 'name', m->>'name',
                  'net_worth', (m->>'net_worth')::numeric, 'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2),
                  'buys', (m->>'settled_buys')::integer, 'sells', (m->>'settled_sells')::integer, 'eligible', (m->>'eligible')::boolean,
                  'eligibility_status', m->>'eligibility_status') ORDER BY rank_overall)
                  FROM rk WHERE rank_overall <= 10), '[]'::jsonb),
    'alerts', (SELECT coalesce(jsonb_agg(al) FILTER (WHERE al IS NOT NULL), '[]'::jsonb) FROM (SELECT unnest(ARRAY[
        CASE WHEN (SELECT count(*) FROM orders WHERE status = 'PIT_PENDING' AND created_at < now() - interval '3 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM orders WHERE status = 'PIT_PENDING' AND created_at < now() - interval '3 minutes') || ' order(s) waiting more than 3 min for the Pit Manager') END,
        CASE WHEN (SELECT count(*) FROM orders WHERE status = 'EXCHANGE_PENDING' AND coalesce(executed_at, created_at) < now() - interval '3 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM orders WHERE status = 'EXCHANGE_PENDING' AND coalesce(executed_at, created_at) < now() - interval '3 minutes') || ' executed order(s) waiting more than 3 min at the Exchange') END,
        CASE WHEN (SELECT count(*) FROM orders WHERE status IN ('EXCHANGE_APPROVED','BANK_PENDING') AND exchange_at < now() - interval '3 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM orders WHERE status IN ('EXCHANGE_APPROVED','BANK_PENDING') AND exchange_at < now() - interval '3 minutes') || ' approved order(s) waiting more than 3 min at the Bank') END,
        CASE WHEN (SELECT count(*) FROM orders WHERE reject_code = 'PRICE_STALE' AND pit_at > now() - interval '10 minutes') > 0
             THEN jsonb_build_object('level', 'info', 'text', (SELECT count(*) FROM orders WHERE reject_code = 'PRICE_STALE' AND pit_at > now() - interval '10 minutes') || ' order(s) went PRICE STALE in the last 10 min — brokers must resubmit') END,
        CASE WHEN (SELECT count(*) FROM risk_events WHERE kind = 'SHORT_SELL_ATTEMPT' AND created_at > now() - interval '15 minutes') > 0
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM risk_events WHERE kind = 'SHORT_SELL_ATTEMPT' AND created_at > now() - interval '15 minutes') || ' short-selling attempt(s) in the last 15 min') END,
        CASE WHEN ev.status IN ('LIVE', 'SETTLEMENT_ONLY') AND (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NULL) > 0
             THEN jsonb_build_object('level', 'info', 'text', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NULL) || ' IPO(s) not listed yet') END,
        CASE WHEN (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active) <> (idx.j->>'equity_components')::integer
             THEN jsonb_build_object('level', 'bad', 'text', 'CMS INDEX component mismatch: check the listed equities') END,
        CASE WHEN ev.status IN ('CLOSED', 'FINALIZED') AND (SELECT count(*) FROM tm WHERE NOT cash_rule_met) > 0
             THEN jsonb_build_object('level', 'info', 'text', (SELECT count(*) FROM tm WHERE NOT cash_rule_met) || ' team(s) do not meet the closing cash rule') END,
        CASE WHEN (SELECT count(*) FROM tm WHERE NOT loan_repaid) > 0 AND ev.status IN ('SETTLEMENT_ONLY', 'CLOSED')
             THEN jsonb_build_object('level', 'warn', 'text', (SELECT count(*) FROM tm WHERE NOT loan_repaid) || ' team(s) still have loans outstanding (not eligible until repaid)') END
      ]) AS al) z),
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
              'account_type', st.account_type, 'at', st.settled_at) ORDER BY st.settled_at DESC)
              FROM (SELECT * FROM settlements WHERE reversed_at IS NULL ORDER BY id DESC LIMIT 12) st JOIN securities s2 ON s2.id = st.security_id), '[]'::jsonb))
  FROM ev, idx, br, flow
$$;

-- ---------------------------------------------------------------------------
-- Institutional desk
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_institutional(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE i institutions%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO i FROM institutions WHERE id = coalesce(CASE WHEN a->>'role' <> 'INSTITUTIONAL' THEN nullif(p->>'institution_id', '')::integer END,
                                                        nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'institutions', (SELECT jsonb_agg(jsonb_build_object('id', x.id, 'code', x.code, 'name', x.name) ORDER BY x.id) FROM institutions x),
    -- counterparty choices: participant team code and team name only (no team cash or holdings)
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', t.code, 'name', t.name) ORDER BY t.seq) FROM teams t WHERE t.active), '[]'::jsonb),
    'account', jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name, 'initial_cash', i.initial_cash, 'cash', i.cash,
       'holdings_value', coalesce((SELECT sum(ih.quantity * s.price) FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id), 0)),
    'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'security', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'quantity', ih.quantity, 'avg_price', round(ih.cost_basis / nullif(ih.quantity, 0), 2), 'current_price', s.price,
        'market_value', ih.quantity * s.price) ORDER BY ih.quantity * s.price DESC)
      FROM institutional_holdings ih JOIN securities s ON s.id = ih.security_id WHERE ih.institution_id = i.id AND ih.quantity > 0), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(o.id) ORDER BY o.id DESC) FROM (SELECT id FROM orders WHERE institution_id = i.id ORDER BY id DESC LIMIT 60) o), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('orders', count(*), 'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'pending', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
       'bought_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'BUY'), 0),
       'sold_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'SELL'), 0)) FROM orders WHERE institution_id = i.id),
    'ledger', coalesce((SELECT jsonb_agg(jsonb_build_object('type', l.entry_type, 'debit', l.debit, 'credit', l.credit, 'balance_after', l.balance_after,
        'note', l.note, 'at', l.created_at) ORDER BY l.id DESC) FROM (SELECT * FROM institution_ledger WHERE institution_id = i.id ORDER BY id DESC LIMIT 30) l), '[]'::jsonb));
END $$;

-- ---------------------------------------------------------------------------
-- Event admin dashboard state
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_admin_state(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE v_idx jsonb := jse_cms_index();
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jse_event_status() || jsonb_build_object(
    'config_full', (SELECT to_jsonb(c) - 'min_cash_buffer' - 'participant_order_entry' FROM event_config c WHERE id = 1),
    'stats', (SELECT jsonb_build_object('total_trade_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'total_brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'pending_orders', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
        'settled_orders', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected_orders', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
        'stale_orders', count(*) FILTER (WHERE reject_code = 'PRICE_STALE'),
        'slips', (SELECT count(*) FROM trading_slips),
        'open_instructions', (SELECT count(*) FROM instructions WHERE status = 'OPEN'),
        'institutional_orders', count(*) FILTER (WHERE account_type = 'INSTITUTION'),
        'news_items', (SELECT count(*) FROM market_news WHERE reversed_at IS NULL),
        'loans_outstanding', (SELECT coalesce(sum(principal_outstanding + interest_outstanding), 0) FROM loans),
        'risk', (SELECT jsonb_build_object('short_sell', count(*) FILTER (WHERE kind = 'SHORT_SELL_ATTEMPT'),
                   'cash_shortfall', count(*) FILTER (WHERE kind = 'CASH_SHORTFALL_ATTEMPT'),
                   'insufficient_balance', count(*) FILTER (WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION')) FROM risk_events)) FROM orders),
    'market', jsonb_build_object('index', v_idx, 'breadth', jse_market()->'breadth'),
    'consistency', (SELECT jsonb_build_object(
        'equities_active', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
        'index_equity_components', (v_idx->>'equity_components')::integer,
        'market_stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
        'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active),
        'ipos_listed', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL),
        'index_ipo_components', (v_idx->>'ipo_components')::integer,
        'index_components', (v_idx->>'components')::integer,
        'ok', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active) = (v_idx->>'equity_components')::integer
              AND (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL) = (v_idx->>'ipo_components')::integer)),
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
    'ipo_listing', jse_listing_state(a),
    'ipo_admin', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'stage', jse_ipo_stage(s.id),
        'applications', (SELECT count(*) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'applied_lots', (SELECT coalesce(sum(lots), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'prospectus_fields', (SELECT (CASE WHEN pr.company_description IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.issue_details IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.business_overview IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.financial_information IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.risk_factors IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.use_of_proceeds IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.promoters_management IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.other_information IS NOT NULL THEN 1 ELSE 0 END)
              FROM ipo_prospectus pr WHERE pr.security_id = s.id),
        'has_document', (SELECT document_data IS NOT NULL OR document_url IS NOT NULL FROM ipo_prospectus pr WHERE pr.security_id = s.id)) ORDER BY s.display_order)
      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb),
    'team_names', (SELECT jsonb_build_object('seed', team_name_seed, 'assigned_at', team_names_assigned_at, 'locked', team_names_locked_at IS NOT NULL,
        'locked_at', team_names_locked_at, 'locked_by', team_names_locked_by, 'pool_size', (SELECT count(*) FROM team_name_pool WHERE active))
      FROM event_config WHERE id = 1),
    'brokers', (SELECT jsonb_agg(jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id)) ORDER BY b.code) FROM brokers b),
    'unassigned_teams', (SELECT count(*) FROM teams WHERE broker_id IS NULL),
    'users', (SELECT jsonb_object_agg(role, n) FROM (SELECT role, count(*) n FROM app_users WHERE active GROUP BY role) u));
END $$;

-- ---------------------------------------------------------------------------
-- Share certificates (settled share ownership; separate from trading slips) and award certificates
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jse_share_certificates(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE t teams%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER', 'PARTICIPANT', 'BROKER');
  SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                                             ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Choose a team.', 404); END IF;
  IF a->>'role' = 'BROKER' AND t.broker_id IS DISTINCT FROM nullif(a->>'broker_id', '')::integer THEN PERFORM jse_fail('FORBIDDEN', 'Not one of your teams.', 403); END IF;
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1), 'as_of', now(),
    'status', (SELECT status FROM event_control WHERE id = 1),
    'team', jsonb_build_object('code', t.code, 'name', t.name, 'section', t.section, 'members', t.members,
       'broker', (SELECT code FROM brokers WHERE id = t.broker_id), 'broker_name', (SELECT name FROM brokers WHERE id = t.broker_id)),
    'certificates', coalesce((SELECT jsonb_agg(jsonb_build_object('certificate_no', 'SC-' || t.seq || '-' || s.id || '-' || h.quantity,
        'symbol', s.symbol, 'security', s.name, 'asset_type', CASE WHEN s.kind = 'IPO' THEN 'IPO share' ELSE 'Equity share' END,
        'quantity', h.quantity, 'avg_cost', round(h.trade_cost / nullif(h.quantity, 0), 2), 'last_settled_at', h.updated_at,
        'allotted', (SELECT coalesce(sum(quantity), 0) FROM ipo_allotments al WHERE al.team_id = t.id AND al.security_id = s.id AND al.reversed_at IS NULL),
        'settled_trades', (SELECT count(*) FROM settlements st WHERE st.team_id = t.id AND st.security_id = s.id AND st.reversed_at IS NULL)) ORDER BY s.display_order)
      FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = t.id AND h.quantity > 0), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION jse_certificates(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'event_name', (SELECT event_name FROM event_config WHERE id = 1),
    'status', (SELECT status FROM event_control WHERE id = 1), 'generated_at', now(),
    'ranking', coalesce((SELECT jsonb_agg(jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award, 'team', m->>'code',
        'name', m->>'name', 'section', m->>'section', 'members', m->>'members', 'broker', m->>'broker', 'broker_name', m->>'broker_name',
        'net_worth', (m->>'net_worth')::numeric, 'pnl', (m->>'pnl')::numeric, 'return_pct', round((m->>'return_pct')::numeric, 2),
        'buys', (m->>'settled_buys')::integer, 'sells', (m->>'settled_sells')::integer, 'eligible', (m->>'eligible')::boolean,
        'eligibility_status', m->>'eligibility_status', 'cash_rule_met', (m->>'cash_rule_met')::boolean, 'loan_repaid', (m->>'loan_repaid')::boolean)
        ORDER BY coalesce(rank_eligible, 100000 + rank_overall))
      FROM jse_ranked_teams()), '[]'::jsonb),
    'top_brokers', (SELECT jse_commissions(a, '{}'::jsonb)->'brokers'));
END $$;

CREATE OR REPLACE FUNCTION jse_reports(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jsonb_build_object('success', true, 'generated_at', now(),
    'event', jse_event_status(),
    'portfolios', jse_portfolios(a, '{}'::jsonb) - 'teams',
    'commissions', jse_commissions(a, '{"page_size":10}'::jsonb) - 'transactions',
    'insights', jse_insights(),
    'reconciliation', jse_cash(a, '{"page_size":10}'::jsonb)->'reconciliation');
END $$;

INSERT INTO schema_migrations(version) VALUES ('004_reads');
