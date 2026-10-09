-- JAIN STOCK EXCHANGE (JSE) v272
-- 007_tuning.sql: safety timeouts for this database (re-applicable).
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET statement_timeout = %L', current_database(), '20s');
  EXECUTE format('ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L', current_database(), '60s');
  EXECUTE format('ALTER DATABASE %I SET lock_timeout = %L', current_database(), '10s');
END $$;
ANALYZE;
