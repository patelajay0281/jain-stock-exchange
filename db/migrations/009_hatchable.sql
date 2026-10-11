-- JAIN STOCK EXCHANGE (JSE) v3.13
-- 009_hatchable.sql: one-time data changes to match the live Hatchable application (applied once).
--   * Market News moves are priced to the paisa, as on Hatchable (e.g. ₹1,714.55); base prices stay whole rupees.
UPDATE event_config SET price_tick = 0.01 WHERE id = 1 AND price_tick = 1;

--   * IPO shares on offer, as the live IPO master shows them (remaining = offered − allotted)
UPDATE securities SET ipo_shares_offered = v.q
FROM (VALUES ('VOLTRA', 100000), ('BLUEAI', 80000), ('SHREEB', 120000), ('AAROGYA', 60000)) AS v(sym, q)
WHERE securities.symbol = v.sym AND securities.kind = 'IPO' AND securities.ipo_shares_offered IS NULL;

INSERT INTO schema_migrations(version) VALUES ('009_hatchable');
