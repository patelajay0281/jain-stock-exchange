-- BIG BULL special participant: Team 1 is a dedicated account with a hard ₹1 crore cash ceiling.
-- Additive and idempotent. Existing cash, holdings, orders, and team/broker identifiers are preserved.
CREATE TABLE IF NOT EXISTS public.jse_special_accounts (
  team_id integer PRIMARY KEY REFERENCES public.teams(id),
  account_code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  cash_limit numeric(14,2) NOT NULL CHECK (cash_limit >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.jse_special_accounts(team_id, account_code, display_name, cash_limit)
SELECT id, 'BIG-BULL', 'BIG BULL', 100000000.00 FROM public.teams WHERE code='TEAM-001'
ON CONFLICT (team_id) DO UPDATE SET account_code='BIG-BULL', display_name='BIG BULL', cash_limit=100000000.00, updated_at=now();

CREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_limit numeric;
BEGIN
  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id=NEW.id;
  IF FOUND AND NEW.cash > v_limit THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='BIG BULL cash limit is ₹1,00,00,000.00; this balance change is blocked.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS jse_special_cash_limit_guard_trg ON public.teams;
CREATE TRIGGER jse_special_cash_limit_guard_trg BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.jse_special_cash_limit_guard();

CREATE OR REPLACE FUNCTION public.jse_big_bull_admin(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  SELECT * INTO t FROM teams WHERE seq=1 AND code='TEAM-001' FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND','Team 1 special participant was not found.',404); END IF;
  SELECT * INTO b FROM brokers WHERE id=t.broker_id;

  IF v_action = 'STATE' THEN
    RETURN jsonb_build_object('success',true,'account',jsonb_build_object(
      'team_number',t.seq,'team_code',t.code,'display_name',t.name,'broker_number',b.id,'broker_code',b.code,
      'broker_name',b.name,'cash',t.cash,'cash_limit',100000000,'active',t.active,'section',t.section,'members',t.members));
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
    IF v_amount IS NULL OR v_amount<0 AND v_action='SET_BALANCE' THEN
      PERFORM jse_fail('INVALID_AMOUNT','Enter a balance from ₹0 to ₹1 crore.',400);
    END IF;
    IF v_action='ADJUST_CASH' AND v_amount=0 THEN PERFORM jse_fail('INVALID_AMOUNT','Enter a non-zero cash adjustment.',400); END IF;
    v_after := CASE WHEN v_action='SET_BALANCE' THEN v_amount ELSE t.cash+v_amount END;
    IF v_after<0 OR v_after>100000000 THEN
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
    'broker_name',b.name,'cash',t.cash,'cash_limit',100000000,'active',t.active,'section',t.section,'members',t.members));
END $function$


INSERT INTO schema_migrations(version) VALUES ('012_big_bull_special_account');
