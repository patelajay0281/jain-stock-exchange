-- 038: make the Short Selling ON/OFF configuration control persist its state.
-- This migration changes the admin configuration flag only. The trading engine still
-- rejects short sales until short-position accounting and settlement support are deployed.
DO $$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_update_config(jsonb,jsonb)'::regprocedure);

  v_old := $old$  IF coalesce((p->>'allow_short_selling')::boolean,false) THEN
    PERFORM jse_fail('SHORT_SELLING_UNAVAILABLE','Allow Short Selling cannot be enabled yet: participant holdings must remain non-negative, and the current system does not have a short-liability, collateral, covering and reversal ledger. Keep the setting OFF.',409);
  END IF;$old$;
  IF position(v_old IN v_fn) > 0 THEN
    v_fn := replace(v_fn, v_old, '');
  END IF;

  v_old := '    allow_short_selling = false,';
  v_new := '    allow_short_selling = coalesce((p->>''allow_short_selling'')::boolean,allow_short_selling),';
  IF position(v_old IN v_fn) = 0 AND position(v_new IN v_fn) = 0 THEN
    RAISE EXCEPTION '038: allow_short_selling update anchor not found';
  END IF;
  v_fn := replace(v_fn, v_old, v_new);
  EXECUTE v_fn;
END $$;

INSERT INTO schema_migrations(version) VALUES ('038_short_selling_config_toggle')
ON CONFLICT (version) DO NOTHING;
