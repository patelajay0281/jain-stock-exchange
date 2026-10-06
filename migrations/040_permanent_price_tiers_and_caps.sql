-- Permanent stock price adjustment from current live prices.
-- IPO prices remain unchanged.
-- 1) >5000: reduce 25%
-- 2) >2000: reduce 10% (except the >5000 tier)
-- 3) Resulting price in >3500 and <4000 band: bring below 3500.
-- 4) Resulting price in >4000 and <4300 band: bring below 4000.
-- Prices at or below 2000 remain unchanged.
-- Resulting prices become permanent live/reset/CMS bases.

UPDATE stocks
SET price = ROUND(
      CASE
        WHEN price > 5000 THEN
          CASE
            WHEN price * 0.75 > 4000 AND price * 0.75 < 4300 THEN 3999
            WHEN price * 0.75 > 3500 AND price * 0.75 < 4000 THEN 3499
            ELSE price * 0.75
          END
        WHEN price > 2000 THEN
          CASE
            WHEN price * 0.90 > 4000 AND price * 0.90 < 4300 THEN 3999
            WHEN price * 0.90 > 3500 AND price * 0.90 < 4000 THEN 3499
            ELSE price * 0.90
          END
        ELSE price
      END, 2
    ),
    previous_price = ROUND(
      CASE
        WHEN price > 5000 THEN
          CASE
            WHEN price * 0.75 > 4000 AND price * 0.75 < 4300 THEN 3999
            WHEN price * 0.75 > 3500 AND price * 0.75 < 4000 THEN 3499
            ELSE price * 0.75
          END
        WHEN price > 2000 THEN
          CASE
            WHEN price * 0.90 > 4000 AND price * 0.90 < 4300 THEN 3999
            WHEN price * 0.90 > 3500 AND price * 0.90 < 4000 THEN 3499
            ELSE price * 0.90
          END
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