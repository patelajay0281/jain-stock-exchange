-- 018: Apply the official broker-to-team roster, show official broker labels,
-- and count active assigned teams (never inactive placeholders) in commission summaries.
WITH roster(team_name, broker_code) AS (VALUES
('Viveka','Prajna'),('Jya','Prajna'),('Ghosha','Prajna'),('Shree','Prajna'),('Jaya','Prajna'),('Utsaha','Prajna'),('Abhyasa','Prajna'),
('Panini','Ganita'),('Yukti','Ganita'),('Virahanka','Ganita'),('Sutra','Ganita'),('Koshya','Ganita'),('Madhava','Ganita'),('Sangita','Ganita'),
('Mithila','Amrit'),('Dhan','Amrit'),('Nilakantha','Amrit'),('Maitreyi','Amrit'),('Avvaiyar','Amrit'),('Tanka','Amrit'),('Halayudha','Amrit'),
('Pingala','Vikas'),('Pramana','Vikas'),('Labh','Vikas'),('Jaimini','Vikas'),('Neeti','Vikas'),('Rupa','Vikas'),('Neetiya','Vikas'),('Shiksha','Vikas'),
('Artha','Yash'),('Kosh','Yash'),('Nyaya','Yash'),('Nishtha','Yash'),('Rajat','Yash'),('Mangala','Yash'),('Valabhi','Yash'),('Dhriti','Yash'),
('Kautilya','Arohan'),('Nidhi','Arohan'),('Mudra','Arohan'),('Sridhara','Arohan'),('Labhya','Arohan'),('Charaka','Arohan'),('Kriya','Arohan'),
('Nivesh','Madhava'),('Vasubandhu','Madhava'),('Nirukta','Madhava'),('Medha','Madhava'),('Kuttaka','Madhava'),('Vyaya','Madhava'),('Lopamudra','Madhava'),('Bhamaha','Madhava'),
('Vagbhata','Vidura'),('Apala','Vidura'),('Khana','Vidura'),('Kanada','Vidura'),('Matanga','Vidura'),('Kapila','Vidura'),('Dignaga','Vidura'),
('Sankalpa','Kalidasa'),('Munjala','Kalidasa'),('Vriddhi','Kalidasa'),('Shilpa','Kalidasa'),('Chandas','Kalidasa'),('Kamandaka','Kalidasa'),('Tarka','Kalidasa'),
('Aryadeva','Suvarna'),('Vastu','Suvarna'),('Aryabhata','Suvarna'),('Akshaya','Suvarna'),('Dandin','Suvarna'),('Tantra','Suvarna'),('Sushruta','Suvarna')
)
UPDATE public.teams t
SET broker_id = ba.internal_broker_id, updated_at = now()
FROM roster r
JOIN public.broker_roster_aliases ba ON lower(trim(ba.broker_code)) = lower(trim(r.broker_code))
WHERE lower(trim(t.name)) = lower(trim(r.team_name))
  AND t.active AND t.seq <> 1
  AND t.broker_id IS DISTINCT FROM ba.internal_broker_id;

CREATE OR REPLACE FUNCTION public.jse_commissions(a jsonb, p jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $function$
DECLARE
  v_broker integer;
  v_page integer := greatest(1, coalesce(nullif(p->>'page', '')::integer, 1));
  v_size integer := least(500, greatest(10, coalesce(nullif(p->>'page_size', '')::integer, 100)));
BEGIN
  PERFORM jse_require_role(a, 'ADMIN', 'BROKER', 'VIEWER');
  IF a->>'role' = 'BROKER' THEN
    v_broker := nullif(a->>'broker_id', '')::integer;
  ELSIF coalesce(p->>'broker', '') <> '' THEN
    SELECT b.id INTO v_broker
    FROM brokers b LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
    WHERE upper(b.code) = upper(trim(p->>'broker'))
       OR upper(ba.broker_code) = upper(trim(p->>'broker'))
    ORDER BY b.id LIMIT 1;
    v_broker := coalesce(v_broker, -1);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'rate', (SELECT brokerage_rate FROM event_config WHERE id = 1),
    'own_broker', CASE WHEN a->>'role' = 'BROKER' THEN (
      SELECT coalesce(ba.broker_code, b.code) FROM brokers b
      LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
      WHERE b.id = v_broker
    ) END,
    'brokers', coalesce((
      SELECT jsonb_agg(x ORDER BY (x->>'rank')::integer)
      FROM (
        SELECT jsonb_build_object(
          'rank', row_number() OVER (ORDER BY coalesce(c.amount, 0) DESC, coalesce(ba.broker_number, 999), b.code),
          'broker', b.code,
          'display_code', coalesce(ba.broker_code, b.code),
          'name', coalesce(ba.broker_name, b.name),
          'teams', (SELECT count(*) FROM teams t WHERE t.broker_id = b.id AND t.active),
          'orders', coalesce(c.n, 0),
          'buy_orders', coalesce(c.nb, 0),
          'sell_orders', coalesce(c.ns, 0),
          'buy_volume', coalesce(c.bv, 0),
          'sell_volume', coalesce(c.sv, 0),
          'buy_quantity', coalesce(c.bq, 0),
          'sell_quantity', coalesce(c.sq, 0),
          'total_trade_value', coalesce(c.tv, 0),
          'brokerage_earned', coalesce(c.amount, 0),
          'pending_orders', (
            SELECT count(*) FROM orders o
            WHERE o.broker_id = b.id
              AND o.status IN ('PIT_PENDING','EXCHANGE_PENDING','EXCHANGE_APPROVED','BANK_PENDING')
          )
        ) AS x
        FROM brokers b
        LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
        LEFT JOIN (
          SELECT bc.broker_id, count(*) n,
            count(*) FILTER (WHERE bc.side = 'BUY') nb,
            count(*) FILTER (WHERE bc.side = 'SELL') ns,
            sum(bc.trade_value) FILTER (WHERE bc.side = 'BUY') bv,
            sum(bc.trade_value) FILTER (WHERE bc.side = 'SELL') sv,
            sum(o.quantity) FILTER (WHERE bc.side = 'BUY') bq,
            sum(o.quantity) FILTER (WHERE bc.side = 'SELL') sq,
            sum(bc.trade_value) tv, sum(bc.amount) amount
          FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id
          WHERE bc.reversed_at IS NULL GROUP BY bc.broker_id
        ) c ON c.broker_id = b.id
        WHERE a->>'role' <> 'BROKER' OR b.id = v_broker
      ) q
    ), '[]'::jsonb),
    'transactions_total', (
      SELECT count(*) FROM broker_commissions bc
      WHERE v_broker IS NULL OR bc.broker_id = v_broker
    ),
    'page', v_page, 'page_size', v_size,
    'transactions', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'created_at', bc.created_at, 'broker', b.code,
        'broker_display_code', coalesce(ba.broker_code, b.code),
        'broker_name', coalesce(ba.broker_name, b.name),
        'order_no', o.order_no, 'account_type', o.account_type,
        'counterparty', CASE WHEN o.account_type = 'INSTITUTION' THEN 'Institutional investor' ELSE 'Market' END,
        'team', t.code, 'team_name', t.name, 'symbol', s.symbol, 'security', s.name,
        'side', bc.side, 'quantity', o.quantity, 'price', o.price,
        'trade_value', bc.trade_value, 'rate', bc.rate, 'amount', bc.amount,
        'status', CASE WHEN bc.reversed_at IS NULL THEN 'SETTLED' ELSE 'REVERSED' END,
        'reversed_at', bc.reversed_at
      ) ORDER BY bc.id DESC)
      FROM (
        SELECT * FROM broker_commissions
        WHERE v_broker IS NULL OR broker_id = v_broker
        ORDER BY id DESC LIMIT v_size OFFSET (v_page - 1) * v_size
      ) bc
      JOIN brokers b ON b.id = bc.broker_id
      LEFT JOIN broker_roster_aliases ba ON ba.internal_broker_id = b.id
      JOIN orders o ON o.id = bc.order_id JOIN teams t ON t.id = bc.team_id
      JOIN securities s ON s.id = o.security_id
    ), '[]'::jsonb),
    'totals', (
      SELECT jsonb_build_object('orders', count(*), 'trade_value', coalesce(sum(trade_value), 0), 'brokerage', coalesce(sum(amount), 0))
      FROM broker_commissions WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)
    ),
    'reconciliation', (
      SELECT jsonb_build_object('commission_total', c.total, 'settled_brokerage_total', st.total, 'ok', c.total = st.total)
      FROM (
        SELECT coalesce(sum(amount), 0) total FROM broker_commissions
        WHERE reversed_at IS NULL AND (v_broker IS NULL OR broker_id = v_broker)
      ) c,
      (
        SELECT coalesce(sum(st0.brokerage), 0) total FROM settlements st0
        JOIN orders o0 ON o0.id = st0.order_id
        WHERE st0.reversed_at IS NULL AND o0.broker_id IS NOT NULL
          AND (v_broker IS NULL OR o0.broker_id = v_broker)
      ) st
    ),
    'institutional', (
      SELECT jsonb_build_object('orders', count(*), 'brokerage', coalesce(sum(bc.amount), 0))
      FROM broker_commissions bc JOIN orders o ON o.id = bc.order_id
      WHERE bc.reversed_at IS NULL AND o.account_type = 'INSTITUTION'
        AND (v_broker IS NULL OR bc.broker_id = v_broker)
    )
  );
END
$function$;

INSERT INTO public.schema_migrations(version) VALUES ('018_broker_assignments_and_counts');
