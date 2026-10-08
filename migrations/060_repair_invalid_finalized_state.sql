-- JAIN STOCK EXCHANGE — one-time repair of an inconsistent finalized event state
-- Safety: only repairs FINALIZED when Exchange/Bank work is still pending.
DO $$
DECLARE v_admin bigint; v_open bigint;
BEGIN
  SELECT COUNT(*) INTO v_open FROM public.orders WHERE status IN ('PENDING_EXCHANGE','EXCHANGE_APPROVED');
  IF EXISTS (SELECT 1 FROM public.event_state WHERE id=1 AND status='FINALIZED') AND v_open>0 THEN
    SELECT id INTO v_admin FROM public.users WHERE lower(username)=lower('ADMINAP') AND is_active=true LIMIT 1;

    CREATE OR REPLACE FUNCTION public.enforce_event_transition()
    RETURNS trigger LANGUAGE plpgsql
    SET search_path=public,pg_temp
    AS $fn$
    BEGIN
      IF NEW.status=OLD.status THEN RETURN NEW; END IF;
      IF current_setting('jse.reset',true)='1' AND OLD.status='FINALIZED' AND NEW.status='NOT_STARTED' THEN RETURN NEW; END IF;
      IF current_setting('jse.repair',true)='1' AND OLD.status='FINALIZED' AND NEW.status='CLOSED' THEN RETURN NEW; END IF;
      IF NOT (
        (OLD.status='NOT_STARTED' AND NEW.status='LIVE')
        OR (OLD.status='LIVE' AND NEW.status IN ('PAUSED','CLOSED'))
        OR (OLD.status='PAUSED' AND NEW.status IN ('LIVE','CLOSED'))
        OR (OLD.status='CLOSED' AND NEW.status='FINALIZED')
      ) THEN
        RAISE EXCEPTION 'Illegal event transition: % -> %',OLD.status,NEW.status USING ERRCODE='P0001';
      END IF;
      RETURN NEW;
    END;
    $fn$;

    PERFORM set_config('jse.repair','1',true);
    UPDATE public.event_state
      SET status='CLOSED',
          finalized_at=NULL,
          topper_team_id=NULL,
          topper_realized_profit_paise=NULL,
          finalization_note='FINALIZATION_REVERSED: unsettled orders remained; event returned to CLOSED for safe settlement.',
          updated_at=NOW()
    WHERE id=1 AND status='FINALIZED';

    IF v_admin IS NOT NULL THEN
      INSERT INTO public.audit_log(actor_user_id,actor_email,actor_role,action,what_happened,details_json)
      SELECT id,email,role,'EVENT_FINALIZATION_GUARD_REPAIR',
        'System repaired an inconsistent FINALIZED state because unsettled Exchange/Bank orders remained.',
        jsonb_build_object('previous_status','FINALIZED','new_status','CLOSED','open_orders',v_open,'safe_settlement_required',true)
      FROM public.users WHERE id=v_admin;
    END IF;

    CREATE OR REPLACE FUNCTION public.enforce_event_transition()
    RETURNS trigger LANGUAGE plpgsql
    SET search_path=public,pg_temp
    AS $fn2$
    BEGIN
      IF NEW.status=OLD.status THEN RETURN NEW; END IF;
      IF current_setting('jse.reset',true)='1' AND OLD.status='FINALIZED' AND NEW.status='NOT_STARTED' THEN RETURN NEW; END IF;
      IF NOT (
        (OLD.status='NOT_STARTED' AND NEW.status='LIVE')
        OR (OLD.status='LIVE' AND NEW.status IN ('PAUSED','CLOSED'))
        OR (OLD.status='PAUSED' AND NEW.status IN ('LIVE','CLOSED'))
        OR (OLD.status='CLOSED' AND NEW.status='FINALIZED')
      ) THEN
        RAISE EXCEPTION 'Illegal event transition: % -> %',OLD.status,NEW.status USING ERRCODE='P0001';
      END IF;
      RETURN NEW;
    END;
    $fn2$;
  END IF;
END $$;