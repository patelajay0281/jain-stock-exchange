-- JAIN STOCK EXCHANGE — one-query order summary for high-volume tracking
CREATE OR REPLACE FUNCTION public.jse_order_summary(
  p_team_id bigint DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_query text DEFAULT NULL
) RETURNS jsonb
LANGUAGE sql
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*)::bigint,
    'pending', COUNT(*) FILTER (WHERE o.status = 'PENDING_EXCHANGE')::bigint,
    'exchange_approved', COUNT(*) FILTER (WHERE o.status = 'EXCHANGE_APPROVED')::bigint,
    'settled', COUNT(*) FILTER (WHERE o.status = 'SETTLED')::bigint,
    'exchange_rejected', COUNT(*) FILTER (WHERE o.status = 'EXCHANGE_REJECTED')::bigint,
    'bank_rejected', COUNT(*) FILTER (WHERE o.status = 'BANK_REJECTED')::bigint,
    'trade_value', COALESCE(SUM(o.trade_value_paise),0)::numeric / 100,
    'brokerage', COALESCE(SUM(o.brokerage_paise),0)::numeric / 100
  )
  FROM public.orders o
  LEFT JOIN public.teams t ON t.id = o.team_id
  LEFT JOIN public.assets a ON a.id = o.asset_id
  WHERE (p_team_id IS NULL OR o.team_id = p_team_id)
    AND (NULLIF(TRIM(p_status),'') IS NULL OR o.status::text = UPPER(TRIM(p_status)))
    AND (
      NULLIF(TRIM(p_query),'') IS NULL
      OR o.order_code ILIKE '%'||TRIM(p_query)||'%'
      OR COALESCE(t.code,'') ILIKE '%'||TRIM(p_query)||'%'
      OR COALESCE(a.name,'') ILIKE '%'||TRIM(p_query)||'%'
      OR COALESCE(a.symbol,'') ILIKE '%'||TRIM(p_query)||'%'
    );
$$;