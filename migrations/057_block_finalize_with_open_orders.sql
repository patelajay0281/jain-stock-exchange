-- JAIN STOCK EXCHANGE — prevent finalization while Exchange/Bank work remains
CREATE OR REPLACE FUNCTION public.guard_finalized_event_no_open_orders()
RETURNS trigger
LANGUAGE plpgsql
SET search_path=public,pg_temp
AS $$
BEGIN
  IF NEW.status='FINALIZED' AND EXISTS(
    SELECT 1 FROM public.orders
    WHERE status IN ('PENDING_EXCHANGE','EXCHANGE_APPROVED')
  ) THEN
    RAISE EXCEPTION 'Cannot finalize while pending settlement orders remain';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_state_finalize_guard ON public.event_state;
CREATE TRIGGER event_state_finalize_guard
BEFORE UPDATE OF status ON public.event_state
FOR EACH ROW
EXECUTE FUNCTION public.guard_finalized_event_no_open_orders();