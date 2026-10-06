-- Permanent market base-price adjustment.
-- IPO prices remain unchanged.
-- Shares currently above ₹5,000: reduce by 25%.
-- Other shares currently above ₹1,000: reduce by 10%.
-- Shares at or below ₹1,000: unchanged.
-- Resulting prices become live, previous, CMS component and CMS reference bases.

UPDATE stocks
SET price = ROUND(
      CASE
        WHEN price > 5000 THEN price * 0.75
        WHEN price > 1000 THEN price * 0.90
        ELSE price
      END, 2
    ),
    previous_price = ROUND(
      CASE
        WHEN price > 5000 THEN price * 0.75
        WHEN price > 1000 THEN price * 0.90
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