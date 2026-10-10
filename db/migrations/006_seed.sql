-- JAIN STOCK EXCHANGE (JSE) v311
-- 006_seed.sql: event configuration, 10 brokers, 100 teams, 50 stocks, 4 IPOs, the institutional
-- account and staff / participant accounts (fresh installs; 008_v311 brings older databases to the same state). Idempotent. Accounts start with random unknown passwords;
-- the administrator issues real passwords with jse_admin_users(RESET_ROLE_PASSWORDS).

INSERT INTO event_config(id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO event_control(id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO brokers(code, name)
SELECT 'BROKER-' || lpad(n::text, 2, '0'), 'Broker ' || lpad(n::text, 2, '0') FROM generate_series(1, 10) n
ON CONFLICT (code) DO NOTHING;

INSERT INTO teams(code, name, broker_id, cash)
SELECT 'TEAM-' || lpad(n::text, 3, '0'), 'Team ' || lpad(n::text, 3, '0'),
       (SELECT id FROM brokers WHERE code = 'BROKER-' || lpad((((n - 1) % 10) + 1)::text, 2, '0')),
       (SELECT initial_capital FROM event_config WHERE id = 1)
FROM generate_series(1, 100) n
ON CONFLICT (code) DO NOTHING;

INSERT INTO loans(team_id) SELECT id FROM teams ON CONFLICT (team_id) DO NOTHING;

INSERT INTO institutions(code, name, initial_cash, cash)
SELECT 'INST-01', 'JSE Institutional Investors', institutional_cash, institutional_cash FROM event_config WHERE id = 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO securities(kind, symbol, ipo_code, name, sector, base_price, price, previous_price, lot_size, display_order) VALUES
  ('IPO', 'VOLTRA',  'IPO-01', 'Voltra Motors Ltd',          'Electric Vehicles', 890, 890, 890, 50, 1),
  ('IPO', 'BLUEAI',  'IPO-02', 'Blue Orbit AI Ltd',          'Technology',        780, 780, 780, 50, 2),
  ('IPO', 'SHREEB',  'IPO-03', 'Shreebuild Industries Ltd',  'Infrastructure',    620, 620, 620, 50, 3),
  ('IPO', 'AAROGYA', 'IPO-04', 'Aarogya Lifesciences Ltd',   'Healthcare',        710, 710, 710, 50, 4)
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO securities(kind, symbol, name, base_price, price, previous_price, index_base_price, lot_size, display_order)
SELECT 'EQUITY', v.sym, v.nm, v.px, v.px, v.px, v.px, 50, v.ord FROM (VALUES
  ('RELIANCE','Reliance Industries',2890,10),('HDFCBANK','HDFC Bank',719,11),('ICICIBANK','ICICI Bank',1172,12),('INFY','Infosys',900,13),
  ('TCS','TCS',1864,14),('BHARTIARTL','Bharti Airtel',1850,15),('LT','Larsen & Toubro',2898,16),('AXISBANK','Axis Bank',1089,17),
  ('KOTAKBANK','Kotak Mahindra Bank',402,18),('SBIN','SBI',962,19),('BAJFINANCE','Bajaj Finance',984,20),('MARUTI','Maruti Suzuki',13200,21),
  ('M_M','Mahindra & Mahindra',2426,22),('TITAN','Titan',3499,23),('ASIANPAINT','Asian Paints',1960,24),('ULTRACEMCO','UltraTech Cement',4977,25),
  ('SUNPHARMA','Sun Pharma',1654,26),('NTPC','NTPC',321,27),('POWERGRID','Power Grid',262,28),('TATAMOTORS','Tata Motors',793,29),
  ('ADANIPORTS','Adani Ports',1450,30),('ADANIENT','Adani Enterprises',2290,31),('JSWSTEEL','JSW Steel',1137,32),('HCLTECH','HCL Technologies',1126,33),
  ('TECHM','Tech Mahindra',1388,34),('NESTLEIND','Nestlé India',2300,35),('HINDUNILVR','Hindustan Unilever',1706,36),('WIPRO','Wipro',320,37),
  ('ITC','ITC',265,38),('ONGC','ONGC',231,39),('COALINDIA','Coal India',400,40),('BAJAJ-AUTO','Bajaj Auto',5050,41),
  ('CIPLA','Cipla',1246,42),('DRREDDY','Dr. Reddy''s',6200,43),('INDUSINDBK','IndusInd Bank',910,44),('TATASTEEL','Tata Steel',179,45),
  ('EICHERMOT','Eicher Motors',4480,46),('APOLLOHOSP','Apollo Hospitals',6700,47),('TRENT','Trent',2128,48),('BEL','BEL',400,49),
  ('BHARATFORG','Bharat Forge',1124,50),('DLF','DLF',800,51),('GRASIM','Grasim',2420,52),('DIVISLAB','Divi''s Laboratories',3499,53),
  ('SIEMENS','Siemens India',3599,54),('PIDILITE','Pidilite Industries',3600,55),('SHRIRAMFIN','Shriram Finance',976,56),('HINDALCO','Hindalco',956,57),
  ('ETERNAL','Zomato (Eternal)',331,58),('INDIGO','InterGlobe Aviation',4800,59)
) AS v(sym, nm, px, ord)
ON CONFLICT (symbol) DO NOTHING;

-- opening ledger entries (only once)
INSERT INTO cash_ledger(team_id, entry_type, credit, balance_after, note, actor_name)
SELECT t.id, 'INITIAL_CAPITAL', t.cash, t.cash, 'Initial event capital', 'system' FROM teams t
WHERE NOT EXISTS (SELECT 1 FROM cash_ledger c WHERE c.team_id = t.id);
INSERT INTO institution_ledger(institution_id, entry_type, credit, balance_after, note, actor_name)
SELECT i.id, 'INITIAL_CAPITAL', i.cash, i.cash, 'Initial institutional cash', 'system' FROM institutions i
WHERE NOT EXISTS (SELECT 1 FROM institution_ledger l WHERE l.institution_id = i.id);

-- accounts (random unknown passwords until the administrator issues credentials)
INSERT INTO app_users(username, display_name, role, password_hash)
SELECT v.u, v.n, v.r, crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6)) FROM (VALUES
  ('ADMIN', 'Event Administrator', 'ADMIN'), ('ASSOC-ADMIN', 'Associate Administrator', 'ADMIN'),
  ('FACULTY-01', 'Faculty Viewer 01', 'VIEWER'), ('FACULTY-02', 'Faculty Viewer 02', 'VIEWER')
) AS v(u, n, r)
ON CONFLICT (lower(username)) DO NOTHING;

-- broker desks (one login per broker) and the Pit Managers who execute broker-submitted orders
INSERT INTO app_users(username, display_name, role, broker_id, password_hash)
SELECT 'BROKER-' || lpad(n::text, 2, '0'), 'Broker ' || lpad(n::text, 2, '0'), 'BROKER',
       (SELECT id FROM brokers WHERE code = 'BROKER-' || lpad(n::text, 2, '0')), crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 10) n
ON CONFLICT (lower(username)) DO NOTHING;
INSERT INTO app_users(username, display_name, role, password_hash)
SELECT 'PIT-' || lpad(n::text, 2, '0'), 'Pit Manager ' || lpad(n::text, 2, '0'), 'PIT_MANAGER', crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 10) n
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO app_users(username, display_name, role, password_hash)
SELECT r || '-' || lpad(n::text, 2, '0'), initcap(r) || ' Desk ' || lpad(n::text, 2, '0'), r, crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 4) n, (VALUES ('EXCHANGE'), ('BANK')) AS x(r)
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO app_users(username, display_name, role, institution_id, password_hash)
SELECT 'INST-' || lpad(n::text, 2, '0'), 'Institutional Investor ' || lpad(n::text, 2, '0'), 'INSTITUTIONAL',
       (SELECT id FROM institutions WHERE code = 'INST-01'), crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 4) n
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO app_users(username, display_name, role, team_id, password_hash)
SELECT t.code, t.name, 'PARTICIPANT', t.id, crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6)) FROM teams t
ON CONFLICT (lower(username)) DO NOTHING;

INSERT INTO schema_migrations(version) VALUES ('006_seed');
