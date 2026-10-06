ALTER TABLE orders ALTER COLUMN stock_id DROP NOT NULL;
ALTER TABLE ipo_offerings ADD COLUMN IF NOT EXISTS previous_price NUMERIC(14,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ipo_id BIGINT REFERENCES ipo_offerings(id);
UPDATE ipo_offerings SET previous_price=price WHERE previous_price IS NULL;
ALTER TABLE holdings ALTER COLUMN stock_id DROP NOT NULL;
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS ipo_id BIGINT REFERENCES ipo_offerings(id);
ALTER TABLE holdings DROP CONSTRAINT IF EXISTS holdings_team_id_stock_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS holdings_team_asset_uq ON holdings(team_id,stock_id,ipo_id);
ALTER TABLE orders ADD CONSTRAINT orders_one_asset_chk CHECK ((stock_id IS NOT NULL AND ipo_id IS NULL) OR (stock_id IS NULL AND ipo_id IS NOT NULL));