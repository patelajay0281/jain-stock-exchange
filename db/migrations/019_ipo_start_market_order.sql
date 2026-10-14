-- 019: IPOs must surface in the top market positions on Start Event;
-- IPO market colour remains measured against the original allotment/issue price.
CREATE OR REPLACE FUNCTION public.jse__list_ipo(a jsonb, p_id integer)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE s securities%ROWTYPE; v_price numeric; v_pct numeric; v_n integer;
BEGIN
  SELECT * INTO s FROM securities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR s.kind <> 'IPO' OR s.listed_at IS NOT NULL OR NOT s.active THEN RETURN NULL; END IF;
  IF s.trade_count > 0 OR s.price <> s.base_price
     OR EXISTS (SELECT 1 FROM market_news n WHERE n.security_id = s.id AND n.reversed_at IS NULL) THEN
    PERFORM jse_fail('IPO_ALREADY_MOVED', s.symbol || ' has already traded or moved on Market News; it can no longer be listed.', 409);
  END IF;
  v_price := coalesce(s.listing_price, s.base_price);
  v_pct := jse_pct(v_price, s.price);
  PERFORM jse__set_price(a, s.id, v_price, 'LISTING');
  -- Give every IPO a fresh board timestamp even if its new listing price equals issue price.
  -- Board sorts by last_price_change_at, so all four IPOs surface at Start Event and later
  -- stock updates naturally take precedence.
  UPDATE securities
     SET listed_at = clock_timestamp(),
         index_base_price = v_price,
         last_price_change_at = clock_timestamp(),
         updated_at = now()
   WHERE id = s.id;
  SELECT count(*) INTO v_n FROM securities WHERE active AND (kind = 'EQUITY' OR listed_at IS NOT NULL);
  PERFORM jse_audit(a, 'IPO_LISTED', 'security', s.symbol, NULL, NULL,
    jsonb_build_object('stage', jse_ipo_stage(s.id), 'price', s.price),
    jsonb_build_object('stage', 'LISTED', 'price', v_price, 'cms_index', 'INCLUDED'),
    jsonb_build_object('issue_price', s.base_price, 'listing_price', v_price, 'listed_at_issue_price', s.listing_price IS NULL,
                       'change_pct', round(v_pct, 2), 'cms_index_components', v_n, 'source', 'LISTING'));
  PERFORM jse_journal('IPO_LISTING', s.id,
    s.symbol || ' listed at ' || jse_inr(v_price) || ' (issue ' || jse_inr(s.base_price) || ', ' || CASE WHEN v_pct > 0 THEN '+' ELSE '' END || to_char(round(v_pct, 2), 'FM990.00') || '%) · CMS 50 ' || v_n || ' components',
    jsonb_build_object('security_id', s.id, 'from_price', s.price, 'from_previous', s.previous_price, 'listing_price', v_price), a);
  RETURN jsonb_build_object('symbol', s.symbol, 'name', s.name, 'issue_price', s.base_price, 'listing_price', v_price,
                            'change_pct', round(v_pct, 2), 'at_issue_price', s.listing_price IS NULL, 'index_components', v_n);
END $function$;

INSERT INTO public.schema_migrations(version) VALUES ('019_ipo_start_market_order');
