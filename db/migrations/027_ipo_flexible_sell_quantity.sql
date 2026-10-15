-- 027: Only IPO SELL transactions may use quantities outside the standard lot size.
-- IPO sells still require a positive whole-share quantity, sufficient holdings, and the normal value/settlement rules.
DO $jse_migration$
DECLARE
  v_fn text;
  v_old text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$IF v_qty % v_sec.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse_place_order'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF v_qty % v_sec.lot_size <> 0 AND NOT (v_sec.kind = 'IPO' AND v_side = 'SELL') THEN$new$);
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse_place_institutional_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$IF v_qty IS NULL OR v_qty <= 0 OR v_qty % v_sec.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse_place_institutional_order'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF v_qty IS NULL OR v_qty <= 0 OR (v_qty % v_sec.lot_size <> 0 AND NOT (v_sec.kind = 'IPO' AND jse_team_side('INSTITUTION', v_side) = 'SELL')) THEN$new$);
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse_instruction_action(jsonb,jsonb)'::regprocedure);
  v_old := $old$IF v_qty IS NULL OR v_qty <= 0 OR v_qty % s.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse_instruction_action'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF v_qty IS NULL OR v_qty <= 0 OR (v_qty % s.lot_size <> 0 AND NOT (s.kind = 'IPO' AND v_side = 'SELL')) THEN$new$);
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  v_old := $old$IF o.quantity <= 0 OR o.quantity % s.lot_size <> 0 THEN$old$;
  IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '027: expected lot check not found in jse__settle'; END IF;
  v_fn := replace(v_fn, v_old, $new$IF o.quantity <= 0 OR (o.quantity % s.lot_size <> 0 AND NOT (s.kind = 'IPO' AND jse_team_side(o.account_type, o.side) = 'SELL')) THEN$new$);
  EXECUTE v_fn;
END
$jse_migration$;
