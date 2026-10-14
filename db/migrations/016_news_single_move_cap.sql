-- 016: Limit each individual Market News move to +/-10%; retain the +/-15% daily cumulative cap.
CREATE OR REPLACE FUNCTION public.jse_mood_band(p_mood text)
RETURNS numeric[] LANGUAGE sql IMMUTABLE AS $function$
  SELECT CASE upper(replace(trim(p_mood), ' ', '_'))
    WHEN 'VERY_SEVERE'    THEN ARRAY[-10.00, -7.50]
    WHEN 'SEVERE'         THEN ARRAY[-7.49, -5.00]
    WHEN 'NEGATIVE'       THEN ARRAY[-4.99, -1.00]
    WHEN 'NORMAL'         THEN ARRAY[-0.99, 0.99]
    WHEN 'POSITIVE'       THEN ARRAY[1.00, 4.99]
    WHEN 'VERY_POSITIVE'  THEN ARRAY[5.00, 7.49]
    WHEN 'SUPER_POSITIVE' THEN ARRAY[7.50, 10.00]
  END::numeric[]
$function$;

INSERT INTO schema_migrations(version) VALUES ('016_news_single_move_cap');
