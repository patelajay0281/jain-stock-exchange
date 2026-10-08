-- JAIN STOCK EXCHANGE — accounting corrections
-- Preserve cumulative interest paid when a loan closes, and calculate own-capital
-- usage net of outstanding principal so borrowed cash is not counted as own cash.

DO $$
DECLARE f text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO f
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_loan_action_for_team'
  ORDER BY p.oid DESC LIMIT 1;
  f:=replace(f,'interest_paid_paise=CASE WHEN v_closing THEN 0 ELSE interest_paid_paise+v_interest_paid END,','interest_paid_paise=interest_paid_paise+v_interest_paid,');
  EXECUTE f;

  SELECT pg_get_functiondef(p.oid) INTO f
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_finalize_event'
  ORDER BY p.oid DESC LIMIT 1;
  f:=replace(f,'interest_paid_paise=CASE WHEN v_closing THEN 0 ELSE interest_paid_paise+v_interest END,','interest_paid_paise=interest_paid_paise+v_interest,');
  EXECUTE f;

  SELECT pg_get_functiondef(p.oid) INTO f
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean'
  ORDER BY p.oid DESC LIMIT 1;
  f:=replace(f,
    'peak_own_capital_used_paise=GREATEST(peak_own_capital_used_paise,LEAST(base_capital_paise,GREATEST(0,base_capital_paise-v_after_cash)))',
    'peak_own_capital_used_paise=GREATEST(peak_own_capital_used_paise,LEAST(base_capital_paise,GREATEST(0,base_capital_paise-GREATEST(0,v_after_cash-COALESCE((SELECT SUM(l.principal_outstanding_paise) FROM loans l WHERE l.team_id=v_team.id AND l.status=''OPEN''),0)))))');
  f:=replace(f,
    'peak_own_capital_used_paise=GREATEST(peak_own_capital_used_paise,LEAST(base_capital_paise,GREATEST(0,base_capital_paise-GREATEST(0,v_after_cash))))',
    'peak_own_capital_used_paise=GREATEST(peak_own_capital_used_paise,LEAST(base_capital_paise,GREATEST(0,base_capital_paise-GREATEST(0,v_after_cash-COALESCE((SELECT SUM(l.principal_outstanding_paise) FROM loans l WHERE l.team_id=v_team.id AND l.status=''OPEN''),0)))))');
  EXECUTE f;

  SELECT pg_get_functiondef(p.oid) INTO f
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_institutional_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean'
  ORDER BY p.oid DESC LIMIT 1;
  f:=replace(f,
    'peak_own_capital_used_paise=GREATEST(peak_own_capital_used_paise,LEAST(base_capital_paise,GREATEST(0,base_capital_paise-v_after_team_cash)))',
    'peak_own_capital_used_paise=GREATEST(peak_own_capital_used_paise,LEAST(base_capital_paise,GREATEST(0,base_capital_paise-GREATEST(0,v_after_team_cash-COALESCE((SELECT SUM(l.principal_outstanding_paise) FROM loans l WHERE l.team_id=v_team.id AND l.status=''OPEN''),0)))))');
  EXECUTE f;
END $$;
