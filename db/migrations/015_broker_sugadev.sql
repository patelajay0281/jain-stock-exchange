-- 015: Rename broker roster display name only; preserve broker number, code, assignments, and trade history.
UPDATE public.broker_roster_aliases
SET broker_name = 'SUGADEV'
WHERE broker_number = 6
  AND internal_broker_id = 6
  AND lower(broker_code) = 'arohan';
