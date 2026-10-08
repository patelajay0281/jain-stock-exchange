DO $do$
DECLARE f text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO f FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_exchange_action' ORDER BY p.oid DESC LIMIT 1;
  f:=replace(f,
'  IF p_action=''APPROVE'' THEN
    IF v_order.status<>''PENDING_EXCHANGE'' THEN RAISE EXCEPTION ''Order is already %'',v_order.status; END IF;',
'  IF p_action=''APPROVE'' THEN
    IF v_order.status IN (''EXCHANGE_APPROVED'',''SETTLED'') THEN
      RETURN jsonb_build_object(''ok'',true,''order_id'',v_order.id,''status'',v_order.status::text,''idempotent_replay'',true);
    END IF;
    IF v_order.status<>''PENDING_EXCHANGE'' THEN RAISE EXCEPTION ''Order is already %'',v_order.status; END IF;');
  f:=replace(f,
'  IF p_action=''REJECT'' THEN
    IF v_order.status<>''PENDING_EXCHANGE'' THEN RAISE EXCEPTION ''Only pending exchange orders can be rejected''; END IF;',
'  IF p_action=''REJECT'' THEN
    IF v_order.status=''EXCHANGE_REJECTED'' THEN
      RETURN jsonb_build_object(''ok'',true,''order_id'',v_order.id,''status'',''EXCHANGE_REJECTED'',''idempotent_replay'',true);
    END IF;
    IF v_order.status<>''PENDING_EXCHANGE'' THEN RAISE EXCEPTION ''Only pending exchange orders can be rejected''; END IF;');
  EXECUTE f;

  SELECT pg_get_functiondef(p.oid) INTO f FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean'
  ORDER BY p.oid DESC LIMIT 1;
  f:=replace(f,
'  IF p_action=''REJECT'' THEN
    IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Only exchange-approved orders can be rejected''; END IF;',
'  IF p_action=''REJECT'' THEN
    IF v_order.status=''BANK_REJECTED'' THEN
      RETURN jsonb_build_object(''ok'',true,''order_id'',v_order.id,''status'',''BANK_REJECTED'',''idempotent_replay'',true);
    END IF;
    IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Only exchange-approved orders can be rejected''; END IF;');
  f:=replace(f,
'  IF p_action<>''APPROVE'' THEN RAISE EXCEPTION ''Unknown bank action''; END IF;
  IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Order must be exchange approved before settlement''; END IF;',
'  IF p_action<>''APPROVE'' THEN RAISE EXCEPTION ''Unknown bank action''; END IF;
  IF v_order.status=''SETTLED'' THEN
    RETURN jsonb_build_object(''ok'',true,''order_id'',v_order.id,''status'',''SETTLED'',''idempotent_replay'',true);
  END IF;
  IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Order must be exchange approved before settlement''; END IF;');
  EXECUTE f;

  SELECT pg_get_functiondef(p.oid) INTO f FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_institutional_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean'
  ORDER BY p.oid DESC LIMIT 1;
  f:=replace(f,
'  IF p_action=''REJECT'' THEN
    IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Only exchange-approved orders can be rejected''; END IF;',
'  IF p_action=''REJECT'' THEN
    IF v_order.status=''BANK_REJECTED'' THEN
      RETURN jsonb_build_object(''ok'',true,''order_id'',v_order.id,''status'',''BANK_REJECTED'',''idempotent_replay'',true);
    END IF;
    IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Only exchange-approved orders can be rejected''; END IF;');
  f:=replace(f,
'  IF p_action<>''APPROVE'' THEN RAISE EXCEPTION ''Unknown bank action''; END IF;
  IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Order must be exchange approved before settlement''; END IF;',
'  IF p_action<>''APPROVE'' THEN RAISE EXCEPTION ''Unknown bank action''; END IF;
  IF v_order.status=''SETTLED'' THEN
    RETURN jsonb_build_object(''ok'',true,''order_id'',v_order.id,''status'',''SETTLED'',''idempotent_replay'',true);
  END IF;
  IF v_order.status<>''EXCHANGE_APPROVED'' THEN RAISE EXCEPTION ''Order must be exchange approved before settlement''; END IF;');
  EXECUTE f;
END $do$;