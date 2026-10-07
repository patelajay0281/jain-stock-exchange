-- JAIN STOCK EXCHANGE — customer-team order and loan RPCs
CREATE OR REPLACE FUNCTION public.jse_create_order_for_team(
  p_user_id bigint,p_team_id bigint,p_asset_id bigint,p_side public.order_side,
  p_quantity bigint,p_price_paise bigint,p_idempotency_key text
) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE
  v_user users%ROWTYPE;v_team teams%ROWTYPE;v_asset assets%ROWTYPE;v_event event_state%ROWTYPE;
  v_settings event_settings%ROWTYPE;v_existing orders%ROWTYPE;v_order orders%ROWTYPE;
  v_trade bigint;v_brokerage bigint;v_amount bigint;v_short boolean:=false;v_holding_qty bigint:=0;
BEGIN
  SELECT * INTO v_user FROM users WHERE id=p_user_id AND is_active FOR UPDATE;
  IF NOT FOUND OR v_user.role NOT IN ('PIT_MANAGER','ADMIN') THEN RAISE EXCEPTION 'Pit Manager access required'; END IF;
  SELECT * INTO v_event FROM event_state WHERE id=1 FOR UPDATE;
  IF v_event.status<>'LIVE' THEN RAISE EXCEPTION 'Orders are disabled while market is %',v_event.status; END IF;
  SELECT * INTO v_team FROM teams WHERE id=p_team_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Customer team not found'; END IF;
  SELECT * INTO v_asset FROM assets WHERE id=p_asset_id AND is_active FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Asset not found'; END IF;
  SELECT * INTO v_settings FROM event_settings WHERE id=1;
  IF p_quantity<=0 OR p_price_paise<=0 THEN RAISE EXCEPTION 'Quantity and price must be positive'; END IF;
  IF p_quantity % v_asset.lot_size<>0 THEN RAISE EXCEPTION 'Quantity must be in lots of % shares',v_asset.lot_size; END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing FROM orders WHERE created_by_user_id=p_user_id AND idempotency_key=p_idempotency_key;
    IF FOUND THEN RETURN jsonb_build_object('ok',true,'order_id',v_existing.id,'order_code',v_existing.order_code,'status',v_existing.status::text,'idempotent_replay',true); END IF;
  END IF;
  v_trade:=p_quantity*p_price_paise;
  v_brokerage:=(v_trade*v_settings.brokerage_bps+5000)/10000;
  v_amount:=CASE WHEN p_side='BUY' THEN v_trade+v_brokerage ELSE v_trade-v_brokerage END;
  IF p_side='SELL' THEN
    SELECT COALESCE(quantity,0) INTO v_holding_qty FROM holdings WHERE team_id=v_team.id AND asset_id=v_asset.id;
    v_short:=v_holding_qty<p_quantity;
  END IF;
  INSERT INTO orders(source,team_id,institution_id,broker_id,asset_id,side,quantity,price_paise,trade_value_paise,brokerage_bps,brokerage_paise,amount_paise,is_short_sale,created_by_user_id,idempotency_key)
  VALUES('PARTICIPANT',v_team.id,NULL,v_team.broker_id,v_asset.id,p_side,p_quantity,p_price_paise,v_trade,v_settings.brokerage_bps,v_brokerage,v_amount,v_short,v_user.id,NULLIF(p_idempotency_key,''))
  RETURNING * INTO v_order;
  INSERT INTO audit_log(actor_user_id,actor_email,actor_role,action,order_id,team_id,asset_id,side,quantity,trade_value_paise,risk_status,what_happened,details_json)
  VALUES(v_user.id,v_user.email,v_user.role,'ORDER_CREATED',v_order.id,v_team.id,v_asset.id,p_side,p_quantity,v_trade,CASE WHEN v_short THEN 'SHORT_SALE' ELSE 'CLEAR' END,'Pit Manager submitted an order for a customer team.',jsonb_build_object('customer_team',v_team.code,'order_code',v_order.order_code,'price_paise',p_price_paise,'brokerage_paise',v_brokerage));
  RETURN jsonb_build_object('ok',true,'order_id',v_order.id,'order_code',v_order.order_code,'status',v_order.status::text,'short_selling',v_short,'idempotent_replay',false);
END;$$;

CREATE OR REPLACE FUNCTION public.jse_loan_action_for_team(
  p_user_id bigint,p_team_id bigint,p_action text,p_amount_paise bigint DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE
  v_user users%ROWTYPE;v_team teams%ROWTYPE;v_settings event_settings%ROWTYPE;v_loan loans%ROWTYPE;
  v_amount bigint;v_interest_paid bigint;v_principal_paid bigint;v_cash_after_interest bigint;v_cash_after bigint;v_closing boolean;
BEGIN
  SELECT * INTO v_user FROM users WHERE id=p_user_id AND is_active FOR UPDATE;
  IF NOT FOUND OR v_user.role NOT IN ('PIT_MANAGER','ADMIN') THEN RAISE EXCEPTION 'Pit Manager access required'; END IF;
  SELECT * INTO v_team FROM teams WHERE id=p_team_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Customer team not found'; END IF;
  SELECT * INTO v_settings FROM event_settings WHERE id=1;
  IF upper(p_action)='DRAW' THEN
    IF p_amount_paise IS NULL OR p_amount_paise<=0 OR p_amount_paise>v_settings.loan_limit_paise THEN RAISE EXCEPTION 'Loan amount exceeds the configured loan limit'; END IF;
    IF EXISTS(SELECT 1 FROM loans WHERE team_id=v_team.id AND status='OPEN') THEN RAISE EXCEPTION 'An open loan already exists for this team'; END IF;
    INSERT INTO loans(team_id,principal_paise,principal_outstanding_paise,interest_rate_bps,interest_due_paise,interest_paid_paise,status,approved_by_user_id)
    VALUES(v_team.id,p_amount_paise,p_amount_paise,v_settings.loan_interest_bps,(p_amount_paise*v_settings.loan_interest_bps+5000)/10000,0,'OPEN',v_user.id)
    RETURNING * INTO v_loan;
    v_cash_after:=v_team.cash_paise+p_amount_paise;
    UPDATE teams SET cash_paise=v_cash_after WHERE id=v_team.id;
    INSERT INTO cash_ledger(team_id,loan_id,entry_type,debit_paise,credit_paise,balance_after_paise,note)
    VALUES(v_team.id,v_loan.id,'LOAN_DRAWDOWN',0,p_amount_paise,v_cash_after,'Customer team loan drawdown.');
    INSERT INTO audit_log(actor_user_id,actor_email,actor_role,action,team_id,risk_status,what_happened,details_json)
    VALUES(v_user.id,v_user.email,v_user.role,'LOAN_DRAW',v_team.id,'LOAN_OPEN','Pit Manager drew a loan for a customer team.',jsonb_build_object('principal_paise',p_amount_paise,'interest_due_paise',v_loan.interest_due_paise));
    RETURN jsonb_build_object('ok',true,'action','DRAW','loan_id',v_loan.id,'principal_due',v_loan.principal_outstanding_paise/100.0,'interest_due',v_loan.interest_due_paise/100.0,'total_due',(v_loan.principal_outstanding_paise+v_loan.interest_due_paise)/100.0,'available_cash',v_cash_after/100.0);
  END IF;
  SELECT * INTO v_loan FROM loans WHERE team_id=v_team.id AND status='OPEN' ORDER BY id DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No open loan exists for this team'; END IF;
  IF upper(p_action)='REPAY' THEN
    IF p_amount_paise IS NULL OR p_amount_paise<=0 THEN RAISE EXCEPTION 'Repayment amount must be positive'; END IF;
    v_amount:=LEAST(p_amount_paise,GREATEST(0,v_team.cash_paise-v_team.minimum_cash_paise));
    IF v_amount<=0 THEN RAISE EXCEPTION 'No amount is available for repayment while maintaining the minimum cash balance'; END IF;
    v_interest_paid:=LEAST(v_amount,v_loan.interest_due_paise);
    v_principal_paid:=LEAST(v_amount-v_interest_paid,v_loan.principal_outstanding_paise);
    v_amount:=v_interest_paid+v_principal_paid;v_closing:=(v_loan.principal_outstanding_paise-v_principal_paid=0);
    v_cash_after:=v_team.cash_paise-v_amount;v_cash_after_interest:=v_team.cash_paise-v_interest_paid;
    UPDATE teams SET cash_paise=v_cash_after WHERE id=v_team.id;
    IF v_interest_paid>0 THEN INSERT INTO cash_ledger(team_id,loan_id,entry_type,debit_paise,credit_paise,balance_after_paise,note) VALUES(v_team.id,v_loan.id,'LOAN_INTEREST_PAYMENT',v_interest_paid,0,v_cash_after_interest,'Loan interest repayment.'); END IF;
    IF v_principal_paid>0 THEN INSERT INTO cash_ledger(team_id,loan_id,entry_type,debit_paise,credit_paise,balance_after_paise,note) VALUES(v_team.id,v_loan.id,'LOAN_PRINCIPAL_REPAYMENT',v_principal_paid,0,v_cash_after,'Loan principal repayment.'); END IF;
    UPDATE loans SET principal_outstanding_paise=principal_outstanding_paise-v_principal_paid,
      interest_due_paise=CASE WHEN v_closing THEN 0 ELSE ((principal_outstanding_paise-v_principal_paid)*interest_rate_bps+5000)/10000 END,
      interest_paid_paise=CASE WHEN v_closing THEN 0 ELSE interest_paid_paise+v_interest_paid END,
      status=(CASE WHEN v_closing THEN 'CLOSED' ELSE 'OPEN' END)::loan_status,
      closed_at=CASE WHEN v_closing THEN NOW() ELSE NULL END
    WHERE id=v_loan.id RETURNING * INTO v_loan;
    INSERT INTO audit_log(actor_user_id,actor_email,actor_role,action,team_id,risk_status,what_happened,details_json)
    VALUES(v_user.id,v_user.email,v_user.role,'LOAN_REPAYMENT',v_team.id,CASE WHEN v_loan.status='CLOSED' THEN 'LOAN_CLOSED' ELSE 'LOAN_OPEN' END,'Pit Manager recorded a loan repayment for a customer team.',jsonb_build_object('requested_paise',p_amount_paise,'interest_paid_paise',v_interest_paid,'principal_paid_paise',v_principal_paid,'remaining_principal_paise',v_loan.principal_outstanding_paise,'new_interest_due_paise',v_loan.interest_due_paise));
    RETURN jsonb_build_object('ok',true,'action','REPAY','loan_id',v_loan.id,'interest_paid',v_interest_paid/100.0,'principal_paid',v_principal_paid/100.0,'principal_due',v_loan.principal_outstanding_paise/100.0,'interest_due',v_loan.interest_due_paise/100.0,'total_due',(v_loan.principal_outstanding_paise+v_loan.interest_due_paise)/100.0,'available_cash',v_cash_after/100.0,'status',v_loan.status::text);
  END IF;
  RAISE EXCEPTION 'Unknown loan action';
END;$$;
