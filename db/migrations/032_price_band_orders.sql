-- 032: open orders stay valid while their price is within ±15% of the current market price.
-- A Market News move closes (PRICE_STALE) only the orders whose price is now more than 15% away; the Exchange and the Bank
-- apply the same test. The execution price is always the order's own recorded price — never silently changed.
-- Text patches on the live functions; idempotent; no data changes.
CREATE OR REPLACE FUNCTION jse_price_out_of_band(p_order_price numeric, p_market numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT p_market IS NULL OR p_market <= 0 OR abs(p_order_price - p_market) > p_market * jse_price_deviation_pct() / 100
$$;

DO $p$
DECLARE v_fn text; r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('public.jse__stale_orders(jsonb,integer,numeric,text)', 'AND coalesce(reference_price, price) <> p_new_price', 'AND jse_price_out_of_band(price, p_new_price)'),
    ('public.jse_exchange_decide(jsonb,jsonb)', 'coalesce(o.reference_price, o.price) <> (SELECT price FROM securities WHERE id = o.security_id)', 'jse_price_out_of_band(o.price, (SELECT price FROM securities WHERE id = o.security_id))'),
    ('public.jse__settle(jsonb,bigint,text)', 'IF coalesce(o.reference_price, o.price) <> s.price AND p_source = ''BANK'' THEN', 'IF jse_price_out_of_band(o.price, s.price) AND p_source = ''BANK'' THEN'),
    ('public.jse_pit_action(jsonb,jsonb)', 'IF coalesce(o.reference_price, o.price) <> s.price THEN', 'IF jse_price_out_of_band(o.price, s.price) THEN')
  ) AS x(fn, old, new) LOOP
    IF to_regprocedure(r.fn) IS NULL THEN CONTINUE; END IF;
    v_fn := pg_get_functiondef(r.fn::regprocedure);
    IF position(r.new IN v_fn) > 0 THEN CONTINUE; END IF;
    IF position(r.old IN v_fn) = 0 THEN RAISE EXCEPTION '032: expected stale check not found in %', r.fn; END IF;
    EXECUTE replace(v_fn, r.old, r.new);
  END LOOP;
END $p$;

INSERT INTO schema_migrations(version) VALUES ('032_price_band_orders') ON CONFLICT DO NOTHING;
