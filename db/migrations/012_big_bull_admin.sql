-- BIG BULL special participant controls: Team 1 / Broker 11.
-- Additive and replayable. Existing balances and trade history are retained.
INSERT INTO brokers (code,name,active) VALUES ('BROKER-11','SIDDHARTH',true)
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, active=true;

CREATE TABLE IF NOT EXISTS public.jse_special_accounts (
  team_id integer PRIMARY KEY REFERENCES teams(id),
  account_code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  cash_limit numeric(16,2) NOT NULL DEFAULT 100000000 CHECK (cash_limit >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.jse_special_accounts(team_id,account_code,display_name,cash_limit)
SELECT id,'BIG-BULL','BIG BULL',100000000 FROM teams WHERE code='TEAM-001'
ON CONFLICT (account_code) DO UPDATE SET team_id=EXCLUDED.team_id,display_name=EXCLUDED.display_name,
  cash_limit=EXCLUDED.cash_limit,updated_at=now();

INSERT INTO team_name_pool (name,category,meaning,active)
SELECT 'BIG BULL','SPECIAL','Special participant; managed separately by the administrator',true
WHERE NOT EXISTS (SELECT 1 FROM team_name_pool WHERE lower(name)='big bull');

UPDATE teams
SET name='BIG BULL', broker_id=(SELECT id FROM brokers WHERE code='BROKER-11'), updated_at=now()
WHERE seq=1 AND code='TEAM-001'
  AND (name IS DISTINCT FROM 'BIG BULL' OR broker_id IS DISTINCT FROM (SELECT id FROM brokers WHERE code='BROKER-11'));

UPDATE app_users SET display_name='BIG BULL', updated_at=now()
WHERE role='PARTICIPANT' AND team_id=(SELECT id FROM teams WHERE seq=1 AND code='TEAM-001')
  AND display_name IS DISTINCT FROM 'BIG BULL';

-- Add sequence and broker identity to the order-desk team payload so dropdowns can show
-- 1-BIG BULL-11-SIDDHARTH without relying on hard-coded browser values.
DO $do$
DECLARE v_def text;
  v_old text := '''code'', tm.code, ''name'', tm.name, ''section'', tm.section, ''members'', tm.members';
  v_new text := '''code'', tm.code, ''seq'', right(tm.code,3)::integer, ''name'', CASE WHEN sa.account_code=''BIG-BULL'' THEN sa.display_name ELSE tm.name END, ''special_account'', sa.account_code, ''cash_limit'', sa.cash_limit, ''broker_number'', coalesce(ra.broker_number,tm.broker_id), ''broker_code'', coalesce(ra.broker_code,(SELECT code FROM brokers WHERE id=tm.broker_id)), ''broker_name'', coalesce(ra.broker_name,(SELECT name FROM brokers WHERE id=tm.broker_id)), ''section'', tm.section, ''members'', tm.members';
BEGIN
  SELECT pg_get_functiondef('jse_broker_desk(jsonb,jsonb)'::regprocedure) INTO v_def;
  IF position(v_old IN v_def) > 0 THEN
    v_def := replace(v_def, v_old, v_new);
    v_def := replace(v_def, 'FROM jse_team_metrics tm WHERE (v_all OR tm.broker_id = b.id) AND tm.active',
      'FROM jse_team_metrics tm LEFT JOIN jse_special_accounts sa ON sa.team_id=tm.team_id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=tm.broker_id WHERE (v_all OR tm.broker_id = b.id) AND tm.active');
  ELSIF position('broker_name' IN v_def) = 0 THEN
    RAISE EXCEPTION 'Could not patch broker-desk team payload';
  END IF;
  v_def := replace(v_def, 'WHERE (v_all OR tm.broker_id = b.id) AND tm.active ORDER BY tm.seq), ''[]''::jsonb)',
    'WHERE (v_all OR tm.broker_id = b.id) AND tm.active), ''[]''::jsonb)');
  EXECUTE v_def;
END $do$;

CREATE OR REPLACE FUNCTION public.jse_big_bull_admin(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''),'STATE'));
  t teams%ROWTYPE;
  b brokers%ROWTYPE;
  v_amount numeric(16,2);
  v_delta numeric(16,2);
  v_after numeric(16,2);
  v_reason text;
  v_name text;
  v_broker_code text;
  v_broker_id integer;
  v_section text;
  v_members text;
  v_active boolean;
  v_cash_limit numeric(16,2);
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO t FROM teams WHERE seq=1 AND code='TEAM-001' FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND','Team 1 special participant was not found.',404); END IF;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;
  SELECT cash_limit INTO v_cash_limit FROM public.jse_special_accounts WHERE team_id=t.id AND account_code='BIG-BULL';
  v_cash_limit := coalesce(v_cash_limit,100000000);

  IF v_action = 'STATE' THEN
    RETURN jsonb_build_object('success',true,'account',jsonb_build_object(
      'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,
      'broker_name',b.name,'cash',t.cash,'cash_limit',v_cash_limit,'active',t.active,'section',t.section,'members',t.members));
  END IF;

  PERFORM jse_require_admin_password(a,p);
  v_reason := left(trim(coalesce(p->>'reason','')),300);
  IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for the BIG BULL change.',400); END IF;

  IF v_action = 'UPDATE_ACCOUNT' THEN
    v_name := left(trim(coalesce(p->>'display_name','')),120);
    v_broker_code := upper(trim(coalesce(p->>'broker_code','')));
    v_section := left(trim(coalesce(p->>'section','')),120);
    v_members := left(trim(coalesce(p->>'members','')),1000);
    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;
    IF v_name='' THEN PERFORM jse_fail('NAME_REQUIRED','Enter the BIG BULL display name.',400); END IF;
    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose an account status.',400); END IF;
    SELECT id INTO v_broker_id FROM brokers WHERE code=v_broker_code AND active;
    IF v_broker_id IS NULL THEN PERFORM jse_fail('BROKER_NOT_FOUND','Choose an existing active broker.',400); END IF;
    IF EXISTS (SELECT 1 FROM teams WHERE id<>t.id AND lower(name)=lower(v_name)) THEN
      PERFORM jse_fail('DUPLICATE_TEAM_NAME','That display name is already used by another team.',409);
    END IF;
    UPDATE teams SET name=v_name, broker_id=v_broker_id, section=nullif(v_section,''), members=nullif(v_members,''),
      active=v_active, updated_at=now() WHERE id=t.id;
    UPDATE app_users SET display_name=v_name, active=v_active, updated_at=now()
      WHERE role='PARTICIPANT' AND team_id=t.id;
    UPDATE public.jse_special_accounts SET display_name=v_name, updated_at=now() WHERE team_id=t.id;
    PERFORM jse_audit(a,'BIG_BULL_ACCOUNT_UPDATED','team',t.code,t.id,NULL,
      jsonb_build_object('name',t.name,'broker_code',b.code,'section',t.section,'members',t.members,'active',t.active),
      jsonb_build_object('name',v_name,'broker_code',v_broker_code,'section',nullif(v_section,''),'members',nullif(v_members,''),'active',v_active),
      jsonb_build_object('reason',v_reason));
  ELSIF v_action IN ('SET_BALANCE','ADJUST_CASH') THEN
    BEGIN v_amount := nullif(trim(p->>'amount'),'')::numeric; EXCEPTION WHEN others THEN v_amount := NULL; END;
    IF v_amount IS NULL OR (v_amount<0 AND v_action='SET_BALANCE') THEN
      PERFORM jse_fail('INVALID_AMOUNT','Enter a balance from ₹0 to ₹1 crore.',400);
    END IF;
    IF v_action='ADJUST_CASH' AND v_amount=0 THEN PERFORM jse_fail('INVALID_AMOUNT','Enter a non-zero cash adjustment.',400); END IF;
    v_after := CASE WHEN v_action='SET_BALANCE' THEN v_amount ELSE t.cash+v_amount END;
    IF v_after<0 OR v_after>v_cash_limit THEN
      PERFORM jse_fail('CASH_LIMIT','BIG BULL cash must stay between ₹0 and ₹1 crore.',400);
    END IF;
    v_delta := v_after-t.cash;
    IF v_delta<>0 THEN
      UPDATE teams SET cash=v_after, updated_at=now() WHERE id=t.id;
      INSERT INTO cash_ledger(team_id,entry_type,debit,credit,balance_after,note,actor_id,actor_name)
      VALUES(t.id,'ADJUSTMENT',greatest(-v_delta,0),greatest(v_delta,0),v_after,
        'BIG BULL admin '||lower(v_action)||': '||v_reason,nullif(a->>'id','')::integer,jse_actor_name(a));
      PERFORM jse_audit(a,CASE WHEN v_action='SET_BALANCE' THEN 'BIG_BULL_BALANCE_SET' ELSE 'BIG_BULL_CASH_ADJUSTED' END,
        'team',t.code,t.id,NULL,jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),
        jsonb_build_object('reason',v_reason,'amount',v_amount,'action',v_action));
    END IF;
  ELSE
    PERFORM jse_fail('INVALID_ACTION','Use STATE, UPDATE_ACCOUNT, SET_BALANCE or ADJUST_CASH.',400);
  END IF;

  SELECT * INTO t FROM teams WHERE id=t.id;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;
  RETURN jsonb_build_object('success',true,'cash',t.cash,'account',jsonb_build_object(
    'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,
    'broker_name',b.name,'cash',t.cash,'cash_limit',v_cash_limit,'active',t.active,'section',t.section,'members',t.members));
END $$;

INSERT INTO schema_migrations(version) VALUES ('012_big_bull_admin');
