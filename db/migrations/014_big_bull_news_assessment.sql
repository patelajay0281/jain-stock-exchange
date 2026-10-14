-- 014: Correct BIG BULL cash ceiling, daily news price cap, and final cash eligibility.
-- Automated price changer configuration/logic is intentionally unchanged.

ALTER TABLE public.jse_special_accounts
  ALTER COLUMN cash_limit SET DEFAULT 10000000;
UPDATE public.jse_special_accounts
  SET cash_limit = 10000000, updated_at = now()
  WHERE account_code = 'BIG-BULL';
UPDATE public.event_config SET cash_rule_limit = 100000 WHERE id = 1;

CREATE OR REPLACE FUNCTION public.jse_special_cash_limit_guard()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE v_limit numeric;
BEGIN
  SELECT cash_limit INTO v_limit FROM public.jse_special_accounts WHERE team_id = NEW.id;
  IF FOUND AND NEW.cash > v_limit THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='BIG BULL cash limit is ₹1,00,00,000.00; this balance change is blocked.';
  END IF;
  RETURN NEW;
END $function$;

-- Keep the admin function's fallback aligned with the stored ₹1 crore limit.
DO $do$
DECLARE v_def text;
BEGIN
  SELECT pg_get_functiondef('public.jse_big_bull_admin(jsonb,jsonb)'::regprocedure) INTO v_def;
  IF position('coalesce(v_cash_limit,100000000)' IN v_def) > 0 THEN
    v_def := replace(v_def, 'coalesce(v_cash_limit,100000000)', 'coalesce(v_cash_limit,10000000)');
    EXECUTE v_def;
  END IF;
END $do$;

-- Only the Market News mood bands use the expanded +/-15% range.
CREATE OR REPLACE FUNCTION public.jse_mood_band(p_mood text)
RETURNS numeric[] LANGUAGE sql IMMUTABLE AS $function$
  SELECT CASE upper(replace(trim(p_mood), ' ', '_'))
    WHEN 'VERY_SEVERE'    THEN ARRAY[-15.00, -7.50]
    WHEN 'SEVERE'         THEN ARRAY[-7.49, -5.00]
    WHEN 'NEGATIVE'       THEN ARRAY[-4.99, -1.00]
    WHEN 'NORMAL'         THEN ARRAY[-0.99, 0.99]
    WHEN 'POSITIVE'       THEN ARRAY[1.00, 4.99]
    WHEN 'VERY_POSITIVE'  THEN ARRAY[5.00, 7.49]
    WHEN 'SUPER_POSITIVE' THEN ARRAY[7.50, 15.00]
  END::numeric[]
$function$;

-- A security's news-driven price is constrained to +/-15% of its first active news
-- baseline for the current India-local day. The automated price changer is not changed.
CREATE OR REPLACE FUNCTION public.jse_market_news(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  cfg event_config%ROWTYPE; v_status text; s securities%ROWTYPE;
  v_mood text := upper(replace(trim(coalesce(p->>'mood', p->>'severity', '')), ' ', '_'));
  v_headline text := nullif(left(trim(coalesce(p->>'headline', '')), 240), '');
  v_band numeric[]; v_pct numeric; v_new numeric; v_lo numeric; v_hi numeric;
  v_day_start timestamptz; v_day_base numeric; v_daily_cap constant numeric := 15;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'INSTITUTIONAL');
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR SHARE;
  IF v_status NOT IN ('NOT_STARTED', 'LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_CLOSED', 'Market News is not allowed after the market has closed.', 409);
  END IF;
  v_band := jse_mood_band(v_mood);
  IF v_band IS NULL THEN PERFORM jse_fail('INVALID_MOOD', 'Choose a news severity.', 400); END IF;
  SELECT * INTO s FROM securities WHERE (p ? 'security_id' AND id = nullif(p->>'security_id', '')::integer) OR (p ? 'symbol' AND symbol = upper(trim(p->>'symbol')));
  IF NOT FOUND THEN PERFORM jse_fail('SECURITY_NOT_FOUND', 'Select a company.', 404); END IF;
  IF s.kind = 'IPO' AND s.listed_at IS NULL THEN
    PERFORM jse_fail('IPO_NOT_LISTED', s.symbol || ' is still in the IPO stage; Market News applies once it lists.', 409);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('jse-news:' || s.id, 0));
  SELECT * INTO s FROM securities WHERE id = s.id FOR UPDATE;

  v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
  SELECT previous_price INTO v_day_base
  FROM market_news
  WHERE security_id = s.id
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day'
    AND reversed_at IS NULL
  ORDER BY created_at, id
  LIMIT 1;
  v_day_base := coalesce(v_day_base, s.price);

  v_pct := round((v_band[1] + random() * (v_band[2] - v_band[1]))::numeric, 2);
  v_new := jse_round_tick(s.price * (1 + v_pct / 100), cfg.price_tick);
  v_lo := ceil(v_day_base * (1 - v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_hi := floor(v_day_base * (1 + v_daily_cap / 100) / cfg.price_tick) * cfg.price_tick;
  v_new := greatest(v_lo, least(v_hi, v_new));
  IF v_new <= 0 THEN v_new := cfg.price_tick; END IF;
  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));
END $function$;

INSERT INTO schema_migrations(version) VALUES ('014_big_bull_news_assessment');
