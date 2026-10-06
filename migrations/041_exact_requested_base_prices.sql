-- Exact permanent opening/base prices requested by the user.
-- IPO prices and all other shares remain unchanged.
UPDATE stocks
SET price = CASE symbol
  WHEN 'STK16' THEN 4980.00
  WHEN 'BAJAJ-AUTO' THEN 5050.00
  WHEN 'SIEMENS' THEN 3599.00
  ELSE price
END,
previous_price = CASE symbol
  WHEN 'STK16' THEN 4980.00
  WHEN 'BAJAJ-AUTO' THEN 5050.00
  WHEN 'SIEMENS' THEN 3599.00
  ELSE previous_price
END,
updated_at = now()
WHERE symbol IN ('STK16','BAJAJ-AUTO','SIEMENS');

UPDATE cms50_components c
SET base_price = s.price
FROM stocks s
WHERE c.stock_id = s.id
  AND s.symbol IN ('STK16','BAJAJ-AUTO','SIEMENS');

UPDATE cms50_reference
SET base_value =
  COALESCE((SELECT SUM(price) FROM stocks WHERE id IN (SELECT stock_id FROM stock_catalog)), 0)
  + COALESCE((SELECT SUM(price) FROM ipo_offerings), 0)
WHERE id = 1;