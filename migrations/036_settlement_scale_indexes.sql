CREATE INDEX IF NOT EXISTS institutional_orders_status_created_at_idx ON institutional_orders(status,created_at);
CREATE INDEX IF NOT EXISTS institutional_orders_investor_created_at_idx ON institutional_orders(investor_id,created_at);
CREATE INDEX IF NOT EXISTS institutional_holdings_investor_stock_ipo_idx ON institutional_holdings(investor_id,stock_id,ipo_id);
CREATE INDEX IF NOT EXISTS participant_loans_team_idx ON participant_loans(team_id);
CREATE INDEX IF NOT EXISTS ipo_offerings_status_created_at_idx ON ipo_offerings(status,id);