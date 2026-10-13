-- JAIN STOCK EXCHANGE (JSE) v3.14
-- 010_safety.sql: one-time rule changes from the v3.14 master brief (applied once).
--   * Share prices are whole rupees again (no decimals). Any price with paise is rounded once, recorded as an ADMIN price change.
UPDATE event_config SET price_tick = 1 WHERE id = 1;
INSERT INTO price_history(security_id, previous_price, new_price, change_pct, source)
SELECT id, price, round(price), CASE WHEN price > 0 THEN round((round(price) - price) * 100 / price, 4) ELSE 0 END, 'ADMIN'
FROM securities WHERE price <> round(price);
UPDATE securities SET price = round(price) WHERE price <> round(price);
UPDATE securities SET previous_price = round(previous_price) WHERE previous_price <> round(previous_price);
--   * Loans are no longer drawn automatically at settlement: a team requests a loan, the Bank Desk approves it and the cash is released.
UPDATE event_config SET auto_loan_on_settlement = false WHERE id = 1;
INSERT INTO schema_migrations(version) VALUES ('010_safety');
