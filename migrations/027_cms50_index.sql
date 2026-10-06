CREATE TABLE IF NOT EXISTS cms50_components (
  id BIGSERIAL PRIMARY KEY,
  stock_id BIGINT NOT NULL UNIQUE REFERENCES stocks(id),
  base_price NUMERIC(14,2) NOT NULL,
  weight NUMERIC(8,6) NOT NULL DEFAULT 0.02,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO cms50_components(stock_id,base_price,weight)
SELECT s.id,s.price,0.02
FROM stocks s
JOIN stock_catalog c ON c.stock_id=s.id
WHERE NOT EXISTS (SELECT 1 FROM cms50_components x WHERE x.stock_id=s.id)
ON CONFLICT(stock_id) DO NOTHING;