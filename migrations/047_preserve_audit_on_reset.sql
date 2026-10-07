-- JAIN STOCK EXCHANGE — preserve audit history across event resets
CREATE OR REPLACE FUNCTION public.jse_reset_event(p_user_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE v_user users%ROWTYPE; v_state event_state%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM users WHERE id=p_user_id AND is_active FOR UPDATE;
  IF NOT FOUND OR v_user.role<>'ADMIN' THEN RAISE EXCEPTION 'Administrator role required'; END IF;
  SELECT * INTO v_state FROM event_state WHERE id=1 FOR UPDATE;
  IF v_state.status NOT IN ('NOT_STARTED','FINALIZED') THEN RAISE EXCEPTION 'Reset is allowed only before START or after FINALIZE'; END IF;
  TRUNCATE TABLE settlement_actions,broker_commissions,settlement_rejections,settlements,cash_ledger,institution_cash_ledger,orders,holdings,institutional_holdings,loans,price_history RESTART IDENTITY;
  UPDATE teams SET cash_paise=base_capital_paise,peak_own_capital_used_paise=0,realized_profit_paise=0,short_sale_count=0;
  UPDATE institutions SET cash_paise=initial_cash_paise;
  UPDATE assets SET current_price_paise=base_price_paise,previous_price_paise=base_price_paise,updated_at=NOW();
  INSERT INTO cash_ledger(team_id,entry_type,debit_paise,credit_paise,balance_after_paise,note)
    SELECT id,'INITIAL_CAPITAL',0,base_capital_paise,base_capital_paise,'Initial event allocation' FROM teams;
  INSERT INTO institution_cash_ledger(institution_id,entry_type,debit_paise,credit_paise,balance_after_paise,note)
    SELECT id,'INITIAL_CAPITAL',0,initial_cash_paise,initial_cash_paise,'Initial institutional allocation' FROM institutions;
  PERFORM set_config('jse.reset','1',true);
  UPDATE event_state SET status='NOT_STARTED',started_at=NULL,paused_at=NULL,resumed_at=NULL,closed_at=NULL,finalized_at=NULL,
      topper_team_id=NULL,topper_realized_profit_paise=NULL,finalization_note=NULL,updated_at=NOW() WHERE id=1;
  INSERT INTO audit_log(actor_user_id,actor_email,actor_role,action,what_happened,details_json)
    VALUES(v_user.id,v_user.email,v_user.role,'EVENT_RESET',
      'Administrator reset event transaction state, prices, holdings, loans and ledgers. Historical audit entries were preserved.',
      jsonb_build_object('historical_audit_preserved',true,'new_session_status','NOT_STARTED'));
  RETURN jsonb_build_object('ok',true,'status','NOT_STARTED');
END; $$;

NOTIFY pgrst, 'reload schema';