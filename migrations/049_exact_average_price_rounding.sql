-- JAIN STOCK EXCHANGE — preserve exact weighted-average price precision in paise
DO $$
DECLARE
  def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO def
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean';
  IF def IS NULL THEN RAISE EXCEPTION 'jse_bank_action overload not found'; END IF;
  def:=replace(def,
    '(COALESCE(v_h.cost_basis_paise,0)+v_order.trade_value_paise)/v_after_qty',
    'ROUND((COALESCE(v_h.cost_basis_paise,0)+v_order.trade_value_paise)::numeric/NULLIF(v_after_qty,0))::bigint');
  EXECUTE def;

  SELECT pg_get_functiondef(p.oid) INTO def
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_institutional_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean';
  IF def IS NULL THEN RAISE EXCEPTION 'jse_bank_institutional_action overload not found'; END IF;
  def:=replace(def,
    '(COALESCE(v_inst_h.cost_basis_paise,0)+v_order.trade_value_paise)/v_after_inst_qty',
    'ROUND((COALESCE(v_inst_h.cost_basis_paise,0)+v_order.trade_value_paise)::numeric/NULLIF(v_after_inst_qty,0))::bigint');
  def:=replace(def,
    '(COALESCE(v_team_h.cost_basis_paise,0)+v_order.trade_value_paise)/v_after_team_qty',
    'ROUND((COALESCE(v_team_h.cost_basis_paise,0)+v_order.trade_value_paise)::numeric/NULLIF(v_after_team_qty,0))::bigint');
  EXECUTE def;
END $$;