-- Permanently establish the requested reduced opening/base prices.
-- >5000: reduce by 8%; >3000 and <=5000: reduce by 5%; <=3000 unchanged.
-- The reduced prices become both the live reset prices and the CMS 50 reference prices.
UPDATE stocks
SET price = ROUND(
  CASE
    WHEN price > 5000 THEN price * 0.92
    WHEN price > 3000 THEN price * 0.95
    ELSE price
  END, 2
),
previous_price = ROUND(
  CASE
    WHEN price > 5000 THEN price * 0.92
    WHEN price > 3000 THEN price * 0.95
    ELSE price
  END, 2
),
updated_at = now()
WHERE id IN (SELECT stock_id FROM stock_catalog);

UPDATE cms50_components c
SET base_price = s.price
FROM stocks s
WHERE c.stock_id = s.id
  AND c.stock_id IN (SELECT stock_id FROM stock_catalog);

UPDATE cms50_reference
SET base_value =
  COALESCE((SELECT SUM(price) FROM stocks WHERE id IN (SELECT stock_id FROM stock_catalog)), 0)
  + COALESCE((SELECT SUM(price) FROM ipo_offerings), 0)
WHERE id = 1;