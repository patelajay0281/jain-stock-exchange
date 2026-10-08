-- JAIN STOCK EXCHANGE — high-volume tracking/reporting indexes
CREATE INDEX IF NOT EXISTS orders_team_created_at_id_idx
  ON public.orders(team_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS orders_team_status_created_at_id_idx
  ON public.orders(team_id, status, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS audit_log_team_created_at_id_idx
  ON public.audit_log(team_id, created_at DESC, id DESC);