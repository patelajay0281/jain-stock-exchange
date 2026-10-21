-- v272 targeted roster and IPO administration additions.
-- Additive only: preserve existing tables, data, routes and financial history.

ALTER TABLE securities ADD COLUMN IF NOT EXISTS ipo_lot_size integer NOT NULL DEFAULT 50 CHECK (ipo_lot_size > 0);

CREATE TABLE IF NOT EXISTS ipo_allotment_draws (
  id                 bigserial PRIMARY KEY,
  security_id        integer NOT NULL REFERENCES securities(id),
  status             text NOT NULL DEFAULT 'GENERATED'
                     CHECK (status IN ('GENERATED','VERIFIED','APPROVED','FINALIZED','CANCELLED')),
  available_shares   integer NOT NULL CHECK (available_shares >= 0),
  available_lots     integer NOT NULL CHECK (available_lots >= 0),
  requested_lots     integer NOT NULL DEFAULT 0 CHECK (requested_lots >= 0),
  subscription_ratio numeric(14,4),
  algorithm_version  text NOT NULL DEFAULT 'RANDOM_ROUND_ROBIN_V1',
  inventory_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_by       text,
  generated_at       timestamptz NOT NULL DEFAULT now(),
  verified_by        text,
  verified_at        timestamptz,
  approved_by        text,
  approved_at        timestamptz,
  finalized_by       text,
  finalized_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ipo_allotment_draws_security_idx ON ipo_allotment_draws(security_id, id DESC);

CREATE TABLE IF NOT EXISTS ipo_allotment_draw_items (
  id                 bigserial PRIMARY KEY,
  draw_id            bigint NOT NULL REFERENCES ipo_allotment_draws(id),
  application_id     bigint NOT NULL,
  team_id            integer NOT NULL REFERENCES teams(id),
  team_code          text NOT NULL,
  team_name          text NOT NULL,
  draw_position      integer NOT NULL CHECK (draw_position > 0),
  requested_lots     integer NOT NULL CHECK (requested_lots > 0),
  allotted_lots      integer NOT NULL DEFAULT 0 CHECK (allotted_lots >= 0 AND allotted_lots <= requested_lots),
  lot_size           integer NOT NULL CHECK (lot_size > 0),
  application_price  numeric(12,2) NOT NULL CHECK (application_price > 0),
  rounds             integer[] NOT NULL DEFAULT '{}',
  UNIQUE (draw_id, application_id),
  UNIQUE (draw_id, draw_position)
);
CREATE INDEX IF NOT EXISTS ipo_allotment_draw_items_order_idx ON ipo_allotment_draw_items(draw_id, draw_position);

-- Official Dalal Street broker aliases map the uploaded Broker Number/Code/Name to existing internal desks.
-- Internal BROKER-XX identifiers remain untouched, so logins and historical records are preserved.
CREATE TABLE IF NOT EXISTS broker_roster_aliases (
  broker_number       integer PRIMARY KEY CHECK (broker_number > 0),
  broker_code         text NOT NULL UNIQUE,
  broker_name         text NOT NULL,
  internal_broker_id  integer REFERENCES brokers(id)
);
INSERT INTO broker_roster_aliases(broker_number,broker_code,broker_name,internal_broker_id) VALUES
  (1,'Prajna','M Manoj',(SELECT id FROM brokers WHERE code='BROKER-09')),
  (2,'Ganita','Harsha G',(SELECT id FROM brokers WHERE code='BROKER-05')),
  (3,'Amrit','Nehaa',(SELECT id FROM brokers WHERE code='BROKER-04')),
  (4,'Vikas','Vikash',(SELECT id FROM brokers WHERE code='BROKER-01')),
  (5,'Yash','Gokul Krishna',(SELECT id FROM brokers WHERE code='BROKER-02')),
  (6,'Arohan','Aman',(SELECT id FROM brokers WHERE code='BROKER-06')),
  (7,'Madhava','Mayur G',(SELECT id FROM brokers WHERE code='BROKER-03')),
  (8,'Vidura','Bhavani Reddy',(SELECT id FROM brokers WHERE code='BROKER-07')),
  (9,'Kalidasa','Varun SB',(SELECT id FROM brokers WHERE code='BROKER-08')),
  (10,'Suvarna','Sujatha',(SELECT id FROM brokers WHERE code='BROKER-10'))
ON CONFLICT (broker_number) DO UPDATE SET
  broker_code=EXCLUDED.broker_code,
  broker_name=EXCLUDED.broker_name,
  internal_broker_id=coalesce(broker_roster_aliases.internal_broker_id,EXCLUDED.internal_broker_id);

-- Five-column roster importer. This only updates the canonical broker assignment on existing teams.
CREATE OR REPLACE FUNCTION jse_import_roster_assignments(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  r jsonb;
  x jsonb;
  v_i integer := 0;
  v_team_no integer;
  v_broker_no integer;
  v_team_code text;
  v_broker_code text;
  v_broker_name text;
  t teams%ROWTYPE;
  b brokers%ROWTYPE;
  v_alias broker_roster_aliases%ROWTYPE;
  v_plan jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_changed integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  -- Follow the existing team editor's policy: broker assignments can be changed without resetting team IDs or names.
  -- The import changes only teams.broker_id and never touches historical orders or financial records.
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
    PERFORM jse_fail('NO_ROWS', 'No roster rows were supplied.', 400);
  END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    BEGIN v_team_no := nullif(trim(r->>'team_number'), '')::integer; EXCEPTION WHEN others THEN v_team_no := NULL; END;
    BEGIN v_broker_no := nullif(trim(r->>'broker_number'), '')::integer; EXCEPTION WHEN others THEN v_broker_no := NULL; END;
    v_team_code := upper(trim(coalesce(r->>'team_code', '')));
    v_broker_code := upper(trim(coalesce(r->>'broker_code', '')));
    v_broker_name := trim(coalesce(r->>'broker_name', ''));
    IF v_team_no IS NULL OR v_team_no <= 0 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Number must be a positive whole number'); CONTINUE;
    END IF;
    IF v_broker_no IS NULL OR v_broker_no <= 0 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Broker Number must be a positive whole number'); CONTINUE;
    END IF;
    IF v_team_code = '' OR v_broker_code = '' OR v_broker_name = '' THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Code, Broker Code and Broker Name are required'); CONTINUE;
    END IF;
    SELECT * INTO t FROM teams WHERE code = v_team_code;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown Team Code ' || v_team_code); CONTINUE;
    END IF;
    IF t.seq <> v_team_no THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Team Number ' || v_team_no || ' does not match ' || v_team_code || ' (registered number ' || t.seq || ')'); CONTINUE;
    END IF;
    SELECT * INTO v_alias FROM broker_roster_aliases
    WHERE broker_number=v_broker_no AND upper(broker_code)=v_broker_code AND lower(btrim(broker_name))=lower(btrim(v_broker_name));
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Broker Number, Broker Code and Broker Name do not match the official broker roster'); CONTINUE;
    END IF;
    SELECT * INTO b FROM brokers WHERE id=v_alias.internal_broker_id AND active;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'The official broker ' || v_alias.broker_code || ' has no active internal broker desk mapping'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('team_id', t.id, 'team_number', t.seq, 'team_code', t.code,
      'broker_id', b.id, 'broker_number', v_broker_no, 'broker_code', v_alias.broker_code, 'broker_name', v_alias.broker_name,
      'before_broker_id', t.broker_id,
      'before_broker_code', (SELECT broker_code FROM broker_roster_aliases WHERE internal_broker_id=t.broker_id LIMIT 1));
  END LOOP;

  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    IF (SELECT count(*) FROM jsonb_array_elements(v_plan) e WHERE e->>'team_code' = x->>'team_code') > 1 THEN
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', (x->>'team_code') || ' appears more than once in the file');
      EXIT;
    END IF;
  END LOOP;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ROSTER_ERRORS',
      'error', 'Nothing was saved. Fix the rows listed and import again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview', v_plan);
  END IF;

  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE teams SET broker_id = (x->>'broker_id')::integer, updated_at = now()
    WHERE id = (x->>'team_id')::integer AND broker_id IS DISTINCT FROM (x->>'broker_id')::integer;
    IF FOUND THEN
      v_changed := v_changed + 1;
      PERFORM jse_audit(a, 'TEAM_BROKER_ASSIGNMENT_IMPORTED', 'team', x->>'team_code',
        (x->>'team_id')::integer, NULL,
        jsonb_build_object('broker_code', x->>'before_broker_code'),
        jsonb_build_object('broker_code', x->>'broker_code', 'broker_number', x->>'broker_number'),
        jsonb_build_object('import', true, 'team_number', x->>'team_number'));
    END IF;
  END LOOP;
  PERFORM jse_audit(a, 'ROSTER_ASSIGNMENTS_IMPORTED', 'team', NULL, NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_changed));
  RETURN jsonb_build_object('success', true, 'rows', jsonb_array_length(v_plan), 'updated', jsonb_array_length(v_plan), 'changed', v_changed);
END $$;

-- Company/base-price import. Ticker is the stable key; this deliberately does not change live prices.
CREATE OR REPLACE FUNCTION jse_import_companies(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  r jsonb;
  x jsonb;
  v_i integer := 0;
  v_status text;
  v_ticker text;
  v_name text;
  v_price numeric;
  s securities%ROWTYPE;
  v_plan jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_changed integer := 0;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT status INTO v_status FROM event_control WHERE id=1;
  IF v_status <> 'NOT_STARTED' AND NOT coalesce((p->>'dry_run')::boolean, false) THEN
    PERFORM jse_fail('EVENT_STARTED', 'Company/base-price imports can be saved only before the event starts.', 409);
  END IF;
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM 1 FROM event_control WHERE id=1 FOR UPDATE; END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
    PERFORM jse_fail('NO_ROWS', 'No company rows were supplied.', 400);
  END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    v_ticker := upper(trim(coalesce(r->>'ticker', '')));
    v_name := trim(coalesce(r->>'name', ''));
    BEGIN v_price := (r->>'base_price')::numeric; EXCEPTION WHEN others THEN v_price := NULL; END;
    IF v_ticker = '' OR v_name = '' THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Company Name and Ticker are required'); CONTINUE;
    END IF;
    IF v_ticker !~ '^[A-Z0-9][A-Z0-9._-]{0,19}$' THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Ticker must use 1–20 letters, numbers, dots, underscores or hyphens'); CONTINUE;
    END IF;
    IF v_price IS NULL OR v_price <= 0 OR v_price <> trunc(v_price) THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Base Price must be a positive whole number'); CONTINUE;
    END IF;
    IF length(v_name) > 160 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Company Name must be 160 characters or fewer'); CONTINUE;
    END IF;
    SELECT * INTO s FROM securities WHERE symbol = v_ticker;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Ticker ' || v_ticker || ' does not exist in the current securities list. Add it through the existing company/IPO setup first.'); CONTINUE;
    END IF;
    v_plan := v_plan || jsonb_build_object('id', s.id, 'ticker', s.symbol, 'name', v_name, 'base_price', v_price,
      'before_name', s.name, 'before_base_price', s.base_price, 'kind', s.kind);
  END LOOP;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    IF (SELECT count(*) FROM jsonb_array_elements(v_plan) e WHERE e->>'ticker' = x->>'ticker') > 1 THEN
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', (x->>'ticker') || ' appears more than once in the file');
      EXIT;
    END IF;
  END LOOP;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'COMPANY_IMPORT_ERRORS',
      'error', 'Nothing was saved. Fix the rows listed and import again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview', v_plan);
  END IF;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE securities SET name = x->>'name', base_price = (x->>'base_price')::numeric, updated_at = now()
    WHERE id = (x->>'id')::integer
      AND (name IS DISTINCT FROM x->>'name' OR base_price IS DISTINCT FROM (x->>'base_price')::numeric);
    IF FOUND THEN
      v_changed := v_changed + 1;
      PERFORM jse_audit(a, 'COMPANY_BASE_PRICE_IMPORTED', 'security', x->>'ticker', NULL, NULL,
        jsonb_build_object('name', x->>'before_name', 'base_price', x->>'before_base_price'),
        jsonb_build_object('name', x->>'name', 'base_price', x->>'base_price'),
        jsonb_build_object('kind', x->>'kind', 'live_price_unchanged', true));
    END IF;
  END LOOP;
  PERFORM jse_audit(a, 'COMPANY_BASE_PRICES_IMPORTED', 'security', NULL, NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', jsonb_array_length(v_plan), 'changed', v_changed, 'live_prices_changed', false));
  RETURN jsonb_build_object('success', true, 'rows', jsonb_array_length(v_plan), 'updated', jsonb_array_length(v_plan), 'changed', v_changed);
END $$;

-- Admin-only IPO tool: persistent random draw, verification, approval, idempotent issuance, and issue-size editing.
CREATE OR REPLACE FUNCTION jse_ipo_admin_tool(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''), 'STATE'));
  v_ipo text := upper(trim(coalesce(p->>'ipo','')));
  v_status text;
  v_event_status text;
  s securities%ROWTYPE;
  d ipo_allotment_draws%ROWTYPE;
  ap ipo_applications%ROWTYPE;
  al ipo_allotments%ROWTYPE;
  x record;
  v_issued integer;
  v_remaining integer;
  v_available_lots integer;
  v_requested integer := 0;
  v_position integer := 0;
  v_round integer := 1;
  v_left integer := 0;
  v_progress boolean;
  v_count integer := 0;
  v_total_shares integer := 0;
  v_total_amount numeric := 0;
  v_new_size numeric;
  v_new_shares integer;
  v_unit text;
  v_reason text;
  v_draw_id bigint;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action <> 'STATE' THEN PERFORM jse_require_admin_password(a, p); END IF;

  IF v_action = 'STATE' THEN
    IF v_ipo <> '' THEN
      SELECT * INTO s FROM securities WHERE kind = 'IPO' AND active AND (symbol = v_ipo OR ipo_code = v_ipo);
      IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose an existing IPO.', 404); END IF;
      SELECT * INTO d FROM ipo_allotment_draws WHERE security_id = s.id ORDER BY id DESC LIMIT 1;
    END IF;
    RETURN jsonb_build_object(
      'success', true,
      'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'symbol', sec.symbol, 'ipo_code', sec.ipo_code, 'name', sec.name, 'price', sec.base_price, 'live_price', sec.price,
        'lot_size', sec.ipo_lot_size, 'offered', sec.ipo_shares_offered,
        'issued', (SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=sec.id AND ia.reversed_at IS NULL),
        'remaining', CASE WHEN sec.ipo_shares_offered IS NULL THEN NULL ELSE sec.ipo_shares_offered -
          (SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=sec.id AND ia.reversed_at IS NULL) END,
        'applications', (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=sec.id AND ia.status='APPLIED'),
        'application_rows', (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=sec.id),
        'applied_lots', (SELECT coalesce(sum(ia.lots),0) FROM ipo_applications ia WHERE ia.security_id=sec.id AND ia.status='APPLIED'),
        'stage', jse_ipo_stage(sec.id),
        'latest_draw_status', (SELECT dd.status FROM ipo_allotment_draws dd WHERE dd.security_id=sec.id ORDER BY dd.id DESC LIMIT 1)
      ) ORDER BY sec.display_order, sec.id) FROM securities sec WHERE sec.kind='IPO' AND sec.active), '[]'::jsonb),
      'event_status', (SELECT status FROM event_control WHERE id=1),
      'ipo', CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object('symbol',s.symbol,'name',s.name,'lot_size',s.ipo_lot_size,
        'offered',s.ipo_shares_offered,'issued',(SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=s.id AND ia.reversed_at IS NULL),
        'remaining',CASE WHEN s.ipo_shares_offered IS NULL THEN NULL ELSE s.ipo_shares_offered-(SELECT coalesce(sum(ia.quantity),0) FROM ipo_allotments ia WHERE ia.security_id=s.id AND ia.reversed_at IS NULL) END) END,
      'draw', CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
      'eligible_count', CASE WHEN s.id IS NULL THEN 0 ELSE (SELECT count(*) FROM ipo_applications ia
        WHERE ia.security_id=s.id AND ia.status='APPLIED' AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000
          AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000
          AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL)) END,
      'rejected_count', CASE WHEN s.id IS NULL THEN 0 ELSE greatest(0,
        (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=s.id AND ia.status='APPLIED') -
        (SELECT count(*) FROM ipo_applications ia WHERE ia.security_id=s.id AND ia.status='APPLIED' AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000
          AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000
          AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL))) END,
      'items', CASE WHEN d.id IS NULL THEN '[]'::jsonb ELSE coalesce((SELECT jsonb_agg(jsonb_build_object(
        'team',di.team_code,'team_name',di.team_name,'position',di.draw_position,'requested_lots',di.requested_lots,
        'allotted_lots',di.allotted_lots,'shares',di.allotted_lots*di.lot_size,'rounds',to_jsonb(di.rounds),
        'price',di.application_price,'amount',di.allotted_lots*di.lot_size*di.application_price)
        ORDER BY di.draw_position) FROM ipo_allotment_draw_items di WHERE di.draw_id=d.id), '[]'::jsonb) END
    );
  END IF;

  SELECT status INTO v_event_status FROM event_control WHERE id=1 FOR UPDATE;
  SELECT * INTO s FROM securities WHERE kind='IPO' AND active AND (symbol=v_ipo OR ipo_code=v_ipo) FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose an existing IPO.', 404); END IF;

  IF v_action = 'LOT_SIZE' THEN
    BEGIN v_new_size := (p->>'lot_size')::numeric; EXCEPTION WHEN others THEN v_new_size := NULL; END;
    v_reason := nullif(trim(coalesce(p->>'reason','')), '');
    IF v_new_size IS NULL OR v_new_size <= 0 OR v_new_size <> trunc(v_new_size) OR v_new_size > 2147483647 THEN
      PERFORM jse_fail('INVALID_IPO_LOT_SIZE', 'IPO lot size must be a positive whole number of shares.', 400);
    END IF;
    IF EXISTS (SELECT 1 FROM ipo_applications WHERE security_id=s.id)
       OR EXISTS (SELECT 1 FROM ipo_allotments WHERE security_id=s.id)
       OR EXISTS (SELECT 1 FROM ipo_allotment_draws WHERE security_id=s.id) THEN
      PERFORM jse_fail('IPO_LOT_SIZE_LOCKED', 'IPO lot size cannot change after applications, allotments or a draw exist for this IPO.', 409);
    END IF;
    PERFORM jse_audit(a, 'IPO_LOT_SIZE_CHANGED', 'security', s.symbol, NULL, NULL,
      jsonb_build_object('lot_size',s.lot_size),
      jsonb_build_object('lot_size',v_new_size::integer),
      jsonb_build_object('reason',v_reason,'trading_lot_size_unchanged',true));
    UPDATE securities SET lot_size=v_new_size::integer, updated_at=now() WHERE id=s.id;
    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'old_lot_size',s.lot_size,'lot_size',v_new_size::integer,
      'trading_lot_size',50);
  END IF;

  IF v_event_status <> 'NOT_STARTED' THEN
    PERFORM jse_fail('EVENT_STARTED', 'IPO issue-size and allotment-draw changes are allowed only before the event starts.', 409);
  END IF;

  IF v_action = 'SIZE' THEN
    BEGIN v_new_size := (p->>'new_size')::numeric; EXCEPTION WHEN others THEN v_new_size := NULL; END;
    v_unit := upper(trim(coalesce(p->>'unit','SHARES')));
    v_reason := trim(coalesce(p->>'reason',''));
    IF v_new_size IS NULL OR v_new_size <= 0 OR v_new_size <> trunc(v_new_size) THEN
      PERFORM jse_fail('INVALID_ISSUE_SIZE', 'Issue size must be a positive whole number.', 400);
    END IF;
    IF v_unit NOT IN ('SHARES','LOTS') THEN PERFORM jse_fail('INVALID_UNIT', 'Choose Shares or Lots.', 400); END IF;
    IF v_unit='LOTS' THEN v_new_size := v_new_size * s.ipo_lot_size; END IF;
    IF v_new_size > 2147483647 THEN PERFORM jse_fail('ISSUE_SIZE_TOO_LARGE', 'Issue size exceeds the supported inventory range.', 400); END IF;
    v_new_shares := v_new_size::integer;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id ORDER BY id DESC LIMIT 1;
    IF d.id IS NOT NULL AND d.status IN ('GENERATED','VERIFIED','APPROVED') THEN
      PERFORM jse_fail('DRAW_IN_PROGRESS', 'Issue size cannot change while a draw is generated, verified or approved. Finalize or resolve that draw first.', 409);
    END IF;
    IF v_new_shares < v_issued THEN
      PERFORM jse_fail('BELOW_ISSUED', 'Issue size cannot be lower than already allotted shares (' || v_issued || ').', 409);
    END IF;
    IF d.id IS NOT NULL AND d.status='FINALIZED' AND v_new_shares < coalesce(s.ipo_shares_offered,0) THEN
      PERFORM jse_fail('FINALIZED_ISSUE_SIZE', 'After final issuance, issue size may only be increased; it cannot be reduced.', 409);
    END IF;
    PERFORM jse_audit(a, 'IPO_ISSUE_SIZE_CHANGED', 'security', s.symbol, NULL, NULL,
      jsonb_build_object('offered_shares',s.ipo_shares_offered),
      jsonb_build_object('offered_shares',v_new_shares,'unit_entered',v_unit,'value_entered',p->>'new_size'),
      jsonb_build_object('reason',v_reason,'issued_shares',v_issued));
    UPDATE securities SET ipo_shares_offered=v_new_shares, updated_at=now() WHERE id=s.id;
    RETURN jsonb_build_object('success',true,'symbol',s.symbol,'old_size',s.ipo_shares_offered,'new_size',v_new_shares,'issued',v_issued,'remaining',v_new_shares-v_issued);
  END IF;

  IF v_action = 'DRAW' THEN
    IF s.ipo_shares_offered IS NULL OR s.ipo_shares_offered <= 0 THEN
      PERFORM jse_fail('ISSUE_SIZE_REQUIRED', 'Set the IPO issue size before generating allotment.', 409);
    END IF;
    IF (jse_ipo_window()->>'phase') IS DISTINCT FROM 'CLOSED' THEN
      PERFORM jse_fail('APPLICATIONS_NOT_CLOSED', 'Random allotment is available only after the IPO application window closes.', 409);
    END IF;
    SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id AND status<>'CANCELLED' ORDER BY id DESC LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status',d.status,
        'message','An existing saved draw was returned. The random order was not regenerated.');
    END IF;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    v_remaining := s.ipo_shares_offered - v_issued;
    IF v_remaining < 0 THEN PERFORM jse_fail('INVENTORY_MISMATCH', 'Issued shares exceed the configured IPO issue size.', 409); END IF;
    v_available_lots := floor(v_remaining::numeric / s.ipo_lot_size)::integer;
    INSERT INTO ipo_allotment_draws(security_id,status,available_shares,available_lots,generated_by,inventory_snapshot)
    VALUES(s.id,'GENERATED',v_remaining,v_available_lots,jse_actor_name(a),
      jsonb_build_object('offered_shares',s.ipo_shares_offered,'issued_shares',v_issued,'lot_size',s.ipo_lot_size,'base_price',s.base_price))
    RETURNING id INTO v_draw_id;
    FOR x IN
      SELECT ia.id AS application_id, ia.team_id, t.code AS team_code, t.name AS team_name,
        ia.lots AS requested_lots, ia.price AS application_price, s.ipo_lot_size
      FROM ipo_applications ia JOIN teams t ON t.id=ia.team_id
      WHERE ia.security_id=s.id AND ia.status='APPLIED'
        AND ia.lots BETWEEN 1 AND 10 AND ia.amount<=150000
        AND (SELECT coalesce(sum(ax.amount),0) FROM ipo_applications ax WHERE ax.team_id=ia.team_id AND ax.status='APPLIED')<=600000
        AND NOT EXISTS (SELECT 1 FROM ipo_allotments aa WHERE aa.team_id=ia.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL)
      ORDER BY gen_random_bytes(16)
    LOOP
      v_position := v_position + 1;
      v_requested := v_requested + x.requested_lots;
      INSERT INTO ipo_allotment_draw_items(draw_id,application_id,team_id,team_code,team_name,draw_position,
        requested_lots,allotted_lots,lot_size,application_price)
      VALUES(v_draw_id,x.application_id,x.team_id,x.team_code,x.team_name,v_position,x.requested_lots,0,x.lot_size,x.application_price);
    END LOOP;
    IF v_position=0 THEN
      DELETE FROM ipo_allotment_draws WHERE id=v_draw_id;
      PERFORM jse_fail('NO_ELIGIBLE_APPLICATIONS', 'No eligible, unallotted applications were found for this IPO.', 409);
    END IF;
    UPDATE ipo_allotment_draws SET requested_lots=v_requested,
      subscription_ratio=CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END
    WHERE id=v_draw_id;
    v_left := v_available_lots;
    v_round := 1;
    WHILE v_left>0 LOOP
      v_progress := false;
      FOR x IN SELECT id,requested_lots,allotted_lots FROM ipo_allotment_draw_items
               WHERE draw_id=v_draw_id AND allotted_lots<requested_lots ORDER BY draw_position LOOP
        UPDATE ipo_allotment_draw_items SET allotted_lots=allotted_lots+1, rounds=array_append(rounds,v_round)
        WHERE id=x.id;
        v_left := v_left-1;
        v_progress := true;
        EXIT WHEN v_left<=0;
      END LOOP;
      EXIT WHEN NOT v_progress;
      v_round := v_round+1;
    END LOOP;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_GENERATED','ipo_allotment_draw',v_draw_id::text,NULL,NULL,NULL,NULL,
      jsonb_build_object('symbol',s.symbol,'eligible',v_position,'requested_lots',v_requested,'available_lots',v_available_lots,
        'subscription_ratio',CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END,
        'algorithm','RANDOM_ROUND_ROBIN_V1'));
    RETURN jsonb_build_object('success',true,'draw_id',v_draw_id,'status','GENERATED','eligible_count',v_position,
      'requested_lots',v_requested,'available_lots',v_available_lots,
      'subscription_ratio',CASE WHEN v_available_lots>0 THEN round(v_requested::numeric/v_available_lots,4) ELSE NULL END);
  END IF;

  SELECT * INTO d FROM ipo_allotment_draws WHERE security_id=s.id ORDER BY id DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('NO_DRAW', 'Generate the random draw first.', 409); END IF;

  IF v_action = 'VERIFY' THEN
    IF d.status <> 'GENERATED' THEN
      IF d.status IN ('VERIFIED','APPROVED','FINALIZED') THEN RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status',d.status); END IF;
      PERFORM jse_fail('INVALID_DRAW_STATUS','Only a generated draw can be verified.',409);
    END IF;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    v_remaining := coalesce(s.ipo_shares_offered,0)-v_issued;
    SELECT coalesce(sum(allotted_lots*lot_size),0)::integer, coalesce(sum(allotted_lots),0)::integer
      INTO v_total_shares,v_count FROM ipo_allotment_draw_items WHERE draw_id=d.id;
    IF v_remaining <> d.available_shares THEN PERFORM jse_fail('INVENTORY_CHANGED','IPO inventory changed after the draw. Do not approve this stale draw.',409); END IF;
    IF v_total_shares > d.available_shares OR EXISTS(SELECT 1 FROM ipo_allotment_draw_items WHERE draw_id=d.id AND (allotted_lots<0 OR allotted_lots>requested_lots)) THEN
      PERFORM jse_fail('ALLOTMENT_INVALID','The proposed allotment exceeds inventory or a request.',409);
    END IF;
    UPDATE ipo_allotment_draws SET status='VERIFIED',verified_by=jse_actor_name(a),verified_at=now() WHERE id=d.id;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_VERIFIED','ipo_allotment_draw',d.id::text,NULL,NULL,
      jsonb_build_object('status','GENERATED'),jsonb_build_object('status','VERIFIED'),
      jsonb_build_object('allotted_lots',v_count,'allotted_shares',v_total_shares,'available_shares',d.available_shares));
    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','VERIFIED','allotted_lots',v_count,'allotted_shares',v_total_shares);
  ELSIF v_action = 'APPROVE' THEN
    IF d.status <> 'VERIFIED' THEN PERFORM jse_fail('NOT_VERIFIED','Verify the allotment before approval.',409); END IF;
    UPDATE ipo_allotment_draws SET status='APPROVED',approved_by=jse_actor_name(a),approved_at=now() WHERE id=d.id;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_APPROVED','ipo_allotment_draw',d.id::text,NULL,NULL,
      jsonb_build_object('status','VERIFIED'),jsonb_build_object('status','APPROVED'),NULL);
    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','APPROVED');
  ELSIF v_action = 'FINALIZE' THEN
    IF d.status='FINALIZED' THEN RETURN jsonb_build_object('success',true,'replay',true,'draw_id',d.id,'status','FINALIZED'); END IF;
    IF d.status <> 'APPROVED' THEN PERFORM jse_fail('NOT_APPROVED','Approve the verified allotment before issuing shares.',409); END IF;
    SELECT coalesce(sum(quantity),0)::integer INTO v_issued FROM ipo_allotments WHERE security_id=s.id AND reversed_at IS NULL;
    v_remaining := coalesce(s.ipo_shares_offered,0)-v_issued;
    SELECT coalesce(sum(allotted_lots*lot_size),0)::integer INTO v_total_shares FROM ipo_allotment_draw_items WHERE draw_id=d.id;
    IF v_remaining <> d.available_shares OR v_total_shares>v_remaining THEN
      PERFORM jse_fail('INVENTORY_CHANGED','IPO inventory changed after approval. No shares were issued.',409);
    END IF;
    IF EXISTS(SELECT 1 FROM ipo_allotment_draw_items di JOIN ipo_allotments aa ON aa.team_id=di.team_id AND aa.security_id=s.id AND aa.reversed_at IS NULL WHERE di.draw_id=d.id AND di.allotted_lots>0) THEN
      PERFORM jse_fail('DUPLICATE_ALLOTMENT','An applicant already has an allotment for this IPO. No shares were issued.',409);
    END IF;
    FOR x IN SELECT di.team_id,di.allotted_lots,di.lot_size,di.application_price,t.cash,t.code
      FROM ipo_allotment_draw_items di JOIN teams t ON t.id=di.team_id
      WHERE di.draw_id=d.id AND di.allotted_lots>0 LOOP
      v_total_amount := v_total_amount + x.allotted_lots*x.lot_size*x.application_price;
      IF x.cash < x.allotted_lots*x.lot_size*x.application_price THEN
        PERFORM jse_fail('ALLOTMENT_CASH',x.code || ' does not have enough cash for the proposed allotment. No shares were issued.',409);
      END IF;
    END LOOP;
    FOR x IN SELECT di.* FROM ipo_allotment_draw_items di WHERE di.draw_id=d.id AND di.allotted_lots>0 ORDER BY di.draw_position LOOP
      INSERT INTO ipo_allotments(team_id,security_id,lots,quantity,price,amount,batch_id,created_by,created_by_name)
      VALUES(x.team_id,s.id,x.allotted_lots,x.allotted_lots*x.lot_size,x.application_price,
        x.allotted_lots*x.lot_size*x.application_price,'RANDOM-IPO-'||d.id,nullif(a->>'id','')::integer,jse_actor_name(a))
      RETURNING * INTO al;
      PERFORM jse__apply_allotment(a,al);
      v_count := v_count+1;
    END LOOP;
    UPDATE ipo_allotment_draws SET status='FINALIZED',finalized_by=jse_actor_name(a),finalized_at=now() WHERE id=d.id;
    PERFORM jse_audit(a,'IPO_RANDOM_DRAW_FINALIZED','ipo_allotment_draw',d.id::text,NULL,NULL,
      jsonb_build_object('status','APPROVED'),jsonb_build_object('status','FINALIZED'),
      jsonb_build_object('rows_issued',v_count,'shares_issued',v_total_shares,'amount_charged',v_total_amount));
    RETURN jsonb_build_object('success',true,'draw_id',d.id,'status','FINALIZED','rows_issued',v_count,
      'shares_issued',v_total_shares,'amount_charged',v_total_amount);
  END IF;

  PERFORM jse_fail('INVALID_ACTION','Use STATE, LOT_SIZE, SIZE, DRAW, VERIFY, APPROVE or FINALIZE.',400);
END $$;


-- IPO application and allotment lots are separate from regular share-trading lots.
CREATE OR REPLACE FUNCTION jse_ipo_application(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action', ''), 'SET'));
  v_status text; t teams%ROWTYPE; s securities%ROWTYPE; app ipo_applications%ROWTYPE;
  v_lots integer; v_amount numeric; v_other numeric; v_n integer;
BEGIN
  PERFORM jse_require_role(a, 'PARTICIPANT', 'ADMIN');
  SELECT status INTO v_status FROM event_control WHERE id = 1;
  IF v_action = 'CLEAR' THEN
    PERFORM jse_require_role(a, 'ADMIN');
    PERFORM jse_require_admin_password(a, p);
    IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'Applications can be cleared only before the event starts.', 409); END IF;
    DELETE FROM ipo_applications WHERE coalesce(p->>'ipo', '') = '' OR security_id = (SELECT id FROM securities WHERE kind = 'IPO' AND symbol = upper(trim(p->>'ipo')));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    PERFORM jse_audit(a, 'IPO_APPLICATIONS_CLEARED', 'ipo_application', coalesce(nullif(p->>'ipo', ''), 'ALL'), NULL, NULL, NULL, NULL, jsonb_build_object('rows', v_n));
    RETURN jsonb_build_object('success', true, 'cleared', v_n);
  END IF;
  SELECT * INTO t FROM teams WHERE id = CASE WHEN a->>'role' = 'PARTICIPANT' THEN nullif(a->>'team_id', '')::integer
                                             ELSE (SELECT id FROM teams WHERE code = upper(trim(coalesce(p->>'team', '')))) END FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('TEAM_NOT_FOUND', 'Team not found.', 404); END IF;
  SELECT * INTO s FROM securities WHERE kind = 'IPO' AND active AND (symbol = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(p->>'ipo', p->>'symbol', ''))));
  IF NOT FOUND THEN PERFORM jse_fail('IPO_NOT_FOUND', 'Choose one of the IPOs.', 404); END IF;
  IF jse_ipo_stage(s.id) <> 'APPLICATION_OPEN' THEN
    PERFORM jse_fail('IPO_WINDOW_CLOSED', 'Applications for ' || s.name || ' are not open (stage: ' || replace(jse_ipo_stage(s.id), '_', ' ') || ').', 409);
  END IF;
  SELECT * INTO app FROM ipo_applications WHERE team_id = t.id AND security_id = s.id FOR UPDATE;
  IF v_action = 'WITHDRAW' THEN
    IF NOT FOUND OR app.status <> 'APPLIED' THEN PERFORM jse_fail('NO_APPLICATION', 'There is no application to withdraw.', 409); END IF;
    UPDATE ipo_applications SET status = 'WITHDRAWN', updated_at = now(), updated_by_name = jse_actor_name(a) WHERE id = app.id;
    PERFORM jse_audit(a, 'IPO_APPLICATION_WITHDRAWN', 'ipo_application', s.symbol, t.id, NULL, jsonb_build_object('lots', app.lots), NULL, NULL);
    RETURN jsonb_build_object('success', true, 'status', 'WITHDRAWN');
  ELSIF v_action <> 'SET' THEN
    PERFORM jse_fail('INVALID_ACTION', 'Use SET or WITHDRAW.', 400);
  END IF;
  BEGIN v_lots := (p->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
  IF v_lots IS NULL OR v_lots <= 0 THEN PERFORM jse_fail('INVALID_LOTS', 'Apply for a whole number of lots (1 lot = ' || s.ipo_lot_size || ' shares).', 400); END IF;
  v_amount := v_lots * s.ipo_lot_size * s.base_price;
  SELECT coalesce(sum(amount), 0) INTO v_other FROM ipo_applications WHERE team_id = t.id AND status = 'APPLIED' AND security_id <> s.id;
  IF v_other + v_amount > t.cash THEN
    PERFORM jse_fail('APPLICATION_CASH', 'All IPO applications together (' || jse_inr((v_other + v_amount)) || ') cannot exceed the team''s cash (' || jse_inr(t.cash) || ').', 409);
  END IF;
  INSERT INTO ipo_applications(team_id, security_id, lots, quantity, price, amount, status, created_by_name, updated_by_name)
  VALUES (t.id, s.id, v_lots, v_lots * s.ipo_lot_size, s.base_price, v_amount, 'APPLIED', jse_actor_name(a), jse_actor_name(a))
  ON CONFLICT (team_id, security_id) DO UPDATE SET lots = EXCLUDED.lots, quantity = EXCLUDED.quantity, price = EXCLUDED.price,
    amount = EXCLUDED.amount, status = 'APPLIED', updated_at = now(), updated_by_name = EXCLUDED.updated_by_name
  RETURNING * INTO app;
  PERFORM jse_audit(a, 'IPO_APPLICATION_SUBMITTED', 'ipo_application', s.symbol, t.id, NULL, NULL,
    jsonb_build_object('lots', v_lots, 'shares', v_lots * s.ipo_lot_size, 'amount', v_amount), jsonb_build_object('issue_price', s.base_price));
  RETURN jsonb_build_object('success', true, 'status', 'APPLIED', 'application', to_jsonb(app) || jsonb_build_object('symbol', s.symbol));
END $$;

-- One prospectus record per IPO, managed by the administrator. Content is supplied by the organisers.

CREATE OR REPLACE FUNCTION jse_ipo_allot(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_status text; r jsonb; v_errors jsonb := '[]'::jsonb; v_rows jsonb := '[]'::jsonb;
  v_team teams%ROWTYPE; v_sec securities%ROWTYPE; v_lots integer; v_shares integer; v_amt numeric; v_i integer := 0;
  v_replace boolean := coalesce((p->>'replace')::boolean, false);
  v_batch text := coalesce(nullif(p->>'batch_id', ''), to_char(now(), 'YYYYMMDD-HH24MISS'));
  v_total numeric := 0; v_count integer := 0; v_applied integer;
  al ipo_allotments%ROWTYPE; x record;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT status INTO v_status FROM event_control WHERE id = 1 FOR UPDATE;
  IF v_status <> 'NOT_STARTED' THEN PERFORM jse_fail('EVENT_STARTED', 'IPO allotments can be loaded only before the event starts.', 409); END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN PERFORM jse_fail('NO_ROWS', 'No allotment rows were supplied.', 400); END IF;

  -- validation pass (nothing is written unless every row is valid)
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    SELECT * INTO v_team FROM teams WHERE code = upper(trim(coalesce(r->>'team', '')));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown team ' || coalesce(r->>'team', '(blank)')); CONTINUE; END IF;
    SELECT * INTO v_sec FROM securities WHERE kind = 'IPO' AND (symbol = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))) OR ipo_code = upper(trim(coalesce(r->>'ipo', '')))
                                                               OR upper(name) = upper(trim(coalesce(r->>'ipo', r->>'symbol', ''))));
    IF NOT FOUND THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Unknown IPO ' || coalesce(r->>'ipo', r->>'symbol', '(blank)')); CONTINUE; END IF;
    BEGIN v_lots := (r->>'lots')::integer; EXCEPTION WHEN others THEN v_lots := NULL; END;
    IF v_lots IS NULL OR v_lots < 0 THEN v_errors := v_errors || jsonb_build_object('row', v_i, 'error', 'Lots must be a whole number'); CONTINUE; END IF;
    IF v_lots = 0 THEN CONTINUE; END IF;
    v_shares := v_lots * v_sec.ipo_lot_size; v_amt := v_shares * v_sec.base_price;
    IF nullif(trim(coalesce(r->>'shares', '')), '') IS NOT NULL AND (r->>'shares')::numeric <> v_shares THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Shares ' || (r->>'shares') || ' \u2260 ' || v_lots || ' lots \xD7 ' || v_sec.ipo_lot_size || ' = ' || v_shares); CONTINUE;
    END IF;
    IF nullif(trim(coalesce(r->>'amount', '')), '') IS NOT NULL AND round((r->>'amount')::numeric, 2) <> v_amt THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' / ' || v_sec.symbol || ': Amount ' || (r->>'amount') || ' \u2260 ' || v_shares || ' \xD7 ' || jse_inr(v_sec.base_price) || ' = ' || jse_inr(v_amt)); CONTINUE;
    END IF;
    -- when the portal application process was used for this IPO, an allotment cannot exceed the team's application
    IF EXISTS (SELECT 1 FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.status = 'APPLIED') THEN
      SELECT lots INTO v_applied FROM ipo_applications ap WHERE ap.security_id = v_sec.id AND ap.team_id = v_team.id AND ap.status = 'APPLIED';
      IF coalesce(v_applied, 0) < v_lots THEN
        v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' applied for ' || coalesce(v_applied, 0) || ' ' || v_sec.symbol || ' lot(s) but the file allots ' || v_lots); CONTINUE;
      END IF;
    END IF;
    IF NOT v_replace AND EXISTS (SELECT 1 FROM ipo_allotments WHERE team_id = v_team.id AND security_id = v_sec.id AND reversed_at IS NULL) THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', v_team.code || ' already has a ' || v_sec.symbol || ' allotment (tick "replace" to overwrite)'); CONTINUE;
    END IF;
    v_rows := v_rows || jsonb_build_object('team_id', v_team.id, 'team', v_team.code, 'security_id', v_sec.id, 'symbol', v_sec.symbol,
                                           'lots', v_lots, 'quantity', v_shares, 'price', v_sec.base_price, 'amount', v_amt);
  END LOOP;
  FOR x IN SELECT e->>'team' AS team, e->>'symbol' AS symbol, count(*) AS n FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2 HAVING count(*) > 1 LOOP
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' / ' || x.symbol || ' appears ' || x.n || ' times in the file');
  END LOOP;
  FOR x IN
    SELECT e->>'team' AS team, (e->>'team_id')::integer AS team_id, sum((e->>'amount')::numeric) AS need
    FROM jsonb_array_elements(v_rows) e GROUP BY 1, 2
  LOOP
    SELECT t2.cash + (CASE WHEN v_replace THEN coalesce((
             SELECT sum(al2.amount) FROM ipo_allotments al2
             JOIN jsonb_array_elements(v_rows) e2 ON (e2->>'team_id')::integer = al2.team_id AND (e2->>'security_id')::integer = al2.security_id
             WHERE al2.team_id = x.team_id AND al2.reversed_at IS NULL), 0) ELSE 0 END)
    INTO v_total FROM teams t2 WHERE t2.id = x.team_id;
    IF x.need > v_total THEN
      v_errors := v_errors || jsonb_build_object('row', NULL, 'error', x.team || ' does not have enough cash for ' || jse_inr(x.need) || ' of allotments (available ' || jse_inr(v_total) || ')');
    END IF;
  END LOOP;
  v_total := 0;
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALLOTMENT_ERRORS', 'error', 'Nothing was loaded. Fix the rows listed and upload again.', 'errors', v_errors, 'http', 400);
  END IF;
  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_rows),
      'total_amount', (SELECT coalesce(sum((e->>'amount')::numeric), 0) FROM jsonb_array_elements(v_rows) e), 'preview', v_rows);
  END IF;

  FOR r IN SELECT value FROM jsonb_array_elements(v_rows) LOOP
    IF v_replace THEN
      PERFORM jse__reverse_allotment(a, al2.id) FROM ipo_allotments al2
      WHERE al2.team_id = (r->>'team_id')::integer AND al2.security_id = (r->>'security_id')::integer AND al2.reversed_at IS NULL;
    END IF;
    INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)
    VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,
            (r->>'price')::numeric, (r->>'amount')::numeric, v_batch, nullif(a->>'id', '')::integer, jse_actor_name(a))
    RETURNING * INTO al;
    PERFORM jse__apply_allotment(a, al);
    v_total := v_total + al.amount; v_count := v_count + 1;
  END LOOP;
  PERFORM jse_audit(a, 'IPO_ALLOTMENT_LOADED', 'ipo_allotment', v_batch, NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', v_count, 'total_amount', v_total, 'replace', v_replace));
  RETURN jsonb_build_object('success', true, 'batch_id', v_batch, 'rows', v_count, 'total_amount', v_total);
END $$;

CREATE OR REPLACE FUNCTION jse_ipo_page() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('success', true, 'event_name', cfg.event_name, 'event_start_at', cfg.event_start_at, 'window', jse_ipo_window(),
    'status', (SELECT status FROM event_control WHERE id = 1),
    'ipos', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'sector', s.sector,
        'issue_price', s.base_price, 'lot_size', s.ipo_lot_size, 'lot_value', s.ipo_lot_size * s.base_price,
        'stage', jse_ipo_stage(s.id), 'listed', s.listed_at IS NOT NULL, 'listed_at', s.listed_at,
        'listing_price', CASE WHEN s.listed_at IS NOT NULL THEN s.index_base_price END, 'price', s.price, 'in_index', s.listed_at IS NOT NULL,
        'prospectus', jsonb_build_object(
          'company_description', pr.company_description, 'issue_details', pr.issue_details, 'business_overview', pr.business_overview,
          'financial_information', pr.financial_information, 'risk_factors', pr.risk_factors, 'use_of_proceeds', pr.use_of_proceeds,
          'promoters_management', pr.promoters_management, 'other_information', pr.other_information,
          'document_url', pr.document_url, 'document_name', pr.document_name, 'document_size', pr.document_size,
          'document_uploaded_at', pr.document_uploaded_at, 'has_document', pr.document_data IS NOT NULL, 'updated_at', pr.updated_at)
      ) ORDER BY s.display_order, s.id)
      FROM securities s LEFT JOIN ipo_prospectus pr ON pr.security_id = s.id WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb))
  FROM event_config cfg WHERE cfg.id = 1
$$;

-- Admin-only special controls for BIG BULL, a dedicated participant with its own capital baseline.
CREATE OR REPLACE FUNCTION jse_big_bull_admin(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  v_action text := upper(coalesce(nullif(p->>'action',''), 'STATE'));
  t teams%ROWTYPE; u app_users%ROWTYPE; b brokers%ROWTYPE;
  v_delta numeric; v_after numeric; v_capital numeric; v_reason text; v_active boolean;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF v_action <> 'STATE' THEN PERFORM jse_require_admin_password(a, p); END IF;
  SELECT * INTO t FROM teams WHERE code='TEAM-101' AND lower(name)='big bull' FOR UPDATE;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_NOT_FOUND', 'BIG BULL special participant team has not been provisioned.', 404); END IF;
  SELECT * INTO u FROM app_users WHERE lower(username)='bigbull' AND team_id=t.id;
  IF NOT FOUND THEN PERFORM jse_fail('BIG_BULL_USER_NOT_FOUND', 'BIGBULL participant login has not been provisioned.', 404); END IF;
  IF v_action = 'STATE' THEN
    RETURN jsonb_build_object('success',true,'team_code',t.code,'name',t.name,'cash',t.cash,'active',t.active AND u.active,
      'team_active',t.active,'user_active',u.active,'username',u.username,'display_name',u.display_name,
      'starting_capital',t.initial_capital,'broker',(SELECT code FROM brokers WHERE id=t.broker_id),
      'broker_name',(SELECT name FROM brokers WHERE id=t.broker_id),
      'brokers',coalesce((SELECT jsonb_agg(jsonb_build_object('code',code,'name',name) ORDER BY code) FROM brokers WHERE active),'[]'::jsonb),
      'holdings',coalesce((SELECT jsonb_agg(jsonb_build_object('symbol',s.symbol,'name',s.name,'quantity',h.quantity,'price',s.price,'market_value',h.quantity*s.price,'cost_basis',h.cost_basis,'trade_cost',h.trade_cost) ORDER BY s.symbol)
        FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),'[]'::jsonb),
      'holdings_value',coalesce((SELECT sum(h.quantity*s.price) FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),0),
      'net_worth',t.cash+coalesce((SELECT sum(h.quantity*s.price) FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),0),
      'pnl',t.cash+coalesce((SELECT sum(h.quantity*s.price) FROM holdings h JOIN securities s ON s.id=h.security_id WHERE h.team_id=t.id AND h.quantity>0),0)-t.initial_capital,
      'orders_pending',(SELECT count(*) FROM orders o WHERE o.team_id=t.id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
      'settled_trades',(SELECT count(*) FROM settlements st JOIN orders o ON o.id=st.order_id WHERE o.team_id=t.id AND st.reversed_at IS NULL));
  ELSIF v_action = 'CASH_ADJUST' THEN
    BEGIN v_delta := (p->>'delta')::numeric; EXCEPTION WHEN others THEN v_delta := NULL; END;
    v_reason := trim(coalesce(p->>'reason',''));
    IF v_delta IS NULL OR v_delta=0 THEN PERFORM jse_fail('INVALID_CASH_ADJUSTMENT','Enter a non-zero cash adjustment amount.',400); END IF;
    IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for this financial adjustment.',400); END IF;
    v_after := t.cash+v_delta;
    IF v_after<0 THEN PERFORM jse_fail('NEGATIVE_CASH','BIG BULL cash cannot be negative.',409); END IF;
    IF v_delta<0 AND EXISTS(SELECT 1 FROM orders o WHERE o.team_id=t.id AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')) THEN
      PERFORM jse_fail('BIG_BULL_PENDING_ORDERS','Resolve BIG BULL pending orders before reducing its available cash.',409);
    END IF;
    UPDATE teams SET cash=v_after,updated_at=now() WHERE id=t.id;
    PERFORM jse_ledger(t.id,NULL,NULL,'ADJUSTMENT',greatest(-v_delta,0),greatest(v_delta,0),v_after,'BIG BULL cash adjustment: '||v_reason,a);
    PERFORM jse_audit(a,'BIG_BULL_CASH_ADJUSTED','team',t.code,t.id,NULL,jsonb_build_object('cash',t.cash),jsonb_build_object('cash',v_after),jsonb_build_object('delta',v_delta,'reason',v_reason));
    RETURN jsonb_build_object('success',true,'old_cash',t.cash,'new_cash',v_after,'delta',v_delta);
  ELSIF v_action = 'CAPITAL_SET' THEN
    BEGIN v_capital := (p->>'capital')::numeric; EXCEPTION WHEN others THEN v_capital := NULL; END;
    v_reason := trim(coalesce(p->>'reason',''));
    IF v_capital IS NULL OR v_capital<=0 OR v_capital>1000000000 THEN PERFORM jse_fail('INVALID_CAPITAL','Enter capital between ₹1 and ₹1,000,000,000.',400); END IF;
    IF v_reason='' THEN PERFORM jse_fail('REASON_REQUIRED','Enter a reason for the capital-baseline change.',400); END IF;
    PERFORM jse_audit(a,'BIG_BULL_CAPITAL_CHANGED','team',t.code,t.id,NULL,jsonb_build_object('initial_capital',t.initial_capital),jsonb_build_object('initial_capital',v_capital),jsonb_build_object('reason',v_reason));
    UPDATE teams SET initial_capital=v_capital,updated_at=now() WHERE id=t.id;
    RETURN jsonb_build_object('success',true,'old_capital',t.initial_capital,'capital',v_capital);
  ELSIF v_action = 'SET_BROKER' THEN
    SELECT * INTO b FROM brokers WHERE code=upper(trim(coalesce(p->>'broker',''))) AND active;
    IF NOT FOUND THEN PERFORM jse_fail('BROKER_NOT_FOUND','Choose an active broker.',404); END IF;
    PERFORM jse_audit(a,'BIG_BULL_BROKER_CHANGED','team',t.code,t.id,NULL,jsonb_build_object('broker',(SELECT code FROM brokers WHERE id=t.broker_id)),jsonb_build_object('broker',b.code),NULL);
    UPDATE teams SET broker_id=b.id,updated_at=now() WHERE id=t.id;
    RETURN jsonb_build_object('success',true,'broker',b.code,'broker_name',b.name);
  ELSIF v_action = 'SET_ACTIVE' THEN
    BEGIN v_active := (p->>'active')::boolean; EXCEPTION WHEN others THEN v_active := NULL; END;
    IF v_active IS NULL THEN PERFORM jse_fail('INVALID_ACTIVE','Choose whether BIG BULL should be enabled.',400); END IF;
    UPDATE teams SET active=v_active,updated_at=now() WHERE id=t.id;
    UPDATE app_users SET active=v_active,updated_at=now() WHERE id=u.id;
    IF NOT v_active THEN UPDATE sessions SET revoked_at=now() WHERE user_id=u.id AND revoked_at IS NULL; END IF;
    PERFORM jse_audit(a,CASE WHEN v_active THEN 'BIG_BULL_ENABLED' ELSE 'BIG_BULL_DISABLED' END,'team',t.code,t.id,NULL,jsonb_build_object('team_active',t.active,'user_active',u.active),jsonb_build_object('team_active',v_active,'user_active',v_active),NULL);
    RETURN jsonb_build_object('success',true,'active',v_active);
  END IF;
  PERFORM jse_fail('INVALID_ACTION','Use STATE, CASH_ADJUST, CAPITAL_SET, SET_BROKER or SET_ACTIVE.',400);
END $$;

CREATE OR REPLACE FUNCTION jse_import_dalal_roster(a jsonb, p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE r jsonb; x jsonb; t teams%ROWTYPE; v_alias broker_roster_aliases%ROWTYPE;
  v_i integer:=0; v_input text; v_broker_code text; v_section text; v_members text;
  v_plan jsonb:='[]'::jsonb; v_errors jsonb:='[]'::jsonb; v_skipped jsonb:='[]'::jsonb; v_changed integer:=0;
BEGIN
  PERFORM jse_require_role(a,'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean,false) THEN PERFORM jse_require_admin_password(a,p); END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows')=0 THEN PERFORM jse_fail('NO_ROWS','No roster rows were supplied.',400); END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i:=v_i+1; v_input:=trim(coalesce(r->>'team','')); v_broker_code:=trim(coalesce(r->>'broker_code',''));
    v_section:=trim(coalesce(r->>'section','')); v_members:=trim(coalesce(r->>'members',''));
    SELECT * INTO t FROM teams WHERE code=upper(v_input);
    IF NOT FOUND THEN SELECT * INTO t FROM teams WHERE lower(name)=lower(v_input); END IF;
    IF NOT FOUND THEN v_skipped:=v_skipped||jsonb_build_object('row',v_i,'team',v_input,'reason','No exact existing team name/code; code was not guessed.'); CONTINUE; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(v_plan) q WHERE q->>'code'=t.code) THEN v_errors:=v_errors||jsonb_build_object('row',v_i,'team',v_input,'error','Duplicate existing team row.'); CONTINUE; END IF;
    SELECT * INTO v_alias FROM broker_roster_aliases WHERE lower(broker_code)=lower(v_broker_code);
    IF NOT FOUND THEN v_errors:=v_errors||jsonb_build_object('row',v_i,'team',v_input,'error','Unknown official broker code: '||v_broker_code); CONTINUE; END IF;
    IF length(v_section)>120 OR length(v_members)>1000 THEN v_errors:=v_errors||jsonb_build_object('row',v_i,'team',v_input,'error','Section or participant text too long.'); CONTINUE; END IF;
    v_plan:=v_plan||jsonb_build_object('id',t.id,'code',t.code,'team_name',t.name,'section',nullif(v_section,''),'members',nullif(v_members,''),'broker_id',v_alias.internal_broker_id,
      'before',jsonb_build_object('section',t.section,'members',t.members,'broker_id',t.broker_id,'broker',(SELECT code FROM brokers WHERE id=t.broker_id)));
  END LOOP;
  IF jsonb_array_length(v_errors)>0 THEN RETURN jsonb_build_object('success',false,'code','ROSTER_ERRORS','error','Nothing saved; correct invalid rows first.','errors',v_errors,'http',400); END IF;
  IF jsonb_array_length(v_plan)=0 THEN PERFORM jse_fail('NO_MATCHING_TEAMS','No rows matched existing team names or codes.',400); END IF;
  IF coalesce((p->>'dry_run')::boolean,false) THEN RETURN jsonb_build_object('success',true,'dry_run',true,'matched',jsonb_array_length(v_plan),'skipped_count',jsonb_array_length(v_skipped),'skipped',v_skipped); END IF;
  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE teams SET section=x->>'section',members=x->>'members',broker_id=(x->>'broker_id')::integer,updated_at=now() WHERE id=(x->>'id')::integer;
    IF (x->'before') IS DISTINCT FROM jsonb_build_object('section',x->>'section','members',x->>'members','broker_id',(x->>'broker_id')::integer,'broker',(SELECT code FROM brokers WHERE id=(x->>'broker_id')::integer)) THEN
      PERFORM jse_audit(a,'DALAL_ROSTER_IMPORTED','team',x->>'code',(x->>'id')::integer,NULL,x->'before',jsonb_build_object('team_name',x->>'team_name','section',x->>'section','members',x->>'members','broker',(SELECT code FROM brokers WHERE id=(x->>'broker_id')::integer)),jsonb_build_object('source','Dalal Street Teams spreadsheet'));
      v_changed:=v_changed+1;
    END IF;
  END LOOP;
  PERFORM jse_audit(a,'DALAL_ROSTER_UPLOAD','team',NULL,NULL,NULL,NULL,NULL,jsonb_build_object('matched',jsonb_array_length(v_plan),'changed',v_changed,'skipped',jsonb_array_length(v_skipped),'cash_or_history_changed',false));
  RETURN jsonb_build_object('success',true,'matched',jsonb_array_length(v_plan),'updated',v_changed,'skipped_count',jsonb_array_length(v_skipped),'skipped',v_skipped,'cash_or_history_changed',false);
END $$;
INSERT INTO schema_migrations(version) VALUES ('011_roster_ipo');
