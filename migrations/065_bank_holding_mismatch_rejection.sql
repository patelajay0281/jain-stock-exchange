-- JAIN STOCK EXCHANGE — settlement holding mismatch hardening
DO $do$
DECLARE f text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO f
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean'
  ORDER BY p.oid DESC LIMIT 1;
  IF position('SHORT_MISMATCH' in f)>0 THEN
    f:=replace(f,
$old$    IF v_before_qty<v_order.quantity THEN
      RETURN jsonb_build_object('ok',false,'code','SHORT_MISMATCH','warning',true,'approval_allowed',false,'order_id',v_order.id,'holding_qty',v_before_qty,'required_qty',v_order.quantity,'message','Holding changed since exchange approval; this SELL cannot be settled.');
    END IF;$old$,
$new$    IF v_before_qty<v_order.quantity THEN
      INSERT INTO settlement_rejections(order_id,team_id,broker_id,available_cash_paise,required_cash_paise,shortfall_paise,reason,rejected_by_user_id)
      VALUES(v_order.id,v_team.id,v_order.broker_id,v_team.cash_paise,v_order.trade_value_paise,0,'Holding changed after Exchange approval; SELL quantity is no longer available.',p_user_id)
      ON CONFLICT(order_id) DO NOTHING;
      INSERT INTO audit_log(actor_user_id,actor_email,actor_role,action,order_id,team_id,asset_id,side,quantity,trade_value_paise,risk_status,what_happened,details_json)
      VALUES(p_user_id,v_user.email,v_user.role,'BANK_HOLDING_MISMATCH',v_order.id,v_order.team_id,v_order.asset_id,v_order.side,v_order.quantity,v_order.trade_value_paise,'HOLDING_MISMATCH',
        'Bank rejected the SELL because the customer team holding changed after Exchange approval.',
        jsonb_build_object('holding_qty',v_before_qty,'required_qty',v_order.quantity,'approval_allowed',false));
      UPDATE orders SET status='BANK_REJECTED',bank_reviewed_by_user_id=p_user_id,bank_reviewed_at=NOW() WHERE id=v_order.id;
      RETURN jsonb_build_object('ok',false,'code','SHORT_MISMATCH','warning',true,'approval_allowed',false,'order_id',v_order.id,'holding_qty',v_before_qty,'required_qty',v_order.quantity,'status','BANK_REJECTED',
        'message','Holding changed after Exchange approval. The SELL order was rejected by Bank.');
    END IF;$new$);
    EXECUTE f;
  END IF;

  SELECT pg_get_functiondef(p.oid) INTO f
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='jse_bank_institutional_action'
    AND pg_get_function_identity_arguments(p.oid)='p_user_id bigint, p_order_id bigint, p_action text, p_warning_ack boolean'
  ORDER BY p.oid DESC LIMIT 1;
  IF position('v_after_inst_qty:=v_before_inst_qty-v_order.quantity' in f)>0
     AND position('BANK_INSTITUTION_HOLDING_MISMATCH' in f)=0 THEN
    f:=replace(f,
$old$    v_after_inst_qty:=v_before_inst_qty-v_order.quantity;
    v_after_inst_avg:=CASE WHEN v_after_inst_qty>0 THEN v_before_inst_avg ELSE 0 END;$old$,
$new$    IF v_before_inst_qty<v_order.quantity THEN
      INSERT INTO audit_log(actor_user_id,actor_email,actor_role,action,order_id,team_id,asset_id,side,quantity,trade_value_paise,risk_status,what_happened,details_json)
      VALUES(p_user_id,v_user.email,v_user.role,'BANK_INSTITUTION_HOLDING_MISMATCH',v_order.id,v_order.team_id,v_order.asset_id,v_order.side,v_order.quantity,v_order.trade_value_paise,'INSTITUTION_HOLDING_MISMATCH',
        'Bank rejected the institutional SELL because institutional inventory is insufficient at settlement time.',
        jsonb_build_object('institution_id',v_inst.id,'holding_qty',v_before_inst_qty,'required_qty',v_order.quantity,'approval_allowed',false));
      UPDATE orders SET status='BANK_REJECTED',bank_reviewed_by_user_id=p_user_id,bank_reviewed_at=NOW() WHERE id=v_order.id;
      RETURN jsonb_build_object('ok',false,'code','INSTITUTION_HOLDING_MISMATCH','warning',true,'approval_allowed',false,'order_id',v_order.id,
        'holding_qty',v_before_inst_qty,'required_qty',v_order.quantity,'status','BANK_REJECTED',
        'message','Institutional holding is insufficient. The SELL order was rejected by Bank.');
    END IF;
    v_after_inst_qty:=v_before_inst_qty-v_order.quantity;
    v_after_inst_avg:=CASE WHEN v_after_inst_qty>0 THEN v_before_inst_avg ELSE 0 END;$new$);
    EXECUTE f;
  END IF;
END $do$;