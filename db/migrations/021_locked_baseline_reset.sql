-- 021: Lock the official staging baseline and restore it on every event reset.
-- IPO listing_price intentionally remains editable for the new opening price supplied by Event Admin.
-- The allotment price/amount and all base reference prices are restored from this frozen snapshot.

UPDATE public.broker_roster_aliases
SET broker_name='SUGADEV'
WHERE broker_number=6 AND lower(broker_code)='arohan';

UPDATE public.brokers
SET name='SUGADEV'
WHERE id=(SELECT internal_broker_id FROM public.broker_roster_aliases WHERE broker_number=6 AND lower(broker_code)='arohan')
  AND name IS DISTINCT FROM 'SUGADEV';

UPDATE public.app_users
SET display_name='SUGADEV', updated_at=now()
WHERE role='BROKER'
  AND broker_id=(SELECT internal_broker_id FROM public.broker_roster_aliases WHERE broker_number=6 AND lower(broker_code)='arohan')
  AND display_name IS DISTINCT FROM 'SUGADEV';

-- Titan's current staging price becomes its new base price.
UPDATE public.securities
SET base_price=price, previous_price=price, index_base_price=price, updated_at=now()
WHERE symbol='TITAN' AND kind='EQUITY' AND active;

CREATE TABLE IF NOT EXISTS public.jse_locked_baseline (
  id smallint PRIMARY KEY CHECK (id=1),
  version integer NOT NULL DEFAULT 1,
  snapshot jsonb NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now(),
  locked_by text NOT NULL DEFAULT 'STAGING BASELINE'
);

INSERT INTO public.jse_locked_baseline(id,version,snapshot,locked_by)
VALUES (
  1,1,
  jsonb_build_object(
    'teams', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id',id,'seq',seq,'code',code,'name',name,'section',section,'members',members,
      'broker_id',broker_id,'active',active
    ) ORDER BY seq),'[]'::jsonb) FROM public.teams),
    'brokers', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id',id,'code',code,'name',name,'active',active,'contact',contact,'desk',desk
    ) ORDER BY id),'[]'::jsonb) FROM public.brokers),
    'broker_roster_aliases', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'broker_number',broker_number,'broker_code',broker_code,'broker_name',broker_name,
      'internal_broker_id',internal_broker_id
    ) ORDER BY broker_number),'[]'::jsonb) FROM public.broker_roster_aliases),
    'securities', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id',id,'kind',kind,'symbol',symbol,'name',name,'sector',sector,
      'base_price',base_price,'lot_size',lot_size,'display_order',display_order,'active',active,
      'ipo_code',ipo_code,'ipo_shares_offered',ipo_shares_offered,'ipo_lot_size',ipo_lot_size
    ) ORDER BY id),'[]'::jsonb) FROM public.securities),
    'ipo_allotments', (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'team_id',team_id,'security_id',security_id,'lots',lots,'quantity',quantity,
      'price',price,'amount',amount,'batch_id',batch_id
    ) ORDER BY id),'[]'::jsonb) FROM public.ipo_allotments WHERE reversed_at IS NULL AND quantity > 0)
  ),
  'LOCKED OFFICIAL ROSTER + INITIAL PRICES + IPO ALLOTMENTS'
)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.jse_locked_baseline_immutable()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  RAISE EXCEPTION 'The staging baseline is locked. Request an explicit baseline update instead.';
END
$function$;

DROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;
CREATE TRIGGER jse_locked_baseline_no_mutation
BEFORE UPDATE OR DELETE ON public.jse_locked_baseline
FOR EACH ROW EXECUTE FUNCTION public.jse_locked_baseline_immutable();

CREATE OR REPLACE FUNCTION public.jse_reset_event(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  cfg event_config%ROWTYPE; ev event_control%ROWTYPE;
  v_base jsonb; v_allots jsonb; r jsonb; al ipo_allotments%ROWTYPE; v_n integer := 0; v_archived integer;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF coalesce(p->>'confirm', '') <> 'RESET' THEN PERFORM jse_fail('CONFIRM_REQUIRED', 'Type RESET to confirm.', 400); END IF;
  PERFORM jse_require_admin_password(a, p);
  SELECT * INTO cfg FROM event_config WHERE id = 1;
  SELECT * INTO ev FROM event_control WHERE id = 1 FOR UPDATE;
  IF ev.status IN ('LIVE', 'SETTLEMENT_ONLY') THEN
    PERFORM jse_fail('EVENT_RUNNING', 'Close the market before resetting (current status: ' || replace(ev.status, '_', ' ') || ').', 409);
  END IF;
  LOCK TABLE orders, settlements, holdings, teams, securities, loans, brokers, broker_roster_aliases IN EXCLUSIVE MODE;
  SELECT snapshot INTO v_base FROM public.jse_locked_baseline WHERE id = 1;
  IF v_base IS NULL THEN PERFORM jse_fail('BASELINE_MISSING', 'The locked starting baseline is missing; reset was blocked.', 500); END IF;
  v_allots := coalesce(v_base->'ipo_allotments', '[]'::jsonb);

  PERFORM set_config('jse.maintenance', 'on', true);
  INSERT INTO audit_log_archive SELECT al2.*, now(), ev.reset_count + 1 FROM audit_log al2;
  GET DIAGNOSTICS v_archived = ROW_COUNT;
  TRUNCATE action_journal, broker_commissions, cash_ledger, institution_ledger, loan_transactions, risk_events, price_history,
           market_news, order_events, settlements, holdings, institutional_holdings, ipo_allotments, trading_slips, instructions, orders, audit_log
           RESTART IDENTITY;
  PERFORM set_config('jse.maintenance', 'off', true);

  -- Restore locked roster and broker mappings. Cash/P&L is reset separately below.
  UPDATE teams t SET name = x.name, section = x.section, members = x.members,
      broker_id = x.broker_id, active = x.active, updated_at = now()
  FROM jsonb_to_recordset(v_base->'teams') AS x(id integer, name text, section text, members text, broker_id integer, active boolean)
  WHERE t.id = x.id;
  UPDATE brokers b SET name = x.name, active = x.active, contact = x.contact, desk = x.desk
  FROM jsonb_to_recordset(v_base->'brokers') AS x(id integer, name text, active boolean, contact text, desk text)
  WHERE b.id = x.id;
  DELETE FROM broker_roster_aliases;
  INSERT INTO broker_roster_aliases(broker_number, broker_code, broker_name, internal_broker_id)
  SELECT x.broker_number, x.broker_code, x.broker_name, x.internal_broker_id
  FROM jsonb_to_recordset(v_base->'broker_roster_aliases') AS x(
    broker_number integer, broker_code text, broker_name text, internal_broker_id integer
  );
  -- Restore company identities/base values; retain listing_price for the next START.
  UPDATE securities s SET kind = x.kind, symbol = x.symbol, name = x.name, sector = x.sector,
      base_price = x.base_price, lot_size = x.lot_size, display_order = x.display_order,
      active = x.active, ipo_code = x.ipo_code, ipo_shares_offered = x.ipo_shares_offered,
      ipo_lot_size = x.ipo_lot_size, updated_at = now()
  FROM jsonb_to_recordset(v_base->'securities') AS x(
    id integer, kind text, symbol text, name text, sector text, base_price numeric,
    lot_size integer, display_order integer, active boolean, ipo_code text,
    ipo_shares_offered integer, ipo_lot_size integer
  )
  WHERE s.id = x.id;

  UPDATE teams SET cash = cfg.initial_capital, realized_pnl = 0, brokerage_paid = 0, short_sell_attempts = 0,
                   cash_shortfall_attempts = 0, insufficient_balance_rejections = 0, updated_at = now();
  UPDATE loans SET original_principal = 0, principal_outstanding = 0, interest_outstanding = 0, interest_charged = 0,
                   interest_paid = 0, principal_repaid = 0, draws = 0, status = 'NONE', updated_at = now();
  INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;
  UPDATE institutions SET cash = initial_cash, updated_at = now();
  -- base / reference prices; IPOs back to the pre-market stage (saved listing prices are kept for the next START)
  UPDATE securities SET price = base_price, previous_price = base_price, trade_count = 0, traded_quantity = 0, traded_value = 0,
                        last_trade_at = NULL, listed_at = NULL, last_price_change_at = NULL,
                        index_base_price = CASE WHEN kind = 'EQUITY' THEN base_price END, updated_at = now();
  INSERT INTO cash_ledger(team_id, entry_type, credit, balance_after, note, actor_id, actor_name)
  SELECT id, 'INITIAL_CAPITAL', cfg.initial_capital, cfg.initial_capital, 'Initial event capital', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM teams;
  INSERT INTO institution_ledger(institution_id, entry_type, credit, balance_after, note, actor_id, actor_name)
  SELECT id, 'INITIAL_CAPITAL', initial_cash, initial_cash, 'Initial institutional cash', nullif(a->>'id', '')::integer, jse_actor_name(a) FROM institutions;

  FOR r IN SELECT value FROM jsonb_array_elements(v_allots) LOOP
    INSERT INTO ipo_allotments(team_id, security_id, lots, quantity, price, amount, batch_id, created_by, created_by_name)
    VALUES ((r->>'team_id')::integer, (r->>'security_id')::integer, (r->>'lots')::integer, (r->>'quantity')::integer,
            (r->>'price')::numeric, (r->>'amount')::numeric, r->>'batch_id', nullif(a->>'id', '')::integer, jse_actor_name(a))
    RETURNING * INTO al;
    PERFORM jse__apply_allotment(a, al);
    v_n := v_n + 1;
  END LOOP;

  UPDATE event_control SET status = 'NOT_STARTED', started_at = NULL, paused_at = NULL, closed_at = NULL, finalized_at = NULL,
         status_changed_at = now(), status_changed_by = jse_actor_name(a), reset_count = reset_count + 1, last_reset_at = now(),
         market_updated_at = now() WHERE id = 1;
  PERFORM jse_audit(a, 'EVENT_RESET', 'event', 'event_control', NULL, NULL, jsonb_build_object('status', ev.status),
    jsonb_build_object('status', 'NOT_STARTED'),
    jsonb_build_object('reset_no', ev.reset_count + 1, 'archived_audit_rows', v_archived, 'kept_ipo_allotments', v_n, 'baseline_restored', true,
                       'team_names_locked', cfg.team_names_locked_at IS NOT NULL));
  RETURN jsonb_build_object('success', true, 'status', 'NOT_STARTED', 'reset_no', ev.reset_count + 1, 'kept_ipo_allotments', v_n, 'archived_audit_rows', v_archived);
END $function$;


CREATE OR REPLACE FUNCTION public.jse_admin_state(a jsonb, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE v_idx jsonb := jse_cms_index();
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'VIEWER');
  RETURN jse_event_status() || jsonb_build_object(
    'config_full', (SELECT to_jsonb(c) - 'min_cash_buffer' - 'participant_order_entry' - 'institutional_cash' - 'institution_overdraft' - 'institution_brokerage'
                    FROM event_config c WHERE id = 1),
    'stats', (SELECT jsonb_build_object('total_trade_value', coalesce(sum(trade_value) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'total_brokerage', coalesce(sum(brokerage) FILTER (WHERE status = 'BANK_SETTLED'), 0),
        'pit_pending', count(*) FILTER (WHERE status = 'PIT_PENDING'),
        'pending_orders', count(*) FILTER (WHERE status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')),
        'settled_orders', count(*) FILTER (WHERE status = 'BANK_SETTLED'),
        'rejected_orders', count(*) FILTER (WHERE status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED')),
        'stale_orders', count(*) FILTER (WHERE reject_code = 'PRICE_STALE'),
        'slips', (SELECT count(*) FROM trading_slips),
        'open_instructions', (SELECT count(*) FROM instructions WHERE status = 'OPEN'),
        'institutional_orders', count(*) FILTER (WHERE account_type = 'INSTITUTION'),
        'news_items', (SELECT count(*) FROM market_news WHERE reversed_at IS NULL),
        'loans_outstanding', (SELECT coalesce(sum(principal_outstanding + interest_outstanding), 0) FROM loans),
        'risk', (SELECT jsonb_build_object('short_sell', count(*) FILTER (WHERE kind = 'SHORT_SELL_ATTEMPT'),
                   'cash_shortfall', count(*) FILTER (WHERE kind = 'CASH_SHORTFALL_ATTEMPT'),
                   'insufficient_balance', count(*) FILTER (WHERE kind = 'INSUFFICIENT_BALANCE_REJECTION')) FROM risk_events)) FROM orders),
    'market', jsonb_build_object('index', v_idx, 'breadth', jse_market()->'breadth'),
    'consistency', (SELECT jsonb_build_object(
        'equities_active', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
        'index_equity_components', (v_idx->>'equity_components')::integer,
        'market_stocks', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active),
        'ipos', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active),
        'ipos_listed', (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL),
        'index_ipo_components', (v_idx->>'ipo_components')::integer,
        'index_components', (v_idx->>'components')::integer,
        'ok', (SELECT count(*) FROM securities WHERE kind = 'EQUITY' AND active) = (v_idx->>'equity_components')::integer
              AND (SELECT count(*) FROM securities WHERE kind = 'IPO' AND active AND listed_at IS NOT NULL) = (v_idx->>'ipo_components')::integer)),
    'journal', coalesce((SELECT jsonb_agg(jsonb_build_object('id', j.id, 'action', j.action, 'summary', j.summary, 'actor', j.actor_name, 'at', j.created_at,
        'undone_at', j.undone_at, 'undone_by', j.undone_by, 'redone_at', j.redone_at, 'redone_by', j.redone_by,
        'superseded', coalesce((j.payload->>'superseded')::boolean, false),
        'state', CASE WHEN coalesce((j.payload->>'superseded')::boolean, false) THEN 'REDONE'
                      WHEN j.undone_at IS NOT NULL AND (j.redone_at IS NULL OR j.redone_at < j.undone_at) THEN 'UNDONE' ELSE 'ACTIVE' END) ORDER BY j.id DESC)
      FROM (SELECT * FROM action_journal ORDER BY id DESC) j), '[]'::jsonb),
    'allotments', (SELECT jsonb_build_object('rows', count(*), 'teams', count(DISTINCT team_id), 'amount', coalesce(sum(amount), 0),
        'by_ipo', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'name', s.name, 'teams', z.n, 'lots', z.lots, 'shares', z.q, 'amount', z.amt) ORDER BY s.display_order)
                  FROM (SELECT security_id, count(*) n, sum(lots) lots, sum(quantity) q, sum(amount) amt FROM ipo_allotments WHERE reversed_at IS NULL GROUP BY security_id) z
                  JOIN securities s ON s.id = z.security_id), '[]'::jsonb),
        'list', coalesce((SELECT jsonb_agg(jsonb_build_object('team', t.code, 'team_name', t.name, 'ipo', s.symbol, 'ipo_code', s.ipo_code, 'lots', x.lots, 'shares', x.quantity, 'amount', x.amount) ORDER BY t.seq, s.display_order)
                  FROM (SELECT * FROM ipo_allotments WHERE reversed_at IS NULL ORDER BY id LIMIT 1000) x JOIN teams t ON t.id = x.team_id JOIN securities s ON s.id = x.security_id), '[]'::jsonb))
      FROM ipo_allotments WHERE reversed_at IS NULL),
    'ipo_listing', jse_listing_state(a),
    'ipo_admin', coalesce((SELECT jsonb_agg(jsonb_build_object('symbol', s.symbol, 'ipo_code', s.ipo_code, 'name', s.name, 'stage', jse_ipo_stage(s.id),
        'price', s.base_price, 'listed', s.listed_at IS NOT NULL, 'offered', s.ipo_shares_offered,
        'remaining', CASE WHEN s.ipo_shares_offered IS NULL THEN NULL ELSE s.ipo_shares_offered - coalesce((SELECT sum(quantity) FROM ipo_allotments al WHERE al.security_id = s.id AND al.reversed_at IS NULL), 0) END,
        'applications', (SELECT count(*) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'applied_lots', (SELECT coalesce(sum(lots), 0) FROM ipo_applications ap WHERE ap.security_id = s.id AND ap.status = 'APPLIED'),
        'prospectus_fields', (SELECT (CASE WHEN pr.company_description IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.issue_details IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.business_overview IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.financial_information IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.risk_factors IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.use_of_proceeds IS NOT NULL THEN 1 ELSE 0 END)
              + (CASE WHEN pr.promoters_management IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN pr.other_information IS NOT NULL THEN 1 ELSE 0 END)
              FROM ipo_prospectus pr WHERE pr.security_id = s.id),
        'has_document', (SELECT document_data IS NOT NULL OR document_url IS NOT NULL FROM ipo_prospectus pr WHERE pr.security_id = s.id)) ORDER BY s.display_order)
      FROM securities s WHERE s.kind = 'IPO' AND s.active), '[]'::jsonb),
    'team_names', (SELECT jsonb_build_object('seed', team_name_seed, 'assigned_at', team_names_assigned_at, 'locked', team_names_locked_at IS NOT NULL,
        'locked_at', team_names_locked_at, 'locked_by', team_names_locked_by, 'pool_size', (SELECT count(*) FROM team_name_pool WHERE active))
      FROM event_config WHERE id = 1),
    'brokers', (SELECT jsonb_agg(jsonb_build_object('code', b.code, 'display_code', coalesce(ba.broker_code, b.code), 'name', coalesce(ba.broker_name, b.name), 'contact', b.contact, 'desk', b.desk,
        'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id AND t.active)) ORDER BY coalesce(ba.broker_number, 999), b.code)
      FROM brokers b LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id),
    'unassigned_teams', (SELECT count(*) FROM teams WHERE broker_id IS NULL),
    'users', (SELECT jsonb_object_agg(role, n) FROM (SELECT role, count(*) n FROM app_users WHERE active GROUP BY role) u));
END $function$;


INSERT INTO public.schema_migrations(version) VALUES ('021_locked_baseline_reset')
ON CONFLICT (version) DO NOTHING;
