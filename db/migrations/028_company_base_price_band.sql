-- 028: Keep each company's Market News price within a permanent +/-15% band from its locked base price.
-- Hitting the band limits price movement in that direction; it does not disable BUY/SELL orders.
DO $jse_migration$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
BEGIN
  v_fn := pg_get_functiondef('public.jse_market_news(jsonb,jsonb)'::regprocedure);

  v_old := $old$  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
  SELECT previous_price INTO v_day_base
  FROM market_news
  WHERE security_id = s.id
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day'
    AND reversed_at IS NULL
  ORDER BY created_at, id
  LIMIT 1;
  v_day_base := coalesce(v_day_base, s.price);$old$;
  v_new := $new$  -- Always anchor the price band to the company's locked starting/base price, not a daily baseline.
  v_day_base := coalesce(s.base_price, s.price);$new$;

  IF position(v_old IN v_fn) > 0 THEN
    v_fn := replace(v_fn, v_old, v_new);
    v_fn := replace(v_fn, 'v_day_start timestamptz; v_day_base numeric;', 'v_band_base numeric;');
    v_fn := replace(v_fn, 'v_day_base', 'v_band_base');
  ELSIF position('v_band_base := coalesce(s.base_price, s.price);' IN v_fn) = 0 THEN
    RAISE EXCEPTION '028: expected Market News daily-baseline logic was not found';
  END IF;

  EXECUTE v_fn;
END
$jse_migration$;

INSERT INTO schema_migrations(version) VALUES ('028_ipo_company_price_band')
ON CONFLICT (version) DO NOTHING;
