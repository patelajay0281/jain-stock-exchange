-- 023: Prevent clearing or editing the locked baseline IPO allotments.
-- Event Reset is the only routine action that temporarily truncates and then restores these rows.
CREATE OR REPLACE FUNCTION public.jse_guard_locked_ipo_allotment()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_matches_baseline boolean;
BEGIN
  IF current_setting('jse.maintenance', true) = 'on' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.jse_locked_baseline b
    CROSS JOIN LATERAL jsonb_array_elements(coalesce(b.snapshot->'ipo_allotments','[]'::jsonb)) AS x(value)
    WHERE b.id = 1
      AND (x.value->>'team_id')::integer = OLD.team_id
      AND (x.value->>'security_id')::integer = OLD.security_id
      AND (x.value->>'lots')::integer = OLD.lots
      AND (x.value->>'quantity')::integer = OLD.quantity
      AND (x.value->>'price')::numeric = OLD.price
      AND (x.value->>'amount')::numeric = OLD.amount
      AND coalesce(x.value->>'batch_id','') = coalesce(OLD.batch_id,'')
  ) INTO v_matches_baseline;

  IF v_matches_baseline THEN
    RAISE EXCEPTION 'This IPO allotment is part of the locked baseline. Use Event Reset to restore it; update the baseline only through an explicit administrator change.';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END
$function$;

DROP TRIGGER IF EXISTS jse_guard_locked_ipo_allotment ON public.ipo_allotments;
CREATE TRIGGER jse_guard_locked_ipo_allotment
BEFORE UPDATE OR DELETE ON public.ipo_allotments
FOR EACH ROW EXECUTE FUNCTION public.jse_guard_locked_ipo_allotment();

INSERT INTO public.schema_migrations(version) VALUES ('023_lock_baseline_ipo_allotments')
ON CONFLICT (version) DO NOTHING;
