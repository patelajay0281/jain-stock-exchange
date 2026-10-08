-- JAIN STOCK EXCHANGE — make order idempotency race-safe for high-concurrency event traffic
DO $$
DECLARE def text; newdef text; fn regprocedure;
BEGIN
  SELECT p.oid::regprocedure INTO fn
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_create_order_for_team'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_team_id bigint, p_asset_id bigint, p_side order_side, p_quantity bigint, p_price_paise bigint, p_idempotency_key text';
  SELECT pg_get_functiondef(fn) INTO def;
  newdef:=replace(def,
    '  RETURNING * INTO v_order;
  INSERT INTO audit_log',
    '  ON CONFLICT (created_by_user_id,idempotency_key) DO NOTHING
  RETURNING * INTO v_order;
  IF NOT FOUND AND NULLIF(p_idempotency_key,'''') IS NOT NULL THEN
    SELECT * INTO v_existing FROM orders WHERE created_by_user_id=p_user_id AND idempotency_key=p_idempotency_key;
    IF FOUND THEN
      RETURN jsonb_build_object(''ok'',true,''order_id'',v_existing.id,''order_code'',v_existing.order_code,''status'',v_existing.status::text,''idempotent_replay'',true);
    END IF;
    RAISE EXCEPTION ''Could not create idempotent order'';
  END IF;
  INSERT INTO audit_log');
  IF newdef=def THEN RAISE EXCEPTION 'Participant idempotency patch did not match'; END IF;
  EXECUTE newdef;

  SELECT p.oid::regprocedure INTO fn
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_create_institutional_order'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_team_id bigint, p_asset_id bigint, p_side order_side, p_quantity bigint, p_price_paise bigint, p_idempotency_key text';
  SELECT pg_get_functiondef(fn) INTO def;
  newdef:=replace(def,
    '  RETURNING * INTO v_order;
  INSERT INTO audit_log',
    '  ON CONFLICT (created_by_user_id,idempotency_key) DO NOTHING
  RETURNING * INTO v_order;
  IF NOT FOUND AND NULLIF(p_idempotency_key,'''') IS NOT NULL THEN
    SELECT * INTO v_existing FROM orders WHERE created_by_user_id=v_user.id AND idempotency_key=p_idempotency_key;
    IF FOUND THEN
      RETURN jsonb_build_object(''ok'',true,''order_id'',v_existing.id,''order_code'',v_existing.order_code,''status'',v_existing.status::text,''idempotent_replay'',true);
    END IF;
    RAISE EXCEPTION ''Could not create idempotent institutional order'';
  END IF;
  INSERT INTO audit_log');
  IF newdef=def THEN RAISE EXCEPTION 'Institutional idempotency patch did not match'; END IF;
  EXECUTE newdef;
END $$;