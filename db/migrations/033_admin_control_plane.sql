-- 033: admin control-plane settings, configurable regular lots/order quantity and configurable price spread/band.
-- Additive only: preserves existing cash, holdings, orders, settlements, ledgers, price history and audit rows.
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS allow_short_selling boolean NOT NULL DEFAULT false;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS institutional_spread_pct numeric(6,2) NOT NULL DEFAULT 0;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS max_order_quantity integer NOT NULL DEFAULT 250000;
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS max_order_price_deviation_pct numeric(6,2) NOT NULL DEFAULT 15;

DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_config_institutional_spread_range') THEN
    ALTER TABLE event_config ADD CONSTRAINT event_config_institutional_spread_range CHECK (institutional_spread_pct >= 0 AND institutional_spread_pct <= 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_config_max_order_quantity_positive') THEN
    ALTER TABLE event_config ADD CONSTRAINT event_config_max_order_quantity_positive CHECK (max_order_quantity > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_config_order_deviation_range') THEN
    ALTER TABLE event_config ADD CONSTRAINT event_config_order_deviation_range CHECK (max_order_price_deviation_pct > 0 AND max_order_price_deviation_pct <= 15);
  END IF;
END
$constraints$;

CREATE OR REPLACE FUNCTION jse_inst_spread_pct() RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT institutional_spread_pct FROM event_config WHERE id=1
$$;

CREATE OR REPLACE FUNCTION jse_inst_price(p_market numeric, p_inst_side text) RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT round(p_market * (1 + CASE WHEN p_inst_side='SELL' THEN 1 ELSE -1 END * jse_inst_spread_pct() / 100), 2)
$$;

CREATE OR REPLACE FUNCTION jse_price_deviation_pct() RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT max_order_price_deviation_pct FROM event_config WHERE id=1
$$;

CREATE OR REPLACE FUNCTION jse_price_out_of_band(p_order_price numeric, p_market numeric) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT p_market IS NULL OR p_market <= 0
      OR abs(p_order_price-p_market) > p_market * jse_price_deviation_pct() / 100
$$;

-- A real short-selling configuration key exists, but turning it ON is refused until
-- short liability, collateral, covering, valuation, reconciliation and undo/redo are implemented.
-- The engine still has a non-negative holdings constraint and must not silently bypass it.
CREATE OR REPLACE FUNCTION jse_update_config(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  before jsonb; after jsonb; v_status text; cfg event_config%ROWTYPE;
  v_brk numeric; v_loan numeric; v_start timestamptz; v_max numeric; v_min numeric; v_move numeric;
  v_lot integer; v_qty integer; v_company numeric; v_spread numeric; v_deviation numeric;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  PERFORM jse_require_admin_password(a, p);
  SELECT status INTO v_status FROM event_control WHERE id=1;
  SELECT * INTO cfg FROM event_config WHERE id=1;
  SELECT to_jsonb(c)-'updated_at' INTO before FROM event_config c WHERE id=1;
  BEGIN
    v_brk := coalesce(nullif(p->>'brokerage_rate_pct','')::numeric/100, nullif(p->>'brokerage_rate','')::numeric);
    v_loan := coalesce(nullif(p->>'loan_interest_rate_pct','')::numeric/100, nullif(p->>'loan_interest_rate','')::numeric);
    v_start := nullif(p->>'event_start_at','')::timestamptz;
    v_max := nullif(p->>'max_order_value','')::numeric;
    v_min := nullif(p->>'min_order_value','')::numeric;
    v_move := nullif(p->>'max_price_move_pct','')::numeric;
    v_lot := nullif(p->>'stock_lot_size','')::integer;
    v_qty := nullif(p->>'max_order_quantity','')::integer;
    v_company := nullif(p->>'max_company_pct','')::numeric;
    v_spread := nullif(p->>'institutional_spread_pct','')::numeric;
    v_deviation := nullif(p->>'max_order_price_deviation_pct','')::numeric;
  EXCEPTION WHEN others THEN
    PERFORM jse_fail('INVALID_CONFIG','One of the values is not a valid number or date.',400);
  END;

  IF v_status<>'NOT_STARTED' AND (
      (p ? 'initial_capital' AND nullif(p->>'initial_capital','')::numeric IS DISTINCT FROM cfg.initial_capital)
   OR (p ? 'institutional_cash' AND nullif(p->>'institutional_cash','')::numeric IS DISTINCT FROM cfg.institutional_cash)
   OR (p ? 'stock_lot_size' AND nullif(p->>'stock_lot_size','')::integer IS DISTINCT FROM cfg.stock_lot_size)
  ) THEN
    PERFORM jse_fail('EVENT_STARTED','Starting capital and regular trading lot size can only be changed before the event starts; reset only after reviewing event implications.',409);
  END IF;
  IF v_brk IS NOT NULL AND (v_brk<0 OR v_brk>=1) THEN PERFORM jse_fail('INVALID_CONFIG','Brokerage must be between 0% and 100%.',400); END IF;
  IF v_loan IS NOT NULL AND (v_loan<0 OR v_loan>=1) THEN PERFORM jse_fail('INVALID_CONFIG','Loan interest must be between 0% and 100%.',400); END IF;
  IF v_move IS NOT NULL AND (v_move<=0 OR v_move>10) THEN PERFORM jse_fail('INVALID_CONFIG','Maximum Market News movement must be above 0% and at most 10%.',400); END IF;
  IF coalesce(v_min,cfg.min_order_value)>=coalesce(v_max,cfg.max_order_value) THEN PERFORM jse_fail('INVALID_CONFIG','Minimum order value must be lower than the maximum order value.',400); END IF;
  IF v_lot IS NOT NULL AND v_lot<=0 THEN PERFORM jse_fail('INVALID_CONFIG','Regular trading lot size must be a positive whole number.',400); END IF;
  IF v_qty IS NOT NULL AND v_qty<=0 THEN PERFORM jse_fail('INVALID_CONFIG','Maximum order quantity must be a positive whole number.',400); END IF;
  IF v_company IS NOT NULL AND (v_company<0 OR v_company>100) THEN PERFORM jse_fail('INVALID_CONFIG','Maximum company exposure must be between 0% and 100%; 0 disables this cap.',400); END IF;
  IF v_spread IS NOT NULL AND (v_spread<0 OR v_spread>10) THEN PERFORM jse_fail('INVALID_CONFIG','Institutional spread must be between 0% and 10%.',400); END IF;
  IF v_deviation IS NOT NULL AND (v_deviation<=0 OR v_deviation>15) THEN PERFORM jse_fail('INVALID_CONFIG','Maximum order price deviation must be above 0% and at most 15%.',400); END IF;
  IF coalesce((p->>'allow_short_selling')::boolean,false) THEN
    PERFORM jse_fail('SHORT_SELLING_UNAVAILABLE','Allow Short Selling cannot be enabled yet: participant holdings must remain non-negative, and the current system does not have a short-liability, collateral, covering and reversal ledger. Keep the setting OFF.',409);
  END IF;

  UPDATE event_config SET
    event_name = coalesce(nullif(trim(p->>'event_name'),''),event_name),
    event_start_at = coalesce(v_start,event_start_at),
    initial_capital = coalesce(nullif(p->>'initial_capital','')::numeric,initial_capital),
    institutional_cash = coalesce(nullif(p->>'institutional_cash','')::numeric,institutional_cash),
    brokerage_rate = coalesce(v_brk,brokerage_rate),
    stock_lot_size = coalesce(v_lot,stock_lot_size),
    max_order_quantity = coalesce(v_qty,max_order_quantity),
    max_order_price_deviation_pct = coalesce(v_deviation,max_order_price_deviation_pct),
    institutional_spread_pct = coalesce(v_spread,institutional_spread_pct),
    max_company_pct = coalesce(v_company,max_company_pct),
    max_price_move_pct = coalesce(v_move,max_price_move_pct),
    min_order_value = coalesce(v_min,min_order_value),
    max_order_value = coalesce(v_max,max_order_value),
    loan_max_principal = coalesce(nullif(p->>'loan_max_principal','')::numeric,loan_max_principal),
    loan_interest_rate = coalesce(v_loan,loan_interest_rate),
    cash_rule_limit = coalesce(nullif(p->>'cash_rule_limit','')::numeric,cash_rule_limit),
    min_buy_trades = coalesce(nullif(p->>'min_buy_trades','')::integer,min_buy_trades),
    min_sell_trades = coalesce(nullif(p->>'min_sell_trades','')::integer,min_sell_trades),
    ipo_application_hours = coalesce(nullif(p->>'ipo_application_hours','')::numeric,ipo_application_hours),
    loans_enabled = coalesce((p->>'loans_enabled')::boolean,loans_enabled),
    auto_loan_on_settlement = coalesce((p->>'auto_loan_on_settlement')::boolean,auto_loan_on_settlement),
    loan_repayment_required = coalesce((p->>'loan_repayment_required')::boolean,loan_repayment_required),
    auto_list_ipos = coalesce((p->>'auto_list_ipos')::boolean,auto_list_ipos),
    allow_short_selling = false,
    min_cash_buffer = 0,
    participant_order_entry = false,
    updated_at = now(), updated_by = jse_actor_name(a)
  WHERE id=1;

  IF p ? 'institutional_cash' AND nullif(p->>'institutional_cash','') IS NOT NULL THEN
    UPDATE institutions SET initial_cash=(p->>'institutional_cash')::numeric;
  END IF;
  SELECT to_jsonb(c)-'updated_at' INTO after FROM event_config c WHERE id=1;
  PERFORM jse_audit(a,'CONFIGURATION_UPDATED','event_config','1',NULL,NULL,before,after,
    jsonb_build_object('changed',(SELECT coalesce(jsonb_agg(k),'[]'::jsonb) FROM jsonb_object_keys(after) k WHERE after->k IS DISTINCT FROM before->k AND k<>'updated_by')));
  RETURN jsonb_build_object('success',true,'config',after);
EXCEPTION WHEN check_violation OR invalid_text_representation OR numeric_value_out_of_range OR invalid_datetime_format THEN
  PERFORM jse_fail('INVALID_CONFIG','One of the values is not valid.',400);
  RETURN NULL;
END $$;

-- Replace the four hard-coded 50-share validations with the centrally configured regular lot,
-- then enforce the maximum share quantity before any reservation/order insert or settlement mutation.
DO $lot_guardrails$
DECLARE
  v_fn text;
  v_old text;
  v_new text;
BEGIN
  -- Broker/Pit order creation
  v_fn := pg_get_functiondef('public.jse_place_order(jsonb,jsonb)'::regprocedure);
  IF position('v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    IF position('v_qty % 50 <> 0' IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse_place_order'; END IF;
    v_fn := replace(v_fn,'v_qty % 50 <> 0','v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0');
    v_fn := replace(v_fn,'normal market trading uses multiples of 50 shares (50, 100, 150 …).','normal market trading must be a multiple of the configured regular lot size.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '  IF v_expected IS NOT NULL AND v_expected <> v_sec.price THEN';
    v_new := '  IF v_qty > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN PERFORM jse_fail(''ORDER_QUANTITY_LIMIT'',''Order exceeds the configured maximum share quantity per order.'',400); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse_place_order'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;

  -- Institutional orders
  v_fn := pg_get_functiondef('public.jse_place_institutional_order(jsonb,jsonb)'::regprocedure);
  IF position('v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    IF position('v_qty % 50 <> 0' IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse_place_institutional_order'; END IF;
    v_fn := replace(v_fn,'v_qty % 50 <> 0','v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0');
    v_fn := replace(v_fn,'normal market trading uses multiples of 50 shares.','normal market trading must be a multiple of the configured regular lot size.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '  -- expected_price = the prevailing MARKET price the desk saw (the institutional price is derived from it)';
    v_new := '  IF v_qty > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN PERFORM jse_fail(''ORDER_QUANTITY_LIMIT'',''Order exceeds the configured maximum share quantity per order.'',400); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse_place_institutional_order'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;

  -- Participant instructions use the same configured regular lot as the eventual order.
  -- Flexible IPO allotment lots do not change the lot for later market trades.
  v_fn := pg_get_functiondef('public.jse_instruction_action(jsonb,jsonb)'::regprocedure);
  IF position('v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    v_old := 'v_qty % s.lot_size <> 0 AND NOT (s.kind = ''IPO'' AND v_side = ''SELL'')';
    v_new := 'v_qty % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0';
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse_instruction_action'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
    v_fn := replace(v_fn,'Quantity must be a multiple of '' || s.lot_size || '' shares.','Quantity must be a multiple of '' || (SELECT stock_lot_size FROM event_config WHERE id=1) || '' shares.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '    SELECT count(*) INTO v_open FROM instructions WHERE team_id = t.id AND status = ''OPEN'';';
    v_new := '    IF v_qty > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN PERFORM jse_fail(''ORDER_QUANTITY_LIMIT'',''Instruction exceeds the configured maximum share quantity per order.'',400); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse_instruction_action'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;

  -- Bank settlement independently re-validates the same lot and maximum quantity.
  v_fn := pg_get_functiondef('public.jse__settle(jsonb,bigint,text)'::regprocedure);
  IF position('o.quantity % (SELECT stock_lot_size FROM event_config WHERE id=1)' IN v_fn)=0 THEN
    IF position('o.quantity % 50 <> 0' IN v_fn)=0 THEN RAISE EXCEPTION '033: regular lot validation anchor not found in jse__settle'; END IF;
    v_fn := replace(v_fn,'o.quantity % 50 <> 0','o.quantity % (SELECT stock_lot_size FROM event_config WHERE id=1) <> 0');
    v_fn := replace(v_fn,'Normal market trading requires a multiple of 50 shares.','Regular trading quantity must be a multiple of the configured lot size.');
  END IF;
  IF position('ORDER_QUANTITY_LIMIT' IN v_fn)=0 THEN
    v_old := '  IF o.price <= 0 THEN';
    v_new := '  IF o.quantity > (SELECT max_order_quantity FROM event_config WHERE id=1) THEN RETURN jse__bank_reject(a,o,''ORDER_QUANTITY_LIMIT'',''Order exceeds the configured maximum share quantity per order.'',''{}''::jsonb); END IF;' || chr(10) || v_old;
    IF position(v_old IN v_fn)=0 THEN RAISE EXCEPTION '033: quantity limit anchor not found in jse__settle'; END IF;
    v_fn := replace(v_fn,v_old,v_new);
  END IF;
  EXECUTE v_fn;
END
$lot_guardrails$;

INSERT INTO schema_migrations(version) VALUES ('033_admin_control_plane') ON CONFLICT DO NOTHING;
