-- 024: Keep the official broker roster editable from Event Admin without breaking the
-- internal broker desk identifiers used by accounts, orders, and historical trades.
CREATE OR REPLACE FUNCTION public.jse_update_brokers(a jsonb, p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  r jsonb;
  x jsonb;
  v_i integer := 0;
  v_plan jsonb := '[]'::jsonb;
  v_errors jsonb := '[]'::jsonb;
  v_input_code text;
  v_name text;
  b public.brokers%ROWTYPE;
  ali public.broker_roster_aliases%ROWTYPE;
BEGIN
  PERFORM jse_require_role(a, 'ADMIN');
  IF NOT coalesce((p->>'dry_run')::boolean, false) THEN
    PERFORM jse_require_admin_password(a, p);
  END IF;
  IF jsonb_typeof(p->'rows') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'rows') = 0 THEN
    PERFORM jse_fail('NO_ROWS', 'No broker rows were supplied.', 400);
  END IF;

  FOR r IN SELECT value FROM jsonb_array_elements(p->'rows') LOOP
    v_i := v_i + 1;
    v_input_code := upper(trim(coalesce(r->>'broker', r->>'code', '')));
    SELECT br.* INTO b
      FROM public.brokers br
      LEFT JOIN public.broker_roster_aliases ba ON ba.internal_broker_id = br.id
     WHERE upper(br.code) = v_input_code OR upper(ba.broker_code) = v_input_code
     ORDER BY CASE WHEN upper(ba.broker_code) = v_input_code THEN 0 ELSE 1 END, br.id
     LIMIT 1;
    IF NOT FOUND THEN
      v_errors := v_errors || jsonb_build_object(
        'row', v_i, 'error', 'Unknown official broker code or internal broker code ' ||
        coalesce(nullif(v_input_code, ''), '(blank)')
      );
      CONTINUE;
    END IF;

    SELECT * INTO ali
      FROM public.broker_roster_aliases
     WHERE internal_broker_id = b.id
     ORDER BY broker_number
     LIMIT 1;

    v_name := coalesce(nullif(trim(r->>'name'), ''), ali.broker_name, b.name);
    IF length(v_name) > 120
       OR length(coalesce(r->>'contact', '')) > 200
       OR length(coalesce(r->>'desk', '')) > 120 THEN
      v_errors := v_errors || jsonb_build_object('row', v_i, 'error', b.code || ': text too long');
      CONTINUE;
    END IF;

    v_plan := v_plan || jsonb_build_object(
      'id', b.id,
      'internal_code', b.code,
      'broker_number', ali.broker_number,
      'display_code', coalesce(ali.broker_code, b.code),
      'name', v_name,
      'contact', CASE WHEN r ? 'contact' THEN nullif(trim(r->>'contact'), '') ELSE b.contact END,
      'desk', CASE WHEN r ? 'desk' THEN nullif(trim(r->>'desk'), '') ELSE b.desk END,
      'before', jsonb_build_object(
        'name', coalesce(ali.broker_name, b.name),
        'internal_name', b.name,
        'contact', b.contact,
        'desk', b.desk
      )
    );
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_plan) e
     GROUP BY e->>'id' HAVING count(*) > 1
  ) THEN
    v_errors := v_errors || jsonb_build_object('row', NULL, 'error', 'A broker code appears more than once in the file');
  END IF;

  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ROSTER_ERRORS',
      'error', 'Nothing was saved. Fix the rows listed and try again.',
      'errors', v_errors,
      'http', 400
    );
  END IF;

  IF coalesce((p->>'dry_run')::boolean, false) THEN
    RETURN jsonb_build_object('success', true, 'dry_run', true, 'rows', jsonb_array_length(v_plan), 'preview',
      (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'broker_code', e->'display_code',
        'broker_number', e->'broker_number',
        'broker_name', e->'name',
        'internal_code', e->'internal_code'
      ) ORDER BY (e->>'broker_number')::integer NULLS LAST), '[]'::jsonb)
       FROM jsonb_array_elements(v_plan) e));
  END IF;

  FOR x IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    UPDATE public.brokers
       SET name = x->>'name',
           contact = x->>'contact',
           desk = x->>'desk'
     WHERE id = (x->>'id')::integer;

    UPDATE public.broker_roster_aliases
       SET broker_name = x->>'name'
     WHERE internal_broker_id = (x->>'id')::integer
       AND broker_name IS DISTINCT FROM x->>'name';

    UPDATE public.app_users
       SET display_name = x->>'name', updated_at = now()
     WHERE role = 'BROKER'
       AND broker_id = (x->>'id')::integer
       AND display_name IS DISTINCT FROM x->>'name';

    IF (x->'before'->>'name') IS DISTINCT FROM x->>'name'
       OR (x->'before'->>'internal_name') IS DISTINCT FROM x->>'name'
       OR (x->'before'->>'contact') IS DISTINCT FROM x->>'contact'
       OR (x->'before'->>'desk') IS DISTINCT FROM x->>'desk' THEN
      PERFORM public.jse_audit(
        a, 'BROKER_UPDATED', 'broker', x->>'display_code',
        NULL, NULL, x->'before',
        jsonb_build_object(
          'name', x->>'name',
          'internal_name', x->>'name',
          'contact', x->>'contact',
          'desk', x->>'desk'
        ), NULL
      );
    END IF;
  END LOOP;

  PERFORM public.jse_audit(
    a, 'BROKERS_UPDATED', 'broker', NULL,
    NULL, NULL, NULL, NULL,
    jsonb_build_object('rows', jsonb_array_length(v_plan))
  );
  RETURN jsonb_build_object('success', true, 'updated', jsonb_array_length(v_plan));
END
$function$;
