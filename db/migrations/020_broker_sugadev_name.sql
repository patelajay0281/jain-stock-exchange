-- 020: Remove the outdated "Aman" broker contact display and keep the official Arohan code.
UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6
  AND lower(broker_code) = 'arohan'
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

INSERT INTO public.schema_migrations(version) VALUES ('020_broker_sugadev_name')
ON CONFLICT (version) DO NOTHING;
