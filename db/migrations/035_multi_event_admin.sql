-- 035: Multi-event registry, per-event state snapshots and database-enforced desk controls.
ALTER TABLE public.event_control
  ADD COLUMN IF NOT EXISTS order_intake_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pit_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS exchange_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS bank_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS instructions_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS market_news_open boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.jse_events (
  id bigserial PRIMARY KEY,
  event_key text NOT NULL UNIQUE DEFAULT ('EVT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10))),
  event_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED','LIVE','SETTLEMENT_ONLY','CLOSED','FINALIZED')),
  is_active boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  baseline_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  state_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_activated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS jse_events_one_active_idx ON public.jse_events(is_active) WHERE is_active;
CREATE UNIQUE INDEX IF NOT EXISTS jse_events_name_ci_idx ON public.jse_events(lower(event_name));
CREATE INDEX IF NOT EXISTS jse_events_updated_idx ON public.jse_events(updated_at DESC);

-- Ledger/append-only triggers can be bypassed only inside an explicit atomic event-restore transaction.
CREATE OR REPLACE FUNCTION public.jse_forbid_mutation()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF current_setting('jse.maintenance', true) = 'on' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    IF TG_OP = 'UPDATE' THEN RETURN NEW; END IF;
    RETURN NULL;
  END IF;
  RAISE EXCEPTION '% is append-only; correction must use the audited reversal / event maintenance workflow.', TG_TABLE_NAME;
END
$function$;

-- Event snapshots include cyclic order/instruction/settlement references. Keep FKs valid, but defer checks to COMMIT.
DO $deferred_fks$
DECLARE r record;
BEGIN
  FOR r IN SELECT conrelid::regclass AS tab, conname FROM pg_constraint
    WHERE contype='f' AND connamespace='public'::regnamespace AND NOT condeferrable
  LOOP
    EXECUTE format('ALTER TABLE %s ALTER CONSTRAINT %I DEFERRABLE INITIALLY DEFERRED',r.tab,r.conname);
  END LOOP;
END
$deferred_fks$;

CREATE OR REPLACE FUNCTION public.jse__capture_event_snapshot()
RETURNS jsonb LANGUAGE plpgsql STABLE AS $function$
DECLARE r record; v_rows jsonb; v_snapshot jsonb := '{}'::jsonb;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
      AND table_name NOT IN ('schema_migrations','jse_locked_baseline','jse_events','sessions','audit_log_archive')
    ORDER BY table_name
  LOOP
    IF r.table_name='app_users' THEN
      EXECUTE 'SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.id), ''[]''::jsonb) FROM public.app_users x WHERE x.role <> ''ADMIN''' INTO v_rows;
    ELSE
      EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) FROM public.%I x',r.table_name) INTO v_rows;
    END IF;
    v_snapshot := v_snapshot || jsonb_build_object(r.table_name,coalesce(v_rows,'[]'::jsonb));
  END LOOP;
  RETURN v_snapshot;
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__capture_event_baseline()
RETURNS jsonb LANGUAGE sql STABLE AS $function$
 SELECT jsonb_build_object(
  'teams',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',t.id,'seq',t.seq,'code',t.code,'name',t.name,'section',t.section,'members',t.members,'broker_id',t.broker_id,'active',t.active) ORDER BY t.seq),'[]'::jsonb) FROM public.teams t),
  'brokers',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',b.id,'code',b.code,'name',b.name,'active',b.active,'contact',b.contact,'desk',b.desk) ORDER BY b.id),'[]'::jsonb) FROM public.brokers b),
  'broker_roster_aliases',(SELECT coalesce(jsonb_agg(jsonb_build_object('broker_number',a.broker_number,'broker_code',a.broker_code,'broker_name',a.broker_name,'internal_broker_id',a.internal_broker_id) ORDER BY a.broker_number),'[]'::jsonb) FROM public.broker_roster_aliases a),
  'securities',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'kind',s.kind,'symbol',s.symbol,'name',s.name,'sector',s.sector,'base_price',s.base_price,'lot_size',s.lot_size,'display_order',s.display_order,'active',s.active,'ipo_code',s.ipo_code,'ipo_shares_offered',s.ipo_shares_offered,'ipo_lot_size',s.ipo_lot_size) ORDER BY s.id),'[]'::jsonb) FROM public.securities s),
  'ipo_allotments',(SELECT coalesce(jsonb_agg(jsonb_build_object('team_id',al.team_id,'security_id',al.security_id,'lots',al.lots,'quantity',al.quantity,'price',al.price,'amount',al.amount,'batch_id',al.batch_id) ORDER BY al.id),'[]'::jsonb) FROM public.ipo_allotments al WHERE al.reversed_at IS NULL AND al.quantity>0),
  'team_starting_cash',(SELECT coalesce(jsonb_agg(jsonb_build_object('team_id',t.id,'cash',t.cash+coalesce(al.total_amount,0)) ORDER BY t.seq),'[]'::jsonb)
    FROM public.teams t LEFT JOIN (SELECT team_id,sum(amount) total_amount FROM public.ipo_allotments WHERE reversed_at IS NULL AND quantity>0 GROUP BY team_id) al ON al.team_id=t.id)
 )
$function$;

CREATE OR REPLACE FUNCTION public.jse__event_metrics()
RETURNS jsonb LANGUAGE sql STABLE AS $function$
 SELECT jsonb_build_object(
  'teams',(SELECT count(*) FROM public.teams WHERE active),'brokers',(SELECT count(*) FROM public.brokers WHERE active),
  'stocks',(SELECT count(*) FROM public.securities WHERE active AND kind='EQUITY'),'ipos',(SELECT count(*) FROM public.securities WHERE active AND kind='IPO'),
  'orders',(SELECT count(*) FROM public.orders),
  'pending_orders',(SELECT count(*) FROM public.orders WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
  'settled_orders',(SELECT count(*) FROM public.orders WHERE status='BANK_SETTLED'),
  'rejected_orders',(SELECT count(*) FROM public.orders WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
  'news_items',(SELECT count(*) FROM public.market_news WHERE reversed_at IS NULL),
  'trade_value',(SELECT coalesce(sum(trade_value),0) FROM public.orders WHERE status='BANK_SETTLED')
 )
$function$;

-- Each event resets to its own baseline. The official global baseline remains unchanged as fallback.
DO $patch_reset$
DECLARE v_fn text; v_old text; v_new text;
BEGIN
 v_fn:=pg_get_functiondef('public.jse_reset_event(jsonb,jsonb)'::regprocedure);
 v_old:=$old$  SELECT snapshot INTO v_base FROM public.jse_locked_baseline WHERE id = 1;$old$;
 v_new:=$new$  SELECT coalesce((SELECT baseline_snapshot FROM public.jse_events WHERE is_active LIMIT 1),
                                (SELECT snapshot FROM public.jse_locked_baseline WHERE id = 1)) INTO v_base;$new$;
 IF position(v_new IN v_fn)=0 THEN
   IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '035: reset baseline selection point not found'; END IF;
   v_fn:=replace(v_fn,v_old,v_new);
 END IF;
 v_old:=$old$         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now() WHERE id = 1;$old$;
 v_new:=$new$         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now(), order_intake_open = true, pit_open = true, exchange_open = true, bank_open = true,
         instructions_open = true, market_news_open = true WHERE id = 1;$new$;
 IF position(v_new IN v_fn)=0 THEN
   IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '035: reset control defaults point not found'; END IF;
   v_fn:=replace(v_fn,v_old,v_new);
 END IF;
 EXECUTE v_fn;
END
$patch_reset$;

-- These triggers enforce derived-state rules during normal trades. Only explicit event
-- snapshot replay bypasses them, so restoration doesn't double-apply settlement side effects.
CREATE OR REPLACE FUNCTION public.jse__inst_order_guard()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE inv integer; v_sym text;
BEGIN
  IF current_setting('jse.maintenance',true)='on' THEN RETURN NEW; END IF;
  IF NEW.account_type <> 'INSTITUTION' OR NEW.side <> 'SELL' THEN RETURN NEW; END IF;
  SELECT quantity INTO inv FROM public.institutional_inventory WHERE security_id=NEW.security_id FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.quantity > inv - public.jse__inst_reserved(NEW.security_id,NEW.id) THEN
    SELECT symbol INTO v_sym FROM public.securities WHERE id=NEW.security_id;
    RAISE EXCEPTION USING ERRCODE='JSE01',DETAIL='INSTITUTION_INVENTORY',HINT='409',
      MESSAGE='The institutional investor has only ' || greatest(inv-public.jse__inst_reserved(NEW.security_id,NEW.id),0) || ' ' || v_sym ||
              ' shares available to sell (inventory ' || inv || ', in open orders ' || public.jse__inst_reserved(NEW.security_id,NEW.id) || ').';
  END IF;
  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__inst_settlement_inventory()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE v_delta integer; v_left integer; v_sym text;
BEGIN
  IF current_setting('jse.maintenance',true)='on' THEN RETURN NEW; END IF;
  IF NEW.account_type IS DISTINCT FROM 'INSTITUTION' THEN RETURN NEW; END IF;
  IF TG_OP='INSERT' AND NEW.reversed_at IS NULL THEN
    v_delta:=CASE WHEN NEW.side='SELL' THEN -NEW.quantity ELSE NEW.quantity END;
  ELSIF TG_OP='UPDATE' AND OLD.reversed_at IS NULL AND NEW.reversed_at IS NOT NULL THEN
    v_delta:=CASE WHEN NEW.side='SELL' THEN NEW.quantity ELSE -NEW.quantity END;
  ELSIF TG_OP='UPDATE' AND OLD.reversed_at IS NOT NULL AND NEW.reversed_at IS NULL THEN
    v_delta:=CASE WHEN NEW.side='SELL' THEN -NEW.quantity ELSE NEW.quantity END;
  ELSE RETURN NEW;
  END IF;
  UPDATE public.institutional_inventory SET quantity=quantity+v_delta,updated_at=now() WHERE security_id=NEW.security_id
    RETURNING quantity INTO v_left;
  IF FOUND AND v_left<0 THEN
    SELECT symbol INTO v_sym FROM public.securities WHERE id=NEW.security_id;
    RAISE EXCEPTION USING ERRCODE='JSE01',DETAIL='INSTITUTION_INVENTORY',HINT='409',
      MESSAGE='Settlement blocked: the institutional investor does not have enough ' || v_sym || ' shares.';
  END IF;
  RETURN NEW;
EXCEPTION WHEN check_violation THEN
  RAISE EXCEPTION USING ERRCODE='JSE01',DETAIL='INSTITUTION_INVENTORY',HINT='409',
    MESSAGE='Settlement blocked: institutional inventory would become negative.';
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE v_limit numeric;
BEGIN
  IF current_setting('jse.maintenance',true)='on' THEN RETURN NEW; END IF;
  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id=NEW.id;
  IF FOUND AND NEW.cash>v_limit THEN
    RAISE EXCEPTION USING ERRCODE='23514',MESSAGE='BIG BULL cash limit is ₹1,00,00,000.00; this balance change is blocked.';
  END IF;
  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__restore_event_snapshot(p_snapshot jsonb)
RETURNS void LANGUAGE plpgsql AS $function$
DECLARE r record; v_cols text; v_max bigint; v_seq text; v_data jsonb;
BEGIN
 IF p_snapshot IS NULL OR jsonb_typeof(p_snapshot)<>'object' THEN
   PERFORM jse_fail('EVENT_SNAPSHOT_INVALID','The saved event snapshot is missing or invalid. Nothing was switched.',500);
 END IF;
 PERFORM set_config('jse.maintenance','on',true);
 SET CONSTRAINTS ALL DEFERRED;
DELETE FROM public.sessions WHERE user_id IN (SELECT id FROM public.app_users WHERE role<>'ADMIN');
 FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'
   AND table_name NOT IN ('schema_migrations','jse_locked_baseline','jse_events','sessions','audit_log_archive') ORDER BY table_name
 LOOP
   IF r.table_name='app_users' THEN DELETE FROM public.app_users WHERE role<>'ADMIN';
   ELSE EXECUTE format('DELETE FROM public.%I',r.table_name); END IF;
 END LOOP;

 FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'
   AND table_name NOT IN ('schema_migrations','jse_locked_baseline','jse_events','sessions','audit_log_archive') ORDER BY table_name
 LOOP
   v_data:=p_snapshot->r.table_name;
   IF v_data IS NULL OR jsonb_typeof(v_data)<>'array' OR jsonb_array_length(v_data)=0 THEN CONTINUE; END IF;
   SELECT string_agg(format('%I',c.column_name),', ' ORDER BY c.ordinal_position) INTO v_cols
   FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name=r.table_name AND c.is_generated<>'ALWAYS'
     AND ((v_data->0) ? c.column_name);
   IF v_cols IS NULL THEN CONTINUE; END IF;
   EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_recordset(NULL::public.%I,$1)',r.table_name,v_cols,v_cols,r.table_name) USING v_data;
 END LOOP;
FOR r IN SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND column_default LIKE 'nextval(%'
   AND table_name NOT IN ('schema_migrations','jse_events','jse_locked_baseline','sessions','audit_log_archive')
 LOOP
   v_seq:=pg_get_serial_sequence(format('public.%I',r.table_name),r.column_name);
   IF v_seq IS NOT NULL THEN
     EXECUTE format('SELECT max(%I)::bigint FROM public.%I',r.column_name,r.table_name) INTO v_max;
     IF v_max IS NULL THEN PERFORM setval(v_seq,1,false); ELSE PERFORM setval(v_seq,v_max,true); END IF;
   END IF;
 END LOOP;
 PERFORM set_config('jse.maintenance','off',true);
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_event_controls(a jsonb,p jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE v_action text:=upper(coalesce(p->>'action','STATE')); v_before jsonb; v_after jsonb;
BEGIN
 IF v_action='STATE' THEN
   PERFORM jse_require_role(a,'ADMIN','VIEWER');
   RETURN jsonb_build_object('success',true,'status',(SELECT status FROM public.event_control WHERE id=1),
    'gates',(SELECT jsonb_build_object('order_intake_open',order_intake_open,'pit_open',pit_open,'exchange_open',exchange_open,
      'bank_open',bank_open,'instructions_open',instructions_open,'market_news_open',market_news_open) FROM public.event_control WHERE id=1));
 END IF;
 PERFORM jse_require_role(a,'ADMIN'); PERFORM jse_require_admin_password(a,p);
 SELECT jsonb_build_object('order_intake_open',order_intake_open,'pit_open',pit_open,'exchange_open',exchange_open,
   'bank_open',bank_open,'instructions_open',instructions_open,'market_news_open',market_news_open)
 INTO v_before FROM public.event_control WHERE id=1 FOR UPDATE;
 IF v_action='LOCK_ALL' THEN
   UPDATE public.event_control SET order_intake_open=false,pit_open=false,exchange_open=false,bank_open=false,instructions_open=false,market_news_open=false WHERE id=1;
 ELSIF v_action='OPEN_ALL' THEN
   UPDATE public.event_control SET order_intake_open=true,pit_open=true,exchange_open=true,bank_open=true,instructions_open=true,market_news_open=true WHERE id=1;
 ELSIF v_action='SET' THEN
   IF NOT (p?'order_intake_open' OR p?'pit_open' OR p?'exchange_open' OR p?'bank_open' OR p?'instructions_open' OR p?'market_news_open') THEN
     PERFORM jse_fail('NO_CONTROL_CHANGE','Select at least one operating control to change.',400);
   END IF;
   UPDATE public.event_control SET
    order_intake_open=CASE WHEN p?'order_intake_open' THEN (p->>'order_intake_open')::boolean ELSE order_intake_open END,
    pit_open=CASE WHEN p?'pit_open' THEN (p->>'pit_open')::boolean ELSE pit_open END,
    exchange_open=CASE WHEN p?'exchange_open' THEN (p->>'exchange_open')::boolean ELSE exchange_open END,
    bank_open=CASE WHEN p?'bank_open' THEN (p->>'bank_open')::boolean ELSE bank_open END,
    instructions_open=CASE WHEN p?'instructions_open' THEN (p->>'instructions_open')::boolean ELSE instructions_open END,
    market_news_open=CASE WHEN p?'market_news_open' THEN (p->>'market_news_open')::boolean ELSE market_news_open END
   WHERE id=1;
 ELSE PERFORM jse_fail('INVALID_ACTION','Use STATE, SET, LOCK_ALL or OPEN_ALL.',400);
 END IF;
 SELECT jsonb_build_object('order_intake_open',order_intake_open,'pit_open',pit_open,'exchange_open',exchange_open,
   'bank_open',bank_open,'instructions_open',instructions_open,'market_news_open',market_news_open)
 INTO v_after FROM public.event_control WHERE id=1;
 PERFORM jse_audit(a,'EVENT_DESK_CONTROLS_UPDATED','event','event_control',NULL,NULL,v_before,v_after,jsonb_build_object('action',v_action));
 RETURN jsonb_build_object('success',true,'action',v_action,'gates',v_after,'status',(SELECT status FROM public.event_control WHERE id=1));
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_event_registry_action(a jsonb,p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
 v_action text:=upper(coalesce(p->>'action','STATE'));
 v_name text:=nullif(left(trim(coalesce(p->>'event_name','')),120),'');
 v_description text:=left(trim(coalesce(p->>'description','')),500);
 v_active public.jse_events%ROWTYPE; v_target public.jse_events%ROWTYPE;
 v_new_id bigint; v_base jsonb; v_status text; v_snapshot jsonb; v_summary jsonb;
BEGIN
 IF v_action='STATE' THEN
   PERFORM jse_require_role(a,'ADMIN','VIEWER');
   SELECT * INTO v_active FROM public.jse_events WHERE is_active LIMIT 1;
   RETURN jsonb_build_object('success',true,'active_event_id',v_active.id,
    'events',coalesce((SELECT jsonb_agg(jsonb_build_object(
     'id',e.id,'event_key',e.event_key,'event_name',e.event_name,'description',e.description,
     'status',CASE WHEN e.is_active THEN (SELECT status FROM public.event_control WHERE id=1) ELSE e.status END,
     'active',e.is_active,'archived',e.archived_at IS NOT NULL,'created_at',e.created_at,'updated_at',e.updated_at,
     'last_activated_at',e.last_activated_at,'summary',CASE WHEN e.is_active THEN public.jse__event_metrics() ELSE e.summary END)
     ORDER BY e.is_active DESC,e.updated_at DESC,e.id DESC) FROM public.jse_events e),'[]'::jsonb));
 END IF;
 PERFORM jse_require_role(a,'ADMIN'); PERFORM jse_require_admin_password(a,p);
 PERFORM pg_advisory_xact_lock(hashtextextended('jse-event-registry',0));
 SELECT * INTO v_active FROM public.jse_events WHERE is_active FOR UPDATE;
 IF NOT FOUND THEN PERFORM jse_fail('EVENT_REGISTRY_MISSING','Event registry is not initialized.',500); END IF;
 SELECT status INTO v_status FROM public.event_control WHERE id=1 FOR UPDATE;

 IF v_action='CREATE' THEN
   IF v_name IS NULL OR length(v_name)<2 THEN PERFORM jse_fail('EVENT_NAME_REQUIRED','Enter an event name (at least 2 characters).',400); END IF;
   IF EXISTS(SELECT 1 FROM public.jse_events WHERE lower(event_name)=lower(v_name)) THEN PERFORM jse_fail('EVENT_NAME_EXISTS','An event with this name already exists. Choose a unique event name.',409); END IF;
   IF v_status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_RUNNING','Close the current event before creating another event so its live workflow can be saved safely.',409); END IF;
   v_snapshot:=public.jse__capture_event_snapshot(); v_summary:=public.jse__event_metrics();
   UPDATE public.jse_events SET state_snapshot=v_snapshot,status=v_status,summary=v_summary,updated_at=now() WHERE id=v_active.id;
   v_base:=v_active.baseline_snapshot;
   PERFORM public.jse_reset_event(a,jsonb_build_object('confirm','RESET','keep_allotments',true,'admin_password',p->>'admin_password'));
   UPDATE public.event_config SET event_name=v_name,team_names_assigned_at=NULL,team_names_locked_at=NULL,team_names_locked_by=NULL,
     team_name_seed='JSE-'||upper(regexp_replace(v_name,'[^A-Za-z0-9]+','-','g')),updated_at=now(),updated_by=jse_actor_name(a) WHERE id=1;
   UPDATE public.jse_events SET is_active=false WHERE is_active;
   INSERT INTO public.jse_events(event_name,description,status,is_active,baseline_snapshot,state_snapshot,summary,last_activated_at)
     VALUES(v_name,v_description,'NOT_STARTED',true,v_base,public.jse__capture_event_snapshot(),public.jse__event_metrics(),now()) RETURNING id INTO v_new_id;
   PERFORM jse_audit(a,'EVENT_CREATED','event',v_new_id::text,NULL,NULL,NULL,
     jsonb_build_object('event_name',v_name,'description',v_description),jsonb_build_object('template_event_id',v_active.id,'created_from_baseline',true));
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),summary=public.jse__event_metrics(),updated_at=now() WHERE id=v_new_id;
   RETURN jsonb_build_object('success',true,'action','CREATE','event_id',v_new_id,'event_name',v_name,'status','NOT_STARTED',
     'message','New event created from this event’s saved baseline. The previous event is saved and can be selected later.');
 ELSIF v_action='ACTIVATE' THEN
   BEGIN v_new_id:=nullif(p->>'event_id','')::bigint; EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select a saved event.',400); END;
   SELECT * INTO v_target FROM public.jse_events WHERE id=v_new_id AND archived_at IS NULL FOR UPDATE;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_FOUND','That event does not exist or is archived.',404); END IF;
   IF v_target.id=v_active.id THEN RETURN jsonb_build_object('success',true,'action','ACTIVATE','event_id',v_active.id,'event_name',v_active.event_name,'unchanged',true); END IF;
   IF v_status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_RUNNING','Close the current event before switching so it can be saved consistently.',409); END IF;
   IF v_target.status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('TARGET_EVENT_RUNNING','The saved event was last running. Close it before switching away next time; select a closed event to continue.',409); END IF;
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),status=v_status,summary=public.jse__event_metrics(),updated_at=now(),is_active=false WHERE id=v_active.id;
   PERFORM public.jse__restore_event_snapshot(v_target.state_snapshot);
   UPDATE public.jse_events SET is_active=true,last_activated_at=now(),updated_at=now(),status=(SELECT status FROM public.event_control WHERE id=1),
     summary=public.jse__event_metrics() WHERE id=v_target.id;
   PERFORM jse_audit(a,'EVENT_SWITCHED','event',v_target.id::text,NULL,NULL,jsonb_build_object('from_event_id',v_active.id,'from_event_name',v_active.event_name),
     jsonb_build_object('to_event_id',v_target.id,'to_event_name',v_target.event_name),NULL);
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),summary=public.jse__event_metrics(),updated_at=now() WHERE id=v_target.id;
   RETURN jsonb_build_object('success',true,'action','ACTIVATE','event_id',v_target.id,'event_name',v_target.event_name,
     'status',(SELECT status FROM public.event_control WHERE id=1),'message','The selected event is now active. Admin desks are showing its saved state.');
 ELSIF v_action='RENAME' THEN
   BEGIN v_new_id:=coalesce(nullif(p->>'event_id','')::bigint,v_active.id); EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select an event to rename.',400); END;
   IF v_name IS NULL OR length(v_name)<2 THEN PERFORM jse_fail('EVENT_NAME_REQUIRED','Enter an event name (at least 2 characters).',400); END IF;
   IF EXISTS(SELECT 1 FROM public.jse_events WHERE lower(event_name)=lower(v_name) AND id<>v_new_id) THEN PERFORM jse_fail('EVENT_NAME_EXISTS','Another saved event already uses that name.',409); END IF;
   SELECT * INTO v_target FROM public.jse_events WHERE id=v_new_id FOR UPDATE;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_FOUND','The selected event was not found.',404); END IF;
   UPDATE public.jse_events SET event_name=v_name,description=coalesce(nullif(v_description,''),description),updated_at=now() WHERE id=v_new_id;
   IF v_target.is_active THEN
     UPDATE public.event_config SET event_name=v_name,updated_at=now(),updated_by=jse_actor_name(a) WHERE id=1;
     UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot() WHERE id=v_new_id;
   END IF;
   PERFORM jse_audit(a,'EVENT_RENAMED','event',v_new_id::text,NULL,NULL,jsonb_build_object('event_name',v_target.event_name),jsonb_build_object('event_name',v_name),NULL);
   RETURN jsonb_build_object('success',true,'action','RENAME','event_id',v_new_id,'event_name',v_name);
 ELSIF v_action='SAVE_BASELINE' THEN
   IF v_status<>'NOT_STARTED' THEN PERFORM jse_fail('BASELINE_ONLY_BEFORE_START','Save the event baseline before starting. Close and reset first if a new baseline is required.',409); END IF;
   v_base:=public.jse__capture_event_baseline();
   UPDATE public.jse_events SET baseline_snapshot=v_base,state_snapshot=public.jse__capture_event_snapshot(),summary=public.jse__event_metrics(),updated_at=now() WHERE id=v_active.id;
   PERFORM jse_audit(a,'EVENT_BASELINE_SAVED','event',v_active.id::text,NULL,NULL,NULL,NULL,
     jsonb_build_object('teams',(SELECT count(*) FROM public.teams WHERE active),'securities',(SELECT count(*) FROM public.securities WHERE active),
       'ipo_allotments',jsonb_array_length(coalesce(v_base->'ipo_allotments','[]'::jsonb))));
   UPDATE public.jse_events SET state_snapshot=public.jse__capture_event_snapshot(),updated_at=now() WHERE id=v_active.id;
   RETURN jsonb_build_object('success',true,'action','SAVE_BASELINE','event_id',v_active.id,'message','This event’s roster, companies, starting cash and IPO allotments are now its reset baseline.');
 ELSIF v_action='ARCHIVE' THEN
   BEGIN v_new_id:=nullif(p->>'event_id','')::bigint; EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select an event to archive.',400); END;
   SELECT * INTO v_target FROM public.jse_events WHERE id=v_new_id FOR UPDATE;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_FOUND','The selected event was not found.',404); END IF;
   IF v_target.is_active THEN PERFORM jse_fail('ACTIVE_EVENT','Switch to another event before archiving this one.',409); END IF;
   IF v_target.status IN ('LIVE','SETTLEMENT_ONLY') THEN PERFORM jse_fail('EVENT_RUNNING','Close the event before archiving it.',409); END IF;
   UPDATE public.jse_events SET archived_at=now(),updated_at=now() WHERE id=v_new_id;
   RETURN jsonb_build_object('success',true,'action','ARCHIVE','event_id',v_new_id);
 ELSIF v_action='RESTORE_ARCHIVED' THEN
   BEGIN v_new_id:=nullif(p->>'event_id','')::bigint; EXCEPTION WHEN others THEN PERFORM jse_fail('EVENT_REQUIRED','Select an event to restore.',400); END;
   UPDATE public.jse_events SET archived_at=NULL,updated_at=now() WHERE id=v_new_id AND archived_at IS NOT NULL;
   IF NOT FOUND THEN PERFORM jse_fail('EVENT_NOT_ARCHIVED','That event is not archived or does not exist.',404); END IF;
   RETURN jsonb_build_object('success',true,'action','RESTORE_ARCHIVED','event_id',v_new_id);
 ELSE PERFORM jse_fail('INVALID_ACTION','Use STATE, CREATE, ACTIVATE, RENAME, SAVE_BASELINE, ARCHIVE or RESTORE_ARCHIVED.',400);
 END IF;
END
$function$;

-- Database-side desk gates. UI locks are helpful, but these checks are authoritative.
DO $patch_gates$
DECLARE r record; v_fn text;
BEGIN
 FOR r IN SELECT * FROM (VALUES
  ('public.jse_place_order(jsonb,jsonb)',
   $old$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT order_intake_open FROM public.event_control WHERE id=1) THEN
    PERFORM jse_fail('ORDER_INTAKE_CLOSED','New order intake is closed by the event administrator.',409);
  END IF;$new$),
  ('public.jse_place_institutional_order(jsonb,jsonb)',
   $old$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status <> 'LIVE' THEN
    PERFORM jse_fail('EVENT_NOT_LIVE', 'New orders are accepted only while the market is LIVE (current status: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT order_intake_open FROM public.event_control WHERE id=1) THEN
    PERFORM jse_fail('ORDER_INTAKE_CLOSED','New order intake is closed by the event administrator.',409);
  END IF;$new$),
  ('public.jse_instruction_action(jsonb,jsonb)',
   $old$    IF v_status <> 'LIVE' THEN PERFORM jse_fail('EVENT_NOT_LIVE', 'Instructions can be sent while the market is LIVE.', 409); END IF;$old$,
   $new$    IF v_status <> 'LIVE' THEN PERFORM jse_fail('EVENT_NOT_LIVE', 'Instructions can be sent while the market is LIVE.', 409); END IF;
    IF NOT (SELECT instructions_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('INSTRUCTIONS_CLOSED','Participant instructions are closed by the event administrator.',409); END IF;$new$),
  ('public.jse_pit_action(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'The Pit Manager can execute orders only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'The Pit Manager can execute orders only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT pit_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('PIT_CLOSED','Pit Manager operations are closed by the event administrator.',409); END IF;$new$),
  ('public.jse_exchange_decide(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Exchange actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT exchange_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('EXCHANGE_CLOSED','Exchange desk is closed by the event administrator.',409); END IF;$new$),
  ('public.jse_bank_reject(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank actions are allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank desk is closed by the event administrator.',409); END IF;$new$),
  ('public.jse_bank_settle(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_NOT_OPEN', 'Bank settlement is allowed only while the event is LIVE or SETTLEMENT ONLY (current: ' || replace(v_status, '_', ' ') || ').', 409);
  END IF;
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank settlement is closed by the event administrator.',409); END IF;$new$),
  ('public.jse_market_news(jsonb,jsonb)',
   $old$  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;$old$,
   $new$  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;
  IF NOT (SELECT market_news_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('MARKET_NEWS_CLOSED','Market News publishing is closed by the event administrator.',409); END IF;$new$)
 ) AS x(fn,old_text,new_text)
 LOOP
   IF to_regprocedure(r.fn) IS NULL THEN CONTINUE; END IF;
   v_fn:=pg_get_functiondef(r.fn::regprocedure);
   IF position(r.new_text IN v_fn)>0 THEN CONTINUE; END IF;
   IF position(r.old_text IN v_fn)=0 THEN RAISE EXCEPTION '035: gate insertion point not found in %',r.fn; END IF;
   EXECUTE replace(v_fn,r.old_text,r.new_text);
 END LOOP;
 v_fn:=pg_get_functiondef('public.jse_bank_claim(jsonb,jsonb)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');$old$,
    $new$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank desk is closed by the event administrator.',409); END IF;$new$);
   EXECUTE v_fn;
 END IF;
 v_fn:=pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$BEGIN
  SELECT * INTO cfg FROM event_config WHERE id = 1;$old$,
    $new$BEGIN
  IF p_source='BANK' AND NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank settlement is closed by the event administrator.',409); END IF;
  SELECT * INTO cfg FROM event_config WHERE id = 1;$new$);
   EXECUTE v_fn;
 END IF;
 v_fn:=pg_get_functiondef('public.jse_loan_action(jsonb,jsonb)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');$old$,
    $new$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank desk is closed by the event administrator.',409); END IF;$new$);
   EXECUTE v_fn;
 END IF;
 v_fn:=pg_get_functiondef('public.jse_loan_decide(jsonb,jsonb)'::regprocedure);
 IF position('BANK_CLOSED' IN v_fn)=0 THEN
   v_fn:=replace(v_fn,$old$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');$old$,
    $new$  PERFORM jse_require_role(a, 'ADMIN', 'BANK');
  IF NOT (SELECT bank_open FROM public.event_control WHERE id=1) THEN PERFORM jse_fail('BANK_CLOSED','Bank loan decisions are closed by the event administrator.',409); END IF;$new$);
   EXECUTE v_fn;
 END IF;
END
$patch_gates$;

-- Seed existing live state once. No current event tables or rows are reset by this migration.
DO $seed_event_registry$
DECLARE v_name text; v_status text; v_baseline jsonb; v_snapshot jsonb;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.jse_events) THEN
   SELECT event_name INTO v_name FROM public.event_config WHERE id=1;
   SELECT status INTO v_status FROM public.event_control WHERE id=1;
   SELECT snapshot INTO v_baseline FROM public.jse_locked_baseline WHERE id=1;
   IF v_baseline IS NULL THEN v_baseline:=public.jse__capture_event_baseline(); END IF;
   v_snapshot:=public.jse__capture_event_snapshot();
   INSERT INTO public.jse_events(event_name,description,status,is_active,baseline_snapshot,state_snapshot,summary,last_activated_at)
     VALUES(coalesce(nullif(v_name,''),'JAIN STOCK EXCHANGE EVENT'),'Imported existing JSE state',coalesce(v_status,'NOT_STARTED'),true,
       v_baseline,v_snapshot,public.jse__event_metrics(),now());
 END IF;
END
$seed_event_registry$;

INSERT INTO public.schema_migrations(version) VALUES ('035_multi_event_admin') ON CONFLICT (version) DO NOTHING;
