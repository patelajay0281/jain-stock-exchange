CREATE SEQUENCE IF NOT EXISTS order_code_seq;
SELECT setval('order_code_seq', GREATEST(COALESCE((SELECT MAX((substring(order_code from '^ORD-([0-9]+)$'))::bigint) FROM orders WHERE order_code ~ '^ORD-[0-9]+$'),0),1), true);
CREATE INDEX IF NOT EXISTS orders_status_created_at_id_idx ON orders(status, created_at, id);
CREATE INDEX IF NOT EXISTS orders_team_asset_created_idx ON orders(team_id, stock_id, ipo_id, created_at);
CREATE INDEX IF NOT EXISTS price_history_stock_changed_at_idx ON price_history(stock_id, changed_at);
CREATE INDEX IF NOT EXISTS action_history_order_created_idx ON action_history(order_id, created_at);
CREATE INDEX IF NOT EXISTS settlement_rejections_team_created_idx ON settlement_rejections(team_id, created_at);