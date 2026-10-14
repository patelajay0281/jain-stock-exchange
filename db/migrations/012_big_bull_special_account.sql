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


CREATE OR REPLACE FUNCTION public.jse_broker_desk(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE b brokers%ROWTYPE; cfg event_config%ROWTYPE;
  -- the Pit Manager records trades for every team; administrators can open the all-teams desk with broker=ALL
  v_all boolean := a->>'role' = 'PIT_MANAGER' OR (a->>'role' IN ('ADMIN', 'VIEWER') AND upper(coalesce(p->>'broker', '')) = 'ALL');
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'PIT_MANAGER', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  IF a->>'role' = 'BROKER' THEN
    SELECT * INTO b FROM brokers WHERE id = nullif(a->>'broker_id', '')::integer;
  ELSE
    SELECT * INTO b FROM brokers WHERE code = CASE WHEN v_all THEN (SELECT min(code) FROM brokers) ELSE upper(trim(coalesce(nullif(p->>'broker', ''), (SELECT min(code) FROM brokers)))) END;
  END IF;
  IF NOT FOUND THEN PERFORM jse_fail('BROKER_NOT_FOUND', 'Broker not found.', 404); END IF;
  RETURN jsonb_build_object('success', true,
    'broker', CASE WHEN v_all THEN jsonb_build_object('code', 'ALL', 'name', 'All teams') ELSE jsonb_build_object('code', b.code, 'name', b.name, 'contact', b.contact, 'desk', b.desk) END, 'all_teams', v_all,
    'brokers', CASE WHEN a->>'role' = 'BROKER' THEN NULL ELSE (SELECT jsonb_agg(jsonb_build_object('code', br.code, 'name', br.name, 'broker_number', coalesce(ra.broker_number,br.id), 'roster_code', coalesce(ra.broker_code,br.code), 'roster_name', coalesce(ra.broker_name,br.name)) ORDER BY coalesce(ra.broker_number,br.id)) FROM brokers br LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=br.id) END,
    'rules', jsonb_build_object('brokerage_rate', cfg.brokerage_rate, 'max_order_value', cfg.max_order_value, 'min_order_value', cfg.min_order_value,
      'stock_lot_size', cfg.stock_lot_size, 'loan_max_principal', cfg.loan_max_principal, 'loan_interest_rate', cfg.loan_interest_rate,
      'min_buy_trades', cfg.min_buy_trades, 'min_sell_trades', cfg.min_sell_trades),
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', tm.code, 'seq', right(tm.code,3)::integer, 'name', CASE WHEN sa.account_code='BIG-BULL' THEN sa.display_name ELSE tm.name END, 'special_account', sa.account_code, 'cash_limit', sa.cash_limit, 'broker_number', coalesce(ra.broker_number, tm.broker_id), 'broker_code', coalesce(ra.broker_code, (SELECT code FROM brokers WHERE id=tm.broker_id)), 'broker_name', coalesce(ra.broker_name, (SELECT name FROM brokers WHERE id=tm.broker_id)), 'section', tm.section, 'members', tm.members,
        'cash', tm.cash, 'free_cash', jse_available_cash(tm.team_id, NULL), 'loan_room', jse_loan_room(tm.team_id),
        'holdings_value', tm.holdings_value, 'net_worth', tm.net_worth, 'settled_buys', tm.settled_buys, 'settled_sells', tm.settled_sells,
        'assessment_met', tm.assessment_met, 'loan_liability', tm.loan_liability, 'eligibility_status', tm.eligibility_status,
        'holdings', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'quantity', h.quantity,
              'available', (SELECT available FROM jse_available_qty(tm.team_id, s.id, NULL)), 'avg_price', round(h.trade_cost / nullif(h.quantity, 0), 2),
              'price', s.price, 'value', h.quantity * s.price, 'tradable', s.kind = 'EQUITY' OR s.listed_at IS NOT NULL) ORDER BY h.quantity * s.price DESC)
            FROM holdings h JOIN securities s ON s.id = h.security_id WHERE h.team_id = tm.team_id AND h.quantity > 0), '[]'::jsonb),
        'open_orders', (SELECT count(*) FROM orders o WHERE o.team_id = tm.team_id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')))
        ORDER BY tm.seq)
      FROM jse_team_metrics tm LEFT JOIN jse_special_accounts sa ON sa.team_id=tm.team_id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=tm.broker_id WHERE (v_all OR tm.broker_id = b.id) AND tm.active), '[]'::jsonb),
    'instructions', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'instruction_no', i.instruction_no, 'team', t.code, 'team_name', t.name,
        'symbol', s.symbol, 'security', s.name, 'side', i.side, 'quantity', i.quantity, 'note', i.note, 'price_seen', i.price_seen, 'market_price', s.price,
        'status', i.status, 'created_at', i.created_at, 'handled_at', i.handled_at, 'handled_by', i.handled_by_name, 'decline_reason', i.decline_reason,
        'order_no', o.order_no, 'order_status', o.status) ORDER BY (i.status = 'OPEN') DESC, i.id DESC)
      FROM (SELECT * FROM instructions WHERE broker_id = b.id AND (status = 'OPEN' OR created_at > now() - interval '12 hours') ORDER BY id DESC LIMIT 80) i
      JOIN teams t ON t.id = i.team_id JOIN securities s ON s.id = i.security_id LEFT JOIN orders o ON o.id = i.order_id), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(x.id) ORDER BY x.id DESC) FROM (
        SELECT o.id FROM orders o WHERE (v_all OR o.broker_id = b.id) ORDER BY o.id DESC LIMIT 60) x), '[]'::jsonb),
    'counts', (SELECT jsonb_build_object(
        'teams', (SELECT count(*) FROM teams WHERE broker_id = b.id AND active),
        'open_instructions', (SELECT count(*) FROM instructions WHERE broker_id = b.id AND status = 'OPEN'),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'awaiting_exchange', count(*) FILTER (WHERE status = 'EXCHANGE_PENDING'),
        'awaiting_bank', count(*) FILTER (WHERE status IN ('EXCHANGE_APPROVED', 'BANK_PENDING')),
        'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED', 'EXCHANGE_REJECTED', 'BANK_REJECTED'))) FROM orders WHERE broker_id = b.id));
END $function$


CREATE OR REPLACE FUNCTION public.jse_institutional(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE i institutions%ROWTYPE; cfg event_config%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL', 'VIEWER');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO i FROM institutions WHERE id = coalesce(CASE WHEN a->>'role' <> 'INSTITUTIONAL' THEN nullif(p->>'institution_id', '')::integer END,
                                                        nullif(a->>'institution_id', '')::integer, (SELECT min(id) FROM institutions));
  IF NOT FOUND THEN PERFORM jse_fail('INSTITUTION_NOT_FOUND', 'Institutional account not found.', 404); END IF;
  -- a transaction desk: ticket inputs, the current market with institutional prices, and the transaction history.
  -- Institutions are counterparties only — no cash or holdings restriction and no participant-style portfolio.
  RETURN jsonb_build_object('success', true,
    'rules', jsonb_build_object('spread_pct', jse_inst_spread_pct(), 'brokerage_rate', cfg.brokerage_rate, 'stock_lot_size', cfg.stock_lot_size,
       'min_order_value', cfg.min_order_value, 'max_order_value', cfg.max_order_value,
       'text', 'When a participant cannot find a counterparty, the institution trades with it: the participant BUYS from the institution at ' ||
               to_char(jse_inst_spread_pct(), 'FM990.##') || '% ABOVE the prevailing market price and SELLS to it at ' || to_char(jse_inst_spread_pct(), 'FM990.##') ||
               '% BELOW. The participant pays the normal brokerage (' || jse_rate_text(cfg.brokerage_rate) || '), earned by its broker. The trade goes through the Pit Manager, Exchange and Bank like any order.'),
    'institutions', (SELECT jsonb_agg(jsonb_build_object('id', x.id, 'code', x.code, 'name', x.name) ORDER BY x.id) FROM institutions x),
    'institution', jsonb_build_object('id', i.id, 'code', i.code, 'name', i.name),
    -- counterparty choices: participant team code, name and broker only (no team cash or holdings)
    'teams', coalesce((SELECT jsonb_agg(jsonb_build_object('code', t.code, 'seq', t.seq, 'name', CASE WHEN sa.account_code='BIG-BULL' THEN sa.display_name ELSE t.name END, 'special_account', sa.account_code, 'broker', coalesce(ra.broker_code,b.code), 'broker_number', coalesce(ra.broker_number,b.id), 'broker_name', coalesce(ra.broker_name,b.name)) ORDER BY t.seq) FROM teams t LEFT JOIN brokers b ON b.id = t.broker_id LEFT JOIN jse_special_accounts sa ON sa.team_id=t.id LEFT JOIN broker_roster_aliases ra ON ra.internal_broker_id=t.broker_id WHERE t.active), '[]'::jsonb),
    'market', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'type', CASE WHEN s.kind = 'IPO' THEN 'IPO' ELSE 'EQUITY' END,
        'price', s.price, 'change_pct', round(jse_pct(s.price, s.previous_price), 2), 'lot_size', s.lot_size,
        'participant_buy_price', jse_inst_price(s.price, 'SELL'), 'participant_sell_price', jse_inst_price(s.price, 'BUY'),
        'last_price_change_at', s.last_price_change_at) ORDER BY s.last_price_change_at DESC NULLS LAST, s.display_order, s.id)
      FROM securities s WHERE s.active AND (s.kind = 'EQUITY' OR s.listed_at IS NOT NULL)), '[]'::jsonb),
    'orders', coalesce((SELECT jsonb_agg(jse_order_json(o.id) ORDER BY o.id DESC) FROM (SELECT id FROM orders WHERE institution_id = i.id ORDER BY id DESC LIMIT 80) o), '[]'::jsonb),
    'stats', (SELECT jsonb_build_object('transactions', count(*), 'settled', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
       'pending', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
       'rejected', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
       'participants_bought_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'SELL'), 0),
       'participants_sold_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED' AND side = 'BUY'), 0),
       'brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0)) FROM orders WHERE institution_id = i.id));
END $function$


INSERT INTO schema_migrations(version) VALUES ('012_big_bull_special_account');
