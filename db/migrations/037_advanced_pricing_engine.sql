-- 037: advanced event-scoped pricing configuration and automatic price engine.
-- Enables/disables pricing methods per event and calculates post-trade quote movement without
-- rejecting or rewriting existing orders at a stale quote. All changes are journal/audit visible.

ALTER TABLE public.jse_events
  ADD COLUMN IF NOT EXISTS pricing_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pricing_config jsonb NOT NULL DEFAULT
    '{
      "enabled_methods":{"MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,"SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true},
      "apply_on_trades":true,
      "apply_on_news":true,
      "max_move_per_trade_pct":0.75,
      "momentum_lookback":5,
      "mean_reversion_strength":0.12,
      "supply_demand_strength":0.75,
      "sector_link_strength":0.35,
      "volatility_multiplier":0.45,
      "scenario":"SIDEWAYS",
      "hybrid_weights":{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}
    }'::jsonb;

-- Keep price-history source validation strict while permitting the new pricing engine's recorded sources.
DO $price_history_sources$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO v_def
  FROM pg_constraint
  WHERE conrelid='public.price_history'::regclass AND conname='price_history_source_check';
  IF v_def IS NULL OR position('AUTO_MOMENTUM' IN v_def)=0 OR position('ADMIN_MANUAL_PRICE' IN v_def)=0 THEN
    ALTER TABLE public.price_history DROP CONSTRAINT IF EXISTS price_history_source_check;
    ALTER TABLE public.price_history ADD CONSTRAINT price_history_source_check CHECK (
      source = ANY (ARRAY[
        'TRADE','MARKET_NEWS','RESET','UNDO','REDO','ADMIN','LISTING',
        'ADMIN_MANUAL_PRICE','AUTO_MANUAL','AUTO_NEWS_DRIVEN','AUTO_MOMENTUM',
        'AUTO_MEAN_REVERSION','AUTO_SUPPLY_DEMAND','AUTO_SECTOR_INDEX',
        'AUTO_VOLATILITY','AUTO_HYBRID','AUTO_SCENARIO','AUTO_SECTOR_LINK'
      ]::text[])
    );
  END IF;
END
$price_history_sources$;

UPDATE public.jse_events
SET pricing_config = '{
  "enabled_methods":{"MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,"SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true},
  "apply_on_trades":true,"apply_on_news":true,"max_move_per_trade_pct":0.75,
  "momentum_lookback":5,"mean_reversion_strength":0.12,"supply_demand_strength":0.75,
  "sector_link_strength":0.35,"volatility_multiplier":0.45,"scenario":"SIDEWAYS",
  "hybrid_weights":{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}
}'::jsonb
WHERE pricing_config IS NULL OR pricing_config='{}'::jsonb;

CREATE OR REPLACE FUNCTION public.jse__record_news_no_price(
  a jsonb, s public.securities, p_mood text, p_requested numeric, p_headline text
) RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_news bigint;
  v_headline text := coalesce(p_headline, initcap(replace(p_mood,'_',' ')) || ' news on ' || s.name);
BEGIN
  INSERT INTO public.market_news(
    security_id,mood,headline,requested_pct,applied_pct,previous_price,new_price,prior_previous,created_by,created_by_name
  ) VALUES (
    s.id,p_mood,v_headline,coalesce(p_requested,0),0,s.price,s.price,s.previous_price,
    nullif(a->>'id','')::integer,public.jse_actor_name(a)
  ) RETURNING id INTO v_news;

  PERFORM public.jse_audit(
    a,'MARKET_NEWS_RECORDED_NO_PRICE','security',s.symbol,NULL,NULL,
    jsonb_build_object('price',s.price),
    jsonb_build_object('price',s.price),
    jsonb_build_object('news_id',v_news,'company',s.name,'symbol',s.symbol,'headline',v_headline,
      'severity',p_mood,'price_change',false,'reason','Current pricing configuration suppresses news-driven price changes')
  );
  PERFORM public.jse_journal(
    'MARKET_NEWS',v_news,
    s.symbol || ' ' || replace(p_mood,'_',' ') || ' news recorded · no price change',
    jsonb_build_object('news_id',v_news,'security_id',s.id,'price_change',false),a
  );
  RETURN jsonb_build_object(
    'success',true,'news_id',v_news,'symbol',s.symbol,'name',s.name,'mood',p_mood,'headline',v_headline,
    'requested_pct',coalesce(p_requested,0),'applied_pct',0,'previous_price',s.price,'new_price',s.price,
    'stale_orders',0,'price_changed',false,'source','MARKET_NEWS_NO_PRICE'
  );
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__apply_news_price(
  a jsonb,s public.securities,p_mood text,p_req numeric,p_new numeric,p_headline text
) RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_news bigint;
  v_applied numeric;
  v_headline text:=coalesce(p_headline,initcap(replace(p_mood,'_',' '))||' news on '||s.name);
BEGIN
  IF p_new IS NULL OR p_new<=0 THEN RAISE EXCEPTION 'Invalid news-driven price for %',s.symbol; END IF;
  v_applied:=public.jse_pct(p_new,s.price);
  INSERT INTO public.market_news(
    security_id,mood,headline,requested_pct,applied_pct,previous_price,new_price,prior_previous,created_by,created_by_name
  ) VALUES (
    s.id,p_mood,v_headline,p_req,v_applied,s.price,p_new,s.previous_price,
    nullif(a->>'id','')::integer,public.jse_actor_name(a)
  ) RETURNING id INTO v_news;

  UPDATE public.securities
    SET previous_price=s.price,price=p_new,updated_at=now(),
        last_price_change_at=CASE WHEN p_new<>s.price THEN clock_timestamp() ELSE last_price_change_at END
    WHERE id=s.id;
  IF p_new<>s.price THEN
    INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source,news_id)
      VALUES(s.id,s.price,p_new,v_applied,'MARKET_NEWS',v_news);
  END IF;
  UPDATE public.event_control SET market_updated_at=now() WHERE id=1;
  PERFORM public.jse_audit(
    a,'MARKET_NEWS_PRICE_MOVE','security',s.symbol,NULL,NULL,
    jsonb_build_object('price',s.price,'previous_price',s.previous_price),
    jsonb_build_object('price',p_new,'previous_price',s.price),
    jsonb_build_object('company',s.name,'symbol',s.symbol,'headline',v_headline,'severity',p_mood,
      'requested_pct',p_req,'applied_pct',v_applied,'previous_price',s.price,'new_price',p_new,
      'news_id',v_news,'stale_orders_rejected',0,'source','MARKET_NEWS')
  );
  PERFORM public.jse_journal(
    'MARKET_NEWS',v_news,
    s.symbol||' '||replace(p_mood,'_',' ')||' '||CASE WHEN v_applied>0 THEN '+' ELSE '' END||
      to_char(v_applied,'FM990.00')||'% ('||public.jse_inr(s.price)||' → '||public.jse_inr(p_new)||')',
    jsonb_build_object('news_id',v_news,'security_id',s.id,'stale_orders_rejected',0),a
  );
  RETURN jsonb_build_object('success',true,'news_id',v_news,'symbol',s.symbol,'name',s.name,'mood',p_mood,
    'headline',v_headline,'requested_pct',p_req,'applied_pct',v_applied,'previous_price',s.price,
    'new_price',p_new,'stale_orders',0,'price_changed',(p_new<>s.price),'source','MARKET_NEWS');
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__pricing_signal(
  p_security integer,
  p_side text DEFAULT NULL,
  p_quantity integer DEFAULT 0,
  p_news_pct numeric DEFAULT NULL
) RETURNS numeric LANGUAGE plpgsql STABLE AS $function$
DECLARE
  v_event public.jse_events%ROWTYPE;
  s public.securities%ROWTYPE;
  v_method text;
  v_cfg jsonb;
  v_enabled jsonb;
  v_weights jsonb;
  v_ref numeric;
  v_move_cap numeric := 3;
  v_event_cap numeric := 10;
  v_lookback integer;
  v_momentum numeric := 0;
  v_reversion numeric := 0;
  v_supply numeric := 0;
  v_sector numeric := 0;
  v_market numeric := 0;
  v_volatility numeric := 0;
  v_news numeric := 0;
  v_scenario numeric := 0;
  v_pressure numeric := 0;
  v_sign numeric := 0;
  v_signal numeric := 0;
  v_sum_weight numeric := 0;
  v_weight numeric;
  v_strength numeric;
BEGIN
  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1;
  IF v_event.id IS NULL THEN RETURN 0; END IF;
  v_method := coalesce(v_event.pricing_method,'NEWS_DRIVEN');
  v_cfg := coalesce(v_event.pricing_config,'{}'::jsonb);
  v_enabled := coalesce(v_cfg->'enabled_methods','{}'::jsonb);
  v_weights := coalesce(v_cfg->'hybrid_weights','{}'::jsonb);
  IF NOT coalesce((v_enabled->>v_method)::boolean,true) THEN RETURN 0; END IF;
  IF v_method='MANUAL' THEN RETURN 0; END IF;

  SELECT * INTO s FROM public.securities WHERE id=p_security;
  IF NOT FOUND OR s.price IS NULL OR s.price<=0 THEN RETURN 0; END IF;
  v_ref := greatest(0.01,coalesce(s.base_price,s.index_base_price,s.price));
  SELECT coalesce(max_price_move_pct,10) INTO v_event_cap FROM public.event_config WHERE id=1;
  v_move_cap := CASE WHEN p_news_pct IS NOT NULL
    THEN least(10,greatest(0.05,coalesce(v_event_cap,10)))
    ELSE least(10,greatest(0.05,coalesce(nullif(v_cfg->>'max_move_per_trade_pct','')::numeric,0.75))) END;
  v_lookback := least(20,greatest(2,coalesce(nullif(v_cfg->>'momentum_lookback','')::integer,5)));
  v_sign := CASE upper(coalesce(p_side,'')) WHEN 'BUY' THEN 1 WHEN 'SELL' THEN -1 ELSE sign(coalesce(p_news_pct,0)) END;

  SELECT coalesce(avg(change_pct),0),coalesce(stddev_samp(change_pct),0)
    INTO v_momentum,v_volatility
  FROM (
    SELECT change_pct FROM public.price_history
    WHERE security_id=s.id AND change_pct IS NOT NULL
    ORDER BY created_at DESC,id DESC LIMIT v_lookback
  ) recent;
  v_momentum := greatest(-3,least(3,v_momentum));
  v_volatility := least(4,greatest(0,v_volatility));

  v_reversion := ((v_ref-s.price)*100/nullif(v_ref,0))
    * least(0.50,greatest(0,coalesce(nullif(v_cfg->>'mean_reversion_strength','')::numeric,0.12)));
  v_reversion := greatest(-v_move_cap,least(v_move_cap,v_reversion));

  IF p_quantity>0 THEN
    v_pressure := least(1.0,p_quantity::numeric/greatest(
      coalesce(s.traded_quantity::numeric/nullif(s.trade_count,0),p_quantity::numeric)*2,100.0
    ));
  END IF;
  v_supply := v_sign * v_pressure
    * least(3,greatest(0,coalesce(nullif(v_cfg->>'supply_demand_strength','')::numeric,0.75)));

  SELECT coalesce(avg((price-coalesce(base_price,index_base_price,price))*100/
           nullif(coalesce(base_price,index_base_price,price),0)),0)
    INTO v_sector
  FROM public.securities
  WHERE active AND id<>s.id AND sector IS NOT NULL AND sector=s.sector
    AND (kind='EQUITY' OR listed_at IS NOT NULL);

  SELECT coalesce(avg((price-coalesce(base_price,index_base_price,price))*100/
           nullif(coalesce(base_price,index_base_price,price),0)),0)
    INTO v_market
  FROM public.securities
  WHERE active AND (kind='EQUITY' OR listed_at IS NOT NULL);

  SELECT coalesce(avg(applied_pct),0) INTO v_news
  FROM (
    SELECT applied_pct FROM public.market_news
    WHERE security_id=s.id AND reversed_at IS NULL
    ORDER BY created_at DESC,id DESC LIMIT 5
  ) news_recent;
  v_news := coalesce(p_news_pct,v_news);
  v_scenario := CASE upper(coalesce(v_cfg->>'scenario','SIDEWAYS'))
    WHEN 'BULL' THEN 0.30
    WHEN 'RALLY' THEN 0.65
    WHEN 'BEAR' THEN -0.30
    WHEN 'CRASH' THEN -0.85
    ELSE 0
  END;

  IF v_method='NEWS_DRIVEN' THEN
    v_signal := coalesce(p_news_pct,0);
  ELSIF v_method='MOMENTUM' THEN
    v_signal := v_momentum * 0.65 + v_sign * v_pressure * 0.55;
  ELSIF v_method='MEAN_REVERSION' THEN
    v_signal := v_reversion + v_sign * v_pressure * 0.10;
  ELSIF v_method='SUPPLY_DEMAND' THEN
    v_signal := v_supply;
  ELSIF v_method='SECTOR_INDEX' THEN
    v_signal := v_sector * 0.40 + v_market * 0.20 + v_sign * v_pressure * 0.15;
  ELSIF v_method='VOLATILITY' THEN
    v_signal := v_sign * greatest(0.15,v_volatility)
      * least(3,greatest(0,coalesce(nullif(v_cfg->>'volatility_multiplier','')::numeric,0.45)));
  ELSIF v_method='SCENARIO' THEN
    v_signal := v_scenario + v_sign * v_pressure * 0.10;
  ELSIF v_method='HYBRID' THEN
    IF coalesce((v_enabled->>'NEWS_DRIVEN')::boolean,true) AND coalesce(nullif(v_weights->>'NEWS_DRIVEN','')::numeric,40)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'NEWS_DRIVEN','')::numeric,40);
      v_signal:=v_signal+v_news*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'MOMENTUM')::boolean,true) AND coalesce(nullif(v_weights->>'MOMENTUM','')::numeric,20)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'MOMENTUM','')::numeric,20);
      v_signal:=v_signal+(v_momentum*0.65+v_sign*v_pressure*0.55)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'MEAN_REVERSION')::boolean,true) AND coalesce(nullif(v_weights->>'MEAN_REVERSION','')::numeric,15)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'MEAN_REVERSION','')::numeric,15);
      v_signal:=v_signal+(v_reversion+v_sign*v_pressure*0.10)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'SUPPLY_DEMAND')::boolean,true) AND coalesce(nullif(v_weights->>'SUPPLY_DEMAND','')::numeric,15)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'SUPPLY_DEMAND','')::numeric,15);
      v_signal:=v_signal+v_supply*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'SECTOR_INDEX')::boolean,true) AND coalesce(nullif(v_weights->>'SECTOR_INDEX','')::numeric,5)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'SECTOR_INDEX','')::numeric,5);
      v_signal:=v_signal+(v_sector*0.40+v_market*0.20+v_sign*v_pressure*0.15)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'VOLATILITY')::boolean,true) AND coalesce(nullif(v_weights->>'VOLATILITY','')::numeric,5)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'VOLATILITY','')::numeric,5);
      v_signal:=v_signal+(v_sign*greatest(0.15,v_volatility)
        *least(3,greatest(0,coalesce(nullif(v_cfg->>'volatility_multiplier','')::numeric,0.45))))*v_weight;
      v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF coalesce((v_enabled->>'SCENARIO')::boolean,true) AND coalesce(nullif(v_weights->>'SCENARIO','')::numeric,0)>0 THEN
      v_weight:=coalesce(nullif(v_weights->>'SCENARIO','')::numeric,0);
      v_signal:=v_signal+(v_scenario+v_sign*v_pressure*0.10)*v_weight; v_sum_weight:=v_sum_weight+v_weight;
    END IF;
    IF v_sum_weight>0 THEN v_signal:=v_signal/v_sum_weight; ELSE v_signal:=0; END IF;
  END IF;

  RETURN greatest(-v_move_cap,least(v_move_cap,coalesce(v_signal,0)));
END
$function$;

CREATE OR REPLACE FUNCTION public.jse__auto_price_after_trade(
  a jsonb,p_security integer,p_side text,p_quantity integer,p_trade_value numeric,p_order_id bigint,p_settlement_id bigint
) RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  e public.jse_events%ROWTYPE;
  cfg public.event_config%ROWTYPE;
  s public.securities%ROWTYPE;
  peer public.securities%ROWTYPE;
  v_pct numeric;
  v_new numeric;
  v_floor numeric;
  v_ceiling numeric;
  v_peer_new numeric;
  v_peer_cap numeric;
  v_tick numeric;
  v_applied numeric;
  v_link numeric;
  v_changed integer:=0;
BEGIN
  SELECT * INTO e FROM public.jse_events WHERE is_active LIMIT 1;
  IF e.id IS NULL OR NOT e.pricing_enabled THEN RETURN jsonb_build_object('changed',false,'reason','ENGINE_DISABLED'); END IF;
  IF NOT coalesce((e.pricing_config->>'apply_on_trades')::boolean,true) THEN RETURN jsonb_build_object('changed',false,'reason','TRADE_AUTOPRICE_DISABLED'); END IF;
  IF NOT coalesce((e.pricing_config->'enabled_methods'->>e.pricing_method)::boolean,true) THEN
    RETURN jsonb_build_object('changed',false,'reason','METHOD_DISABLED');
  END IF;
  IF e.pricing_method IN ('MANUAL','NEWS_DRIVEN') THEN
    RETURN jsonb_build_object('changed',false,'reason','METHOD_IS_NOT_TRADE_DRIVEN');
  END IF;
  SELECT * INTO cfg FROM public.event_config WHERE id=1;
  SELECT * INTO s FROM public.securities WHERE id=p_security FOR UPDATE;
  IF NOT FOUND OR NOT s.active OR s.price<=0 THEN RETURN jsonb_build_object('changed',false,'reason','SECURITY_UNAVAILABLE'); END IF;

  v_pct := public.jse__pricing_signal(s.id,p_side,p_quantity,NULL);
  v_pct := greatest(-least(cfg.max_price_move_pct,coalesce(nullif(e.pricing_config->>'max_move_per_trade_pct','')::numeric,0.75)),
                    least(least(cfg.max_price_move_pct,coalesce(nullif(e.pricing_config->>'max_move_per_trade_pct','')::numeric,0.75)),v_pct));
  v_tick:=greatest(0.01,coalesce(cfg.price_tick,1));
  v_floor:=ceil(coalesce(s.base_price,s.price)*(1-cfg.max_price_move_pct/100)/v_tick)*v_tick;
  v_ceiling:=floor(coalesce(s.base_price,s.price)*(1+cfg.max_price_move_pct/100)/v_tick)*v_tick;
  v_new:=public.jse_round_tick(s.price*(1+v_pct/100),v_tick);
  v_new:=greatest(v_floor,least(v_ceiling,v_new));
  IF v_new<=0 OR v_new=s.price THEN RETURN jsonb_build_object('changed',false,'reason','NO_EFFECT','price',s.price); END IF;

  v_applied:=public.jse_pct(v_new,s.price);
  UPDATE public.securities SET previous_price=price,price=v_new,updated_at=now(),last_price_change_at=clock_timestamp()
    WHERE id=s.id;
  INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source,order_id,settlement_id)
    VALUES(s.id,s.price,v_new,v_applied,'AUTO_'||e.pricing_method,p_order_id,p_settlement_id);
  UPDATE public.event_control SET market_updated_at=now() WHERE id=1;
  PERFORM public.jse_audit(
    a,'AUTO_PRICE_MOVE','security',s.symbol,NULL,p_order_id,
    jsonb_build_object('price',s.price),
    jsonb_build_object('price',v_new),
    jsonb_build_object('method',e.pricing_method,'side',p_side,'quantity',p_quantity,'trade_value',p_trade_value,
      'change_pct',v_applied,'settlement_id',p_settlement_id,'stale_orders_rejected',0)
  );
  v_changed:=v_changed+1;

  -- Sector/index-linked mode also reprices peers using a bounded fraction of the leader's move.
  IF e.pricing_method='SECTOR_INDEX' AND nullif(trim(coalesce(s.sector,'')),'') IS NOT NULL THEN
    v_link:=least(0.75,greatest(0,coalesce(nullif(e.pricing_config->>'sector_link_strength','')::numeric,0.35)));
    FOR peer IN
      SELECT * FROM public.securities
      WHERE id<>s.id AND active AND sector=s.sector AND base_price>0
        AND (kind='EQUITY' OR listed_at IS NOT NULL)
      ORDER BY id
      FOR UPDATE
    LOOP
      v_peer_cap:=least(cfg.max_price_move_pct,coalesce(nullif(e.pricing_config->>'max_move_per_trade_pct','')::numeric,0.75));
      v_peer_new:=public.jse_round_tick(peer.price*(1+v_applied*v_link/100),v_tick);
      v_peer_new:=greatest(
        ceil(peer.base_price*(1-cfg.max_price_move_pct/100)/v_tick)*v_tick,
        least(floor(peer.base_price*(1+cfg.max_price_move_pct/100)/v_tick)*v_tick,v_peer_new)
      );
      IF v_peer_new IS NOT NULL AND v_peer_new>0 AND v_peer_new<>peer.price THEN
        UPDATE public.securities SET previous_price=price,price=v_peer_new,updated_at=now(),last_price_change_at=clock_timestamp()
          WHERE id=peer.id;
        INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source,order_id,settlement_id)
          VALUES(peer.id,peer.price,v_peer_new,public.jse_pct(v_peer_new,peer.price),'AUTO_SECTOR_LINK',p_order_id,p_settlement_id);
        PERFORM public.jse_audit(
          a,'AUTO_SECTOR_LINK_MOVE','security',peer.symbol,NULL,p_order_id,
          jsonb_build_object('price',peer.price),
          jsonb_build_object('price',v_peer_new),
          jsonb_build_object('source_symbol',s.symbol,'sector',s.sector,'correlation',v_link,'settlement_id',p_settlement_id,'stale_orders_rejected',0)
        );
        v_changed:=v_changed+1;
      END IF;
    END LOOP;
  END IF;
  RETURN jsonb_build_object('changed',v_changed>0,'change_count',v_changed,'method',e.pricing_method,
    'symbol',s.symbol,'previous_price',s.price,'new_price',v_new,'applied_pct',v_applied,'stale_orders_rejected',0);
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_pricing_method(a jsonb,p jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_action text:=upper(coalesce(p->>'action','STATE'));
  v_method text:=upper(trim(coalesce(p->>'method','')));
  v_enabled boolean;
  v_config jsonb;
  v_before jsonb;
  v_after jsonb;
  v_event public.jse_events%ROWTYPE;
  v_cfg public.event_config%ROWTYPE;
  v_max numeric;
  v_weight_sum numeric;
BEGIN
  IF v_action='STATE' THEN
    PERFORM public.jse_require_role(a,'ADMIN','VIEWER');
    SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1;
    RETURN jsonb_build_object('success',true,'event_id',v_event.id,'event_name',v_event.event_name,
      'method',coalesce(v_event.pricing_method,'NEWS_DRIVEN'),'pricing_enabled',coalesce(v_event.pricing_enabled,true),
      'config',coalesce(v_event.pricing_config,'{}'::jsonb));
  END IF;
  IF v_action NOT IN ('SET','CONFIGURE','APPLY') THEN
    PERFORM public.jse_fail('INVALID_ACTION','Use STATE, SET or CONFIGURE.',400);
  END IF;
  PERFORM public.jse_require_role(a,'ADMIN');
  PERFORM public.jse_require_admin_password(a,p);
  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1 FOR UPDATE;
  IF v_event.id IS NULL THEN PERFORM public.jse_fail('ACTIVE_EVENT_REQUIRED','Activate an event before configuring pricing.',409); END IF;
  SELECT * INTO v_cfg FROM public.event_config WHERE id=1;

  v_method:=coalesce(nullif(v_method,''),v_event.pricing_method,'NEWS_DRIVEN');
  IF v_method NOT IN ('MANUAL','NEWS_DRIVEN','MOMENTUM','MEAN_REVERSION','SUPPLY_DEMAND','SECTOR_INDEX','VOLATILITY','HYBRID','SCENARIO') THEN
    PERFORM public.jse_fail('INVALID_PRICING_METHOD','Select one of the nine available pricing methods.',400);
  END IF;
  v_enabled:=coalesce((p->>'pricing_enabled')::boolean,v_event.pricing_enabled,true);
  v_config:=coalesce(p->'config',v_event.pricing_config,'{}'::jsonb);
  IF jsonb_typeof(v_config)<>'object' THEN PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Pricing configuration must be an object.',400); END IF;
  v_config:='{
      "enabled_methods":{"MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,"SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true},
      "apply_on_trades":true,"apply_on_news":true,"max_move_per_trade_pct":0.75,
      "momentum_lookback":5,"mean_reversion_strength":0.12,"supply_demand_strength":0.75,
      "sector_link_strength":0.35,"volatility_multiplier":0.45,"scenario":"SIDEWAYS",
      "hybrid_weights":{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}
    }'::jsonb || v_config;
  v_config:=jsonb_set(v_config,'{enabled_methods}',
    '{
      "MANUAL":true,"NEWS_DRIVEN":true,"MOMENTUM":true,"MEAN_REVERSION":true,"SUPPLY_DEMAND":true,
      "SECTOR_INDEX":true,"VOLATILITY":true,"HYBRID":true,"SCENARIO":true
    }'::jsonb || coalesce(v_config->'enabled_methods','{}'::jsonb),true);
  v_config:=jsonb_set(v_config,'{hybrid_weights}',
    '{"NEWS_DRIVEN":40,"MOMENTUM":20,"MEAN_REVERSION":15,"SUPPLY_DEMAND":15,"SECTOR_INDEX":5,"VOLATILITY":5,"SCENARIO":0}'::jsonb || coalesce(v_config->'hybrid_weights','{}'::jsonb),true);
  IF NOT coalesce((v_config->'enabled_methods'->>v_method)::boolean,true) THEN
    PERFORM public.jse_fail('PRICING_METHOD_DISABLED','Enable the selected method before applying it.',409);
  END IF;

  BEGIN
    v_max:=coalesce(nullif(v_config->>'max_move_per_trade_pct','')::numeric,0.75);
    IF v_max<0.05 OR v_max>least(10,v_cfg.max_price_move_pct) THEN
      PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Per-trade movement must be at least 0.05% and no higher than the market movement cap.',400);
    END IF;
    IF coalesce(nullif(v_config->>'momentum_lookback','')::integer,5) NOT BETWEEN 2 AND 20 THEN
      PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Momentum lookback must be from 2 to 20 price changes.',400);
    END IF;
    IF coalesce(nullif(v_config->>'mean_reversion_strength','')::numeric,0.12) NOT BETWEEN 0 AND 0.5
      OR coalesce(nullif(v_config->>'supply_demand_strength','')::numeric,0.75) NOT BETWEEN 0 AND 3
      OR coalesce(nullif(v_config->>'sector_link_strength','')::numeric,0.35) NOT BETWEEN 0 AND 0.75
      OR coalesce(nullif(v_config->>'volatility_multiplier','')::numeric,0.45) NOT BETWEEN 0 AND 3 THEN
      PERFORM public.jse_fail('INVALID_PRICING_CONFIG','One of the pricing strategy strengths is outside its allowed range.',400);
    END IF;
    IF upper(coalesce(v_config->>'scenario','SIDEWAYS')) NOT IN ('SIDEWAYS','BULL','BEAR','CRASH','RALLY') THEN
      PERFORM public.jse_fail('INVALID_SCENARIO','Choose Sideways, Bull, Bear, Crash or Rally.',400);
    END IF;
    SELECT sum(value::numeric) INTO v_weight_sum FROM jsonb_each_text(v_config->'hybrid_weights') x(key,value);
    IF coalesce(v_weight_sum,0)<=0 THEN PERFORM public.jse_fail('INVALID_HYBRID_WEIGHTS','Hybrid needs at least one positive component weight.',400); END IF;
  EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
    PERFORM public.jse_fail('INVALID_PRICING_CONFIG','Pricing settings contain an invalid number.',400);
  END;

  SELECT jsonb_build_object('pricing_method',pricing_method,'pricing_enabled',pricing_enabled,
      'pricing_config',pricing_config) INTO v_before
    FROM public.jse_events WHERE id=v_event.id;
  IF v_action='SET' THEN
    UPDATE public.jse_events SET pricing_method=v_method,updated_at=now() WHERE id=v_event.id;
  ELSE
    UPDATE public.jse_events SET pricing_method=v_method,pricing_enabled=v_enabled,pricing_config=v_config,updated_at=now()
      WHERE id=v_event.id;
  END IF;
  SELECT jsonb_build_object('pricing_method',pricing_method,'pricing_enabled',pricing_enabled,
      'pricing_config',pricing_config) INTO v_after
    FROM public.jse_events WHERE id=v_event.id;
  IF v_before IS DISTINCT FROM v_after THEN
    PERFORM public.jse_audit(a,'PRICING_CONTROL_UPDATED','event',v_event.id::text,NULL,NULL,v_before,v_after,
      jsonb_build_object('event_name',v_event.event_name,'method',v_method,'pricing_enabled',v_enabled));
  END IF;
  RETURN jsonb_build_object('success',true,'event_id',v_event.id,'event_name',v_event.event_name,
    'method',v_method,'pricing_enabled',v_enabled,'config',v_config,'message','Pricing control saved for this event.');
END
$function$;

CREATE OR REPLACE FUNCTION public.jse_manual_set_market_price(a jsonb,p jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
  v_symbol text:=upper(trim(coalesce(p->>'symbol','')));
  v_security integer;
  v_price numeric;
  s public.securities%ROWTYPE;
  v_cfg public.event_config%ROWTYPE;
  v_event public.jse_events%ROWTYPE;
  v_floor numeric;
  v_ceiling numeric;
  v_tick numeric;
BEGIN
  PERFORM public.jse_require_role(a,'ADMIN');
  PERFORM public.jse_require_admin_password(a,p);
  BEGIN
    v_security:=nullif(p->>'security_id','')::integer;
    v_price:=nullif(p->>'price','')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM public.jse_fail('INVALID_MANUAL_PRICE','Select a security and enter a whole-number price.',400);
  END;
  IF v_price IS NULL OR v_price<=0 OR v_price<>trunc(v_price) THEN
    PERFORM public.jse_fail('INVALID_MANUAL_PRICE','Share price must be a positive whole number without decimals.',400);
  END IF;
  SELECT * INTO v_event FROM public.jse_events WHERE is_active LIMIT 1 FOR UPDATE;
  IF v_event.id IS NULL THEN PERFORM public.jse_fail('ACTIVE_EVENT_REQUIRED','Activate an event before setting its price.',409); END IF;
  IF v_event.pricing_method<>'MANUAL' THEN
    PERFORM public.jse_fail('MANUAL_MODE_REQUIRED','Select Manual pricing as the active method before setting a share price.',409);
  END IF;
  SELECT * INTO v_cfg FROM public.event_config WHERE id=1;
  SELECT * INTO s FROM public.securities
    WHERE (v_security IS NOT NULL AND id=v_security) OR (v_symbol<>'' AND symbol=v_symbol)
    FOR UPDATE;
  IF NOT FOUND THEN PERFORM public.jse_fail('SECURITY_NOT_FOUND','Select a valid security.',404); END IF;
  IF NOT s.active OR (s.kind='IPO' AND s.listed_at IS NULL) THEN
    PERFORM public.jse_fail('SECURITY_NOT_TRADABLE','Only active and listed securities can be manually repriced.',409);
  END IF;
  v_tick:=greatest(0.01,coalesce(v_cfg.price_tick,1));
  v_floor:=ceil(coalesce(s.base_price,s.price)*(1-v_cfg.max_price_move_pct/100)/v_tick)*v_tick;
  v_ceiling:=floor(coalesce(s.base_price,s.price)*(1+v_cfg.max_price_move_pct/100)/v_tick)*v_tick;
  IF v_price<v_floor OR v_price>v_ceiling THEN
    PERFORM public.jse_fail('MANUAL_PRICE_OUT_OF_BAND','Price must stay inside the configured base-price movement band ('||
      round(v_floor)::text||' to '||round(v_ceiling)::text||').',409);
  END IF;
  IF v_price=s.price THEN
    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'name',s.name,'previous_price',s.price,'new_price',s.price,
      'changed',false,'stale_orders_rejected',0,'message','The share price is already at that value.');
  END IF;
  UPDATE public.securities SET previous_price=price,price=v_price,updated_at=now(),last_price_change_at=clock_timestamp()
    WHERE id=s.id;
  INSERT INTO public.price_history(security_id,previous_price,new_price,change_pct,source)
    VALUES(s.id,s.price,v_price,public.jse_pct(v_price,s.price),'ADMIN_MANUAL_PRICE');
  UPDATE public.event_control SET market_updated_at=now() WHERE id=1;
  PERFORM public.jse_audit(a,'MANUAL_PRICE_CHANGED','security',s.symbol,NULL,NULL,
    jsonb_build_object('price',s.price),jsonb_build_object('price',v_price),
    jsonb_build_object('event_name',v_event.event_name,'movement_pct',public.jse_pct(v_price,s.price),'stale_orders_rejected',0));
  RETURN jsonb_build_object('success',true,'symbol',s.symbol,'name',s.name,'previous_price',s.price,'new_price',v_price,
    'changed',true,'stale_orders_rejected',0,'message',s.symbol||' price updated to '||round(v_price)::text||'. Pending orders were not rejected.');
END
$function$;

-- Integrate automatic repricing into completed trades. Price discovery changes the next quote only;
-- the settled transaction keeps its original entered execution price and no open orders are rejected.
-- Remove the stale-quote rejection branch: an order settles at its accepted entered price.
-- Price discovery always changes the next quote, never re-prices or rejects existing orders.
DO $patch_entered_price$
DECLARE
  v_fn text;
  v_start integer;
  v_end integer;
  v_marker text := '  IF jse_price_out_of_band(o.price, s.price) AND p_source = ''BANK'' THEN';
  v_end_marker text := '  IF NOT t.active THEN';
BEGIN
  v_fn:=pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  -- Migration 034 already disabled this branch on some environments; keep that safe no-op.
  IF position('/* PRICE_STALE_DISABLED */ false THEN' IN v_fn)>0 THEN RETURN; END IF;
  v_start:=position(v_marker IN v_fn);
  v_end:=position(v_end_marker IN v_fn);
  IF v_start=0 THEN
    IF position('jse_price_out_of_band(o.price, s.price)' IN v_fn)=0 THEN RETURN; END IF;
    RAISE EXCEPTION '037: unable to safely locate the active settlement stale-price block';
  END IF;
  IF v_end<=v_start THEN RAISE EXCEPTION '037: unable to locate the end of the settlement stale-price block'; END IF;
  v_fn:=substr(v_fn,1,v_start-1)||
    '  -- Accepted order price is authoritative; a later quote change does not reject this trade.'||chr(10)||'  '||
    substr(v_fn,v_end);
  EXECUTE v_fn;
END
$patch_entered_price$;

DO $patch_settlement$
DECLARE
  v_fn text;
  v_old text := $old$  -- trade statistics only: settlement never changes the market price (Market News is the only price engine)
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;$old$;
  v_new text := $new$  -- record trading activity, then let the active event's selected model move the next market quote.
  UPDATE securities SET trade_count = trade_count + 1, traded_quantity = traded_quantity + o.quantity, traded_value = traded_value + v_tv,
         last_trade_at = now() WHERE id = s.id;
  PERFORM public.jse__auto_price_after_trade(
    a,s.id,CASE WHEN v_team_buys THEN 'BUY' ELSE 'SELL' END,o.quantity,v_tv,o.id,v_settle_id
  );$new$;
BEGIN
  v_fn:=pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  IF position('jse__auto_price_after_trade' IN v_fn)>0 THEN RETURN; END IF;
  IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '037: could not find safe settlement price-discovery insertion point'; END IF;
  EXECUTE replace(v_fn,v_old,v_new);
END
$patch_settlement$;

-- Route Market News through the selected strategy. Non-news strategies still record the news item,
-- but don't silently apply the news-driven price model in parallel.
DO $patch_market_news$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
  v_decl_old text := 'v_band_base numeric; v_daily_cap constant numeric := 15;';
  v_decl_new text := 'v_band_base numeric; v_daily_cap numeric; v_method text; v_pricing_enabled boolean; v_pricing_config jsonb;';
  v_cfg_old text := '  SELECT * INTO cfg FROM event_config WHERE id = 1;';
  v_cfg_new text := '  SELECT * INTO cfg FROM event_config WHERE id = 1;
  v_daily_cap := least(15::numeric, cfg.max_price_move_pct);';
BEGIN
  v_fn:=pg_get_functiondef('public.jse_market_news(jsonb,jsonb)'::regprocedure);
  IF position('jse__record_news_no_price' IN v_fn)>0 THEN RETURN; END IF;
  IF position(v_decl_old IN v_fn)=0 THEN RAISE EXCEPTION '037: Market News declaration patch anchor not found'; END IF;
  v_fn:=replace(v_fn,v_decl_old,v_decl_new);
  IF position(v_cfg_old IN v_fn)=0 THEN RAISE EXCEPTION '037: Market News config patch anchor not found'; END IF;
  v_fn:=replace(v_fn,v_cfg_old,v_cfg_new);
  v_old := $old$  RETURN jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));$old$;
  v_new := $new$  SELECT pricing_method,pricing_enabled,pricing_config
    INTO v_method,v_pricing_enabled,v_pricing_config
    FROM public.jse_events WHERE is_active LIMIT 1;
  IF coalesce(v_method,'NEWS_DRIVEN') NOT IN ('NEWS_DRIVEN','HYBRID')
     OR NOT coalesce(v_pricing_enabled,true)
     OR NOT coalesce((v_pricing_config->>'apply_on_news')::boolean,true)
     OR NOT coalesce((v_pricing_config->'enabled_methods'->>coalesce(v_method,'NEWS_DRIVEN'))::boolean,true) THEN
    RETURN public.jse__record_news_no_price(a,s,v_mood,v_pct,
      coalesce(v_headline,initcap(replace(v_mood,'_',' '))||' news on '||s.name));
  END IF;
  IF v_method='HYBRID' THEN
    v_pct:=public.jse__pricing_signal(s.id,NULL,0,v_pct);
    v_new:=public.jse_round_tick(s.price*(1+v_pct/100),cfg.price_tick);
    v_new:=greatest(v_lo,least(v_hi,v_new));
  END IF;
  RETURN public.jse__apply_news_price(a, s, v_mood, v_pct, v_new,
    coalesce(v_headline, initcap(replace(v_mood, '_', ' ')) || ' news on ' || s.name));$new$;
  IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '037: Market News return patch anchor not found'; END IF;
  EXECUTE replace(v_fn,v_old,v_new);
END
$patch_market_news$;

INSERT INTO public.schema_migrations(version) VALUES ('037_advanced_pricing_engine')
ON CONFLICT (version) DO NOTHING;
