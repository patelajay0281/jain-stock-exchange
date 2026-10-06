CREATE TABLE IF NOT EXISTS cms50_reference (
  id INTEGER PRIMARY KEY,
  base_value NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO cms50_reference(id, base_value)
SELECT 1,
       COALESCE((SELECT SUM(price) FROM stocks WHERE id IN (SELECT stock_id FROM stock_catalog)),0)
       + COALESCE((SELECT SUM(price) FROM ipo_offerings),0)
WHERE NOT EXISTS (SELECT 1 FROM cms50_reference WHERE id=1);

UPDATE cms50_reference
SET base_value = COALESCE((SELECT SUM(price) FROM stocks WHERE id IN (SELECT stock_id FROM stock_catalog)),0)
               + COALESCE((SELECT SUM(price) FROM ipo_offerings),0)
WHERE id=1;