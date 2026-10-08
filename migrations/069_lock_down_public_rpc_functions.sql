-- JAIN STOCK EXCHANGE — lock down business RPC functions
DO $do$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid,
           format('public.%I(%s)',p.proname,pg_get_function_identity_arguments(p.oid)) AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname IN (
        'jse_bank_action',
        'jse_bank_institutional_action',
        'jse_create_institutional_order',
        'jse_create_order',
        'jse_create_order_for_team',
        'jse_exchange_action',
        'jse_finalize_event',
        'jse_health_probe',
        'jse_loan_action',
        'jse_loan_action_for_team',
        'jse_login',
        'jse_order_summary',
        'jse_order_summary_v2',
        'jse_realtime_snapshot',
        'jse_reset_event',
        'jse_undo_redo',
        'jse_set_password',
        'jse_set_temporary_password',
        'jse_verify_admin_control_password'
      )
  LOOP
    EXECUTE 'REVOKE ALL ON FUNCTION '||r.signature||' FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON FUNCTION '||r.signature||' FROM anon';
    EXECUTE 'REVOKE ALL ON FUNCTION '||r.signature||' FROM authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION '||r.signature||' TO service_role';
  END LOOP;
END $do$;
