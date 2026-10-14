-- 017: Make per-team IPO allotments and official broker roster visible on the Portfolio list only.
-- Does not change Team-page/account-page UI or the existing portfolio-detail/account functions.

UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6
  AND lower(broker_code) = 'arohan';

CREATE OR REPLACE FUNCTION public.jse_portfolios(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $function$
DECLARE
  v_rows jsonb;
  v_status text;
  cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1;

  SELECT jsonb_agg(
    r.m || jsonb_build_object(
      'rank', r.rank_overall,
      'rank_eligible', r.rank_eligible,
      'award', r.award,
      'roster_broker_code', COALESCE(ba.broker_code, r.m->>'broker'),
      'roster_broker_name', COALESCE(ba.broker_name, r.m->>'broker_name'),
      'ipo_allotments', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'symbol', sec.symbol,
          'name', sec.name,
          'lots', al.lots,
          'quantity', al.quantity,
          'price', al.price,
          'amount', al.amount
        ) ORDER BY sec.display_order, al.id)
        FROM public.ipo_allotments al
        JOIN public.securities sec ON sec.id = al.security_id
        WHERE al.team_id = (r.m->>'team_id')::integer
          AND al.reversed_at IS NULL
          AND al.quantity > 0
      ), '[]'::jsonb)
    ) ORDER BY (r.m->>'seq')::integer
  )
  INTO v_rows
  FROM public.jse_ranked_teams() r
  LEFT JOIN public.broker_roster_aliases ba
    ON ba.internal_broker_id = nullif(r.m->>'broker_id','')::integer;

  RETURN jsonb_build_object(
    'success', true,
    'event_status', v_status,
    'final', v_status IN ('CLOSED', 'FINALIZED'),
    'criterion', 'Net Worth = liquid cash + holdings × closing price (loans are not deducted). Winner = highest eligible Net Worth; Runner-Up = second highest. Ties go to the lower team code.',
    'eligibility_rule', 'Eligible = at least ' || cfg.min_buy_trades || ' settled BUY and ' || cfg.min_sell_trades || ' settled SELL listed-stock trades (IPO allotments do not count)' ||
      CASE WHEN cfg.loan_repayment_required THEN ' + loan fully repaid' ELSE '' END || ' + closing cash rule (base cash ≤ ' || jse_inr(cfg.cash_rule_limit::bigint) || ', evaluated at close).',
    'initial_capital', cfg.initial_capital,
    'cash_rule_limit', cfg.cash_rule_limit,
    'min_buy_trades', cfg.min_buy_trades,
    'min_sell_trades', cfg.min_sell_trades,
    'loan_repayment_required', cfg.loan_repayment_required,
    'stats', (
      SELECT jsonb_build_object(
        'teams', count(*),
        'total_net_worth', sum(net_worth),
        'average_net_worth', round(avg(net_worth), 2),
        'highest_net_worth', max(net_worth),
        'lowest_net_worth', min(net_worth),
        'total_cash', sum(cash),
        'total_holdings', sum(holdings_value),
        'eligible', count(*) FILTER (WHERE eligible),
        'assessment_met', count(*) FILTER (WHERE assessment_met),
        'loans_unpaid', count(*) FILTER (WHERE NOT loan_repaid),
        'cash_rule_met', count(*) FILTER (WHERE cash_rule_met),
        'cash_rule_not_met', count(*) FILTER (WHERE NOT cash_rule_met),
        'profitable', count(*) FILTER (WHERE pnl > 0),
        'short_sell_attempts', sum(short_sell_attempts),
        'cash_shortfall_attempts', sum(cash_shortfall_attempts),
        'insufficient_balance_rejections', sum(insufficient_balance_rejections),
        'total_brokerage', sum(brokerage_paid),
        'loans_outstanding', sum(loan_principal + loan_interest)
      ) FROM public.jse_team_metrics WHERE active
    ),
    'winner', (
      SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award)
      FROM public.jse_ranked_teams() WHERE award = 'WINNER'
    ),
    'runner_up', (
      SELECT m || jsonb_build_object('rank', rank_overall, 'rank_eligible', rank_eligible, 'award', award)
      FROM public.jse_ranked_teams() WHERE award = 'RUNNER_UP'
    ),
    'teams', COALESCE(v_rows, '[]'::jsonb)
  );
END $function$;

INSERT INTO public.schema_migrations(version) VALUES ('017_portfolio_ipo_visibility');
