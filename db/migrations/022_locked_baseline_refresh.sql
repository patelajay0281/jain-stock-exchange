-- 022: Refresh the immutable staging reset baseline to the currently approved data.
-- Preserves official roster assignments, Team 65's current IKS name (Tarka),
-- SUGADEV's broker display name, current base prices, and all uploaded positive IPO allotments.
-- IPO listing_price remains a separate start-event value supplied later by the administrator.

UPDATE public.securities
SET base_price = price,
    previous_price = price,
    index_base_price = price,
    updated_at = now()
WHERE symbol = 'TITAN' AND kind = 'EQUITY' AND active;

UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6 AND lower(broker_code) = 'arohan'
  AND broker_name IS DISTINCT FROM 'SUGADEV';

UPDATE public.brokers
SET name = 'SUGADEV'
WHERE id = (SELECT internal_broker_id FROM public.broker_roster_aliases
            WHERE broker_number = 6 AND lower(broker_code) = 'arohan')
  AND name IS DISTINCT FROM 'SUGADEV';

UPDATE public.app_users
SET display_name = 'SUGADEV', updated_at = now()
WHERE role = 'BROKER'
  AND broker_id = (SELECT internal_broker_id FROM public.broker_roster_aliases
                   WHERE broker_number = 6 AND lower(broker_code) = 'arohan')
  AND display_name IS DISTINCT FROM 'SUGADEV';

DROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;

UPDATE public.jse_locked_baseline
SET version = 2,
    locked_at = now(),
    locked_by = 'LOCKED OFFICIAL STAGING BASELINE v2',
    snapshot = jsonb_build_object(
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
      ) ORDER BY id),'[]'::jsonb) FROM public.ipo_allotments WHERE reversed_at IS NULL AND quantity > 0),
      'team_starting_cash',
      (SELECT coalesce(jsonb_agg(jsonb_build_object(
          'team_id', t.id,
          'cash', t.cash + coalesce(al.total_amount, 0)
        ) ORDER BY t.seq), '[]'::jsonb)
       FROM public.teams t
       LEFT JOIN (
         SELECT team_id, sum(amount) total_amount
         FROM public.ipo_allotments
         WHERE reversed_at IS NULL AND quantity > 0
         GROUP BY team_id
       ) al ON al.team_id = t.id)
    )
WHERE id = 1;

DROP TRIGGER IF EXISTS jse_locked_baseline_no_mutation ON public.jse_locked_baseline;
CREATE TRIGGER jse_locked_baseline_no_mutation
BEFORE UPDATE OR DELETE ON public.jse_locked_baseline
FOR EACH ROW EXECUTE FUNCTION public.jse_locked_baseline_immutable();

INSERT INTO public.schema_migrations(version) VALUES ('022_locked_baseline_refresh')
ON CONFLICT (version) DO NOTHING;
