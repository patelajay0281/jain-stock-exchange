-- JAIN STOCK EXCHANGE — reporting/queue indexes for high-volume event operation
CREATE INDEX IF NOT EXISTS orders_created_at_id_idx ON public.orders(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS cash_ledger_created_at_id_idx ON public.cash_ledger(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS audit_log_created_at_id_idx ON public.audit_log(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS broker_commissions_created_at_id_idx ON public.broker_commissions(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS institution_cash_ledger_created_at_id_idx ON public.institution_cash_ledger(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS price_history_asset_changed_at_id_idx ON public.price_history(asset_id, changed_at DESC, id DESC);