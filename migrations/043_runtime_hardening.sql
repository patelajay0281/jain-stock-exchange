-- JAIN STOCK EXCHANGE
-- 043_runtime_hardening.sql
-- Production hardening applied to Supabase on 2026-10-07.
-- Safe to re-run: all statements are idempotent.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_order_code() SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_event_transition() SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_settlement_transition() SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_commission_transition() SET search_path = public, pg_temp;
ALTER FUNCTION public.require_live_event_for_order_insert() SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_order_transition() SET search_path = public, pg_temp;
ALTER FUNCTION public.protect_order_immutable_fields() SET search_path = public, pg_temp;
ALTER FUNCTION public.forbid_mutation_on_append_only() SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_team_cash_reconciliation() SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_institution_cash_reconciliation() SET search_path = public, pg_temp;

ALTER FUNCTION public.jse_create_order(bigint,bigint,public.order_side,bigint,bigint,text) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_exchange_action(bigint,bigint,text) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_bank_action(bigint,bigint,text,boolean) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_realtime_snapshot() SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_loan_action(bigint,text,bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_create_institutional_order(bigint,bigint,bigint,public.order_side,bigint,bigint,text) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_bank_institutional_action(bigint,bigint,text) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_health_probe() SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_finalize_event(bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_reset_event(bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_undo_redo(bigint,text) SET search_path = public, pg_temp;
ALTER FUNCTION public.jse_login(text,text) SET search_path = public, extensions, pg_temp;

CREATE INDEX IF NOT EXISTS audit_log_actor_user_id_idx ON public.audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS audit_log_asset_id_idx ON public.audit_log(asset_id);
CREATE INDEX IF NOT EXISTS broker_commissions_settlement_id_idx ON public.broker_commissions(settlement_id);
CREATE INDEX IF NOT EXISTS broker_commissions_team_id_idx ON public.broker_commissions(team_id);
CREATE INDEX IF NOT EXISTS cash_ledger_loan_id_idx ON public.cash_ledger(loan_id);
CREATE INDEX IF NOT EXISTS cash_ledger_settlement_id_idx ON public.cash_ledger(settlement_id);
CREATE INDEX IF NOT EXISTS event_state_topper_team_id_idx ON public.event_state(topper_team_id);
CREATE INDEX IF NOT EXISTS institution_cash_ledger_order_id_idx ON public.institution_cash_ledger(order_id);
CREATE INDEX IF NOT EXISTS institution_cash_ledger_settlement_id_idx ON public.institution_cash_ledger(settlement_id);
CREATE INDEX IF NOT EXISTS institutional_holdings_asset_id_idx ON public.institutional_holdings(asset_id);
CREATE INDEX IF NOT EXISTS loans_approved_by_user_id_idx ON public.loans(approved_by_user_id);
CREATE INDEX IF NOT EXISTS orders_bank_reviewed_by_user_id_idx ON public.orders(bank_reviewed_by_user_id);
CREATE INDEX IF NOT EXISTS orders_broker_id_idx ON public.orders(broker_id);
CREATE INDEX IF NOT EXISTS orders_exchange_reviewed_by_user_id_idx ON public.orders(exchange_reviewed_by_user_id);
CREATE INDEX IF NOT EXISTS orders_institution_id_idx ON public.orders(institution_id);
CREATE INDEX IF NOT EXISTS price_history_changed_by_user_id_idx ON public.price_history(changed_by_user_id);
CREATE INDEX IF NOT EXISTS price_history_order_id_idx ON public.price_history(order_id);
CREATE INDEX IF NOT EXISTS settlement_actions_order_id_idx ON public.settlement_actions(order_id);
CREATE INDEX IF NOT EXISTS settlement_actions_performed_by_user_id_idx ON public.settlement_actions(performed_by_user_id);
CREATE INDEX IF NOT EXISTS settlement_rejections_broker_id_idx ON public.settlement_rejections(broker_id);
CREATE INDEX IF NOT EXISTS settlement_rejections_rejected_by_user_id_idx ON public.settlement_rejections(rejected_by_user_id);
CREATE INDEX IF NOT EXISTS settlements_settled_by_user_id_idx ON public.settlements(settled_by_user_id);
CREATE INDEX IF NOT EXISTS teams_broker_id_idx ON public.teams(broker_id);
CREATE INDEX IF NOT EXISTS users_institution_id_idx ON public.users(institution_id);
