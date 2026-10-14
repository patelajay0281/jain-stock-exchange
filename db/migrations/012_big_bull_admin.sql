-- BIG BULL special participant controls: Team 1 / Broker 11.
-- Additive and replayable. Existing balances and trade history are retained.
CREATE OR REPLACE FUNCTION public.jse_big_bull_admin(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''),'STATE'));
  t teams%ROWTYPE;
  b brokers%ROWTYPE;
  v_amount numeric(16,2);
  v_after numeric(16,2);
  v_note text;
  v_active boolean;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO t FROM teams WHERE seq=1 AND code='TEAM-001' FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND','Team 1 special participant was not found.',404); END IF;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;

  IF v_action = 'STATE' THEN
    RETURN jsonb_build_object('success',true,'team_number',t.seq,'team_code',t.code,'team_name',t.name,
      'broker_number',b.id,'broker_code',b.code,'broker_name',b.name,'cash',t.cash,
      'cash_limit',100000000,'active',t.active);
  END IF;

  PERFORM jse_require_admin_password(a,p);
  IF v_action = 'ADJUST_CASH' THEN
    BEGIN v_amount := nullif(trim(p->>'amount'),'')::numeric; EXCEPTION WHEN others THEN v_amount := NULL; END;
    v_note := left(trim(coalesce(p->>'note','')),300);
    IF v_amount IS NULL OR v_amount=0 THEN PERFORM jse_fail('INVALID_AMOUNT','Enter a non-zero cash adjustment amount.',400); END IF;
    IF v_note='' THEN PERFORM jse_fail('NOTE_REQUIRED','Enter a reason for the cash adjustment.',400); END IF;
    v_after := t.cash + v_amount;
    IF v_after < 0 THEN PERFORM jse_fail('INSUFFICIENT_CASH','The adjustment would make the cash balance negative.',400); END IF;
    UPDATE teams SET cash=v_after, updated_at=now() WHERE id=t.id;
    INSERT INTO cash_ledger(team_id,entry_type,debit,credit,balance_after,note,actor_id,actor_name)
    VALUES(t.id,'ADJUSTMENT',greatest(-v_amount,0),greatest(v_amount,0),v_after,'BIG BULL admin adjustment: '||v_note,
      nullif(a->>'id','')::integer,jse_actor_name(a));
    PERFORM jse_audit(a,'BIG_BULL_CASH_ADJUSTED','team',t.code,t.id,NULL,
      jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),
      jsonb_build_object('amount',v_amount,'note',v_note,'broker_code',b.code));
  ELSIF v_action = 'SET_ACTIVE' THEN
    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;
    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose whether BIG BULL should be active.',400); END IF;
    UPDATE teams SET active=v_active, updated_at=now() WHERE id=t.id;
    UPDATE app_users SET active=v_active, updated_at=now() WHERE role='PARTICIPANT' AND team_id=t.id;
    PERFORM jse_audit(a,'BIG_BULL_ACTIVE_CHANGED','team',t.code,t.id,NULL,
      jsonb_build_object('active',t.active),jsonb_build_object('active',v_active),
      jsonb_build_object('broker_code',b.code));
  ELSE
    PERFORM jse_fail('INVALID_ACTION','Use STATE, ADJUST_CASH or SET_ACTIVE.',400);
  END IF;

  SELECT * INTO t FROM teams WHERE id=t.id;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;
  RETURN jsonb_build_object('success',true,'team_number',t.seq,'team_code',t.code,'team_name',t.name,
    'broker_number',b.id,'broker_code',b.code,'broker_name',b.name,'cash',t.cash,
    'cash_limit',100000000,'active',t.active);
END $$;

INSERT INTO schema_migrations(version) VALUES ('012_big_bull_admin') ON CONFLICT (version) DO NOTHING;
