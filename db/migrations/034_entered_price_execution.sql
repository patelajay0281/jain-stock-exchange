-- 034: execution is at the explicit order-ticket price; market moves never reject an order as PRICE_STALE.
-- Keep reference_price for audit/analytics, but do not use it as a submission or settlement veto.
-- The two desks send price (execution price) and expected_price (market reference snapshot).
DO $migration$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
  r record;
BEGIN
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$  -- the broker's screen showed a price; if Market News moved it since, ask the broker to review (no silent re-quote)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The order was not submitted — review the new value with the participant and submit again.';
  END IF;$old$;
  v_new := $new$  -- A market move is informational only. Execute at the explicit ticket price when supplied.
$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected jse_place_order price guard not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  v_old := $old$  ELSE
    v_price := v_sec.price;
  END IF;$old$;
  v_new := $new$  ELSE
    v_price := coalesce(nullif(p->>'price', '')::numeric, v_expected, v_sec.price);
  END IF;$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected jse_place_order price assignment not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  EXECUTE v_fn;

  v_fn := pg_get_functiondef('public.jse_place_institutional_order(jsonb,jsonb)'::regprocedure);
  v_old := $old$  -- expected_price = the prevailing MARKET price the desk saw (the institutional price is derived from it)
  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN
    RAISE EXCEPTION USING ERRCODE = 'JSE01', DETAIL = 'PRICE_CHANGED', HINT = '409',
      MESSAGE = 'MARKET PRICE CHANGED: ' || v_sec.symbol || ' moved from ' || jse_inr(v_expected) || ' to ' || jse_inr(v_sec.price) ||
                ' (Market News). The institutional price is recalculated from the new market price — review and submit again.';
  END IF;$old$;
  v_new := $new$  -- Market moves do not reject an institutional order; execution price is explicit when supplied.
$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected institutional price guard not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  v_old := $old$  v_price := round(v_sec.price, 2);$old$;
  v_new := $new$  v_price := coalesce(nullif(p->>'price', '')::numeric, round(v_sec.price, 2));$new$;
  IF position(v_new IN v_fn) = 0 THEN
    IF position(v_old IN v_fn) = 0 THEN RAISE EXCEPTION '034: expected institutional price assignment not found'; END IF;
    v_fn := replace(v_fn, v_old, v_new);
  END IF;
  EXECUTE v_fn;

  FOR r IN SELECT * FROM (VALUES
    ('public.jse__stale_orders(jsonb,integer,numeric,text)', 'AND jse_price_out_of_band(price, p_new_price)', 'AND false'),
    ('public.jse_exchange_decide(jsonb,jsonb)', 'jse_price_out_of_band(o.price, (SELECT price FROM securities WHERE id = o.security_id))', 'false'),
    ('public.jse__settle(jsonb,bigint,text)', 'IF jse_price_out_of_band(o.price, s.price) AND p_source = ''BANK'' THEN', 'IF false THEN'),
    ('public.jse_pit_action(jsonb,jsonb)', 'IF jse_price_out_of_band(o.price, s.price) THEN', 'IF false THEN')
  ) AS x(fn, old, new)
  LOOP
    IF to_regprocedure(r.fn) IS NULL THEN CONTINUE; END IF;
    v_fn := pg_get_functiondef(r.fn::regprocedure);
    IF position(r.new IN v_fn) > 0 THEN CONTINUE; END IF;
    IF position(r.old IN v_fn) = 0 THEN
      RAISE EXCEPTION '034: expected stale-price check not found in %', r.fn;
    END IF;
    EXECUTE replace(v_fn, r.old, r.new);
  END LOOP;
END
$migration$;

INSERT INTO schema_migrations(version) VALUES ('034_entered_price_execution') ON CONFLICT DO NOTHING;
