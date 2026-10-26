-- 036: event-specific administrator pricing-method selector.
-- This stores the single selected method per saved event; no per-method parameter panels are required.
ALTER TABLE public.jse_events
  ADD COLUMN IF NOT EXISTS pricing_method text NOT NULL DEFAULT 'NEWS_DRIVEN';

DO $pricing_method_constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.jse_events'::regclass AND conname='jse_events_pricing_method_check'
  ) THEN
    ALTER TABLE public.jse_events
      ADD CONSTRAINT jse_events_pricing_method_check
      CHECK (pricing_method IN (
        'MANUAL','NEWS_DRIVEN','MOMENTUM','MEAN_REVERSION','SUPPLY_DEMAND',
        'SECTOR_INDEX','VOLATILITY','HYBRID','SCENARIO'
      ));
  END IF;
END
$pricing_method_constraint$;

CREATE OR REPLACE FUNCTION public.jse_pricing_method(a jsonb, p jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_action text := upper(coalesce(p->>'action','STATE'));
  v_method text := upper(trim(coalesce(p->>'method','')));
  v_event public.jse_events%ROWTYPE;
  v_before text;
BEGIN
  IF v_action='STATE' THEN
    PERFORM jse_require_role(a,'ADMIN','VIEWER');
    SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1;
    RETURN jsonb_build_object(
      'success',true,
      'event_id',v_event.id,
      'event_name',v_event.event_name,
      'method',coalesce(v_event.pricing_method,'NEWS_DRIVEN')
    );
  END IF;

  IF v_action NOT IN ('SET','APPLY') THEN
    PERFORM jse_fail('INVALID_ACTION','Use STATE or SET to manage the pricing method.',400);
  END IF;
  PERFORM jse_require_role(a,'ADMIN');
  PERFORM jse_require_admin_password(a,p);
  IF v_method NOT IN (
    'MANUAL','NEWS_DRIVEN','MOMENTUM','MEAN_REVERSION','SUPPLY_DEMAND',
    'SECTOR_INDEX','VOLATILITY','HYBRID','SCENARIO'
  ) THEN
    PERFORM jse_fail('INVALID_PRICING_METHOD','Choose one of the available pricing methods.',400);
  END IF;

  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1 FOR UPDATE;
  IF v_event.id IS NULL THEN
    PERFORM jse_fail('ACTIVE_EVENT_REQUIRED','Create or activate an event before selecting its pricing method.',409);
  END IF;
  v_before := coalesce(v_event.pricing_method,'NEWS_DRIVEN');
  IF v_before <> v_method THEN
    UPDATE public.jse_events SET pricing_method=v_method,updated_at=now() WHERE id=v_event.id;
    PERFORM public.jse_audit(
      a,'PRICING_METHOD_CHANGED','event',v_event.id::text,NULL,NULL,NULL,
      jsonb_build_object('pricing_method',v_before),
      jsonb_build_object('pricing_method',v_method,'event_name',v_event.event_name)
    );
  END IF;
  RETURN jsonb_build_object(
    'success',true,'event_id',v_event.id,'event_name',v_event.event_name,
    'previous_method',v_before,'method',v_method,
    'changed',(v_before<>v_method),
    'message',CASE WHEN v_before=v_method THEN 'This pricing method is already selected.' ELSE 'Pricing method selection saved for this event.' END
  );
END
$function$;

INSERT INTO public.schema_migrations(version)
VALUES ('036_pricing_method_selector')
ON CONFLICT (version) DO NOTHING;
