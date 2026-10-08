-- JAIN STOCK EXCHANGE — restore the true prior traded price on settlement undo
DO $$
DECLARE def text; fn regprocedure; old text; neu text;
BEGIN
  SELECT p.oid::regprocedure INTO fn
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_undo_redo'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_action text';
  SELECT pg_get_functiondef(fn) INTO def;
  old:='    SELECT COALESCE(MAX(ph.new_price_paise),a.base_price_paise) INTO v_prior_price
    FROM assets a LEFT JOIN price_history ph ON ph.asset_id=a.id AND ph.order_id<>v_order.id
    WHERE a.id=v_asset.id;';
  neu:='    SELECT ph.new_price_paise INTO v_prior_price
    FROM price_history ph
    WHERE ph.asset_id=v_asset.id AND ph.order_id<>v_order.id
    ORDER BY ph.changed_at DESC, ph.id DESC
    LIMIT 1;
    IF v_prior_price IS NULL THEN
      SELECT a.base_price_paise INTO v_prior_price FROM assets a WHERE a.id=v_asset.id;
    END IF;';
  IF position(old in def)=0 THEN RAISE EXCEPTION 'Undo price restoration block not found'; END IF;
  def:=replace(def,old,neu);
  EXECUTE def;
END $$;