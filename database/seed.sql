-- JAIN STOCK EXCHANGE — Phase 1 seed data
-- Safe to re-run: existing editable rows are preserved.

BEGIN;

-- 10 broker desks.
INSERT INTO brokers (code, display_name)
SELECT
  'BROKER-' || LPAD(n::TEXT, 2, '0'),
  'BROKER-' || LPAD(n::TEXT, 2, '0')
FROM generate_series(1, 10) AS g(n)
ON CONFLICT (code) DO NOTHING;

-- One institutional desk required by the event.
INSERT INTO institutions (
  code, name, initial_cash_paise, cash_paise
)
SELECT
  'INST-01',
  'Institutional Investor',
  2000000000,
  2000000000
WHERE NOT EXISTS (
  SELECT 1 FROM institutions WHERE code = 'INST-01'
);

UPDATE institutions SET initial_cash_paise=2000000000,cash_paise=2000000000 WHERE code='INST-01';

-- Exactly 100 participant teams. Broker assignment cycles 01..10, ten teams per broker.
INSERT INTO teams (
  code,
  broker_id,
  base_capital_paise,
  cash_paise,
  peak_own_capital_used_paise,
  minimum_cash_paise
)
SELECT
  'TEAM-' || LPAD(n::TEXT, 3, '0'),
  b.id,
  s.base_capital_paise,
  s.base_capital_paise,
  0,
  s.minimum_cash_buffer_paise
FROM generate_series(1, 100) AS g(n)
CROSS JOIN event_settings s
JOIN brokers b
  ON b.code = 'BROKER-' || LPAD((((n - 1) % 10) + 1)::TEXT, 2, '0')
WHERE NOT EXISTS (
  SELECT 1
  FROM teams t
  WHERE t.code = 'TEAM-' || LPAD(n::TEXT, 3, '0')
);

-- Seed the participant cash ledger so every team's cached cash reconciles from day one.
INSERT INTO cash_ledger (
  team_id,
  entry_type,
  debit_paise,
  credit_paise,
  balance_after_paise,
  note
)
SELECT
  t.id,
  'INITIAL_CAPITAL',
  0,
  t.base_capital_paise,
  t.base_capital_paise,
  'Initial event allocation'
FROM teams t
WHERE NOT EXISTS (
  SELECT 1
  FROM cash_ledger c
  WHERE c.team_id = t.id
    AND c.entry_type = 'INITIAL_CAPITAL'
);

-- Seed the institutional cash ledger.
INSERT INTO institution_cash_ledger (
  institution_id,
  entry_type,
  debit_paise,
  credit_paise,
  balance_after_paise,
  note
)
SELECT
  i.id,
  'INITIAL_CAPITAL',
  0,
  i.initial_cash_paise,
  i.initial_cash_paise,
  'Initial institutional allocation'
FROM institutions i
WHERE NOT EXISTS (
  SELECT 1
  FROM institution_cash_ledger c
  WHERE c.institution_id = i.id
    AND c.entry_type = 'INITIAL_CAPITAL'
);

-- IPOs appear first in the Market Wall.
INSERT INTO assets (
  symbol,
  name,
  type,
  base_price_paise,
  current_price_paise,
  previous_price_paise,
  lot_size,
  display_order
)
VALUES
  ('VOLTRA',  'Voltra Motors',        'IPO', 89000,  89000,  89000, 50, 1),
  ('BLUEAI',  'Blue Orbit AI',        'IPO', 78000,  78000,  78000, 50, 2),
  ('SHREEB',  'Shreebuild Infra',     'IPO', 62000,  62000,  62000, 50, 3),
  ('AAROGYA', 'Aarogya Lifesciences', 'IPO', 71000,  71000,  71000, 50, 4)
ON CONFLICT (symbol) DO NOTHING;

-- Listed stocks. The first 40 prices follow the requested event base prices.
-- The remaining ten use editable simulation prices.
INSERT INTO assets (
  symbol,
  name,
  type,
  base_price_paise,
  current_price_paise,
  previous_price_paise,
  lot_size,
  display_order
)
VALUES
  ('ASIANPAINT', 'Asian Paints',              'LISTED_STOCK', 196000, 196000, 196000, 50, 10),
  ('SHRIRAMFIN', 'Shriram Finance',            'LISTED_STOCK',  97600,  97600,  97600, 50, 11),
  ('HINDUNILVR', 'Hindustan Unilever',         'LISTED_STOCK', 170600, 170600, 170600, 50, 12),
  ('ULTRACEMCO', 'UltraTech Cement',           'LISTED_STOCK', 497700, 497700, 497700, 50, 13),
  ('BHARATFORG', 'Bharat Forge',              'LISTED_STOCK', 112400, 112400, 112400, 50, 14),
  ('BEL',        'BEL',                        'LISTED_STOCK',  40000,  40000,  40000, 50, 15),
  ('TATASTEEL',  'Tata Steel',                'LISTED_STOCK',  17900,  17900,  17900, 50, 16),
  ('CIPLA',      'Cipla',                      'LISTED_STOCK', 124600, 124600, 124600, 50, 17),
  ('ICICIBANK',  'ICICI Bank',                'LISTED_STOCK', 117200, 117200, 117200, 50, 18),
  ('ADANIENT',   'Adani Enterprises',         'LISTED_STOCK', 229000, 229000, 229000, 50, 19),
  ('M_M',        'Mahindra & Mahindra',       'LISTED_STOCK', 242600, 242600, 242600, 50, 20),
  ('LT',         'Larsen & Toubro',            'LISTED_STOCK', 289800, 289800, 289800, 50, 21),
  ('GRASIM',     'Grasim',                    'LISTED_STOCK', 242000, 242000, 242000, 50, 22),
  ('COALINDIA',  'Coal India',                'LISTED_STOCK',  40000,  40000,  40000, 50, 23),
  ('JSWSTEEL',   'JSW Steel',                 'LISTED_STOCK', 113700, 113700, 113700, 50, 24),
  ('NTPC',       'NTPC',                      'LISTED_STOCK',  32100,  32100,  32100, 50, 25),
  ('DIVISLAB',   'Divi''s Laboratories',      'LISTED_STOCK', 349900, 349900, 349900, 50, 26),
  ('BAJFINANCE', 'Bajaj Finance',             'LISTED_STOCK',  98400,  98400,  98400, 50, 27),
  ('INDUSINDBK', 'IndusInd Bank',             'LISTED_STOCK',  91000,  91000,  91000, 50, 28),
  ('HDFCBANK',   'HDFC Bank',                 'LISTED_STOCK',  71900,  71900,  71900, 50, 29),
  ('KOTAKBANK',  'Kotak Mahindra Bank',       'LISTED_STOCK',  40200,  40200,  40200, 50, 30),
  ('POWERGRID',  'Power Grid',                'LISTED_STOCK',  26200,  26200,  26200, 50, 31),
  ('HCLTECH',    'HCL Technologies',          'LISTED_STOCK', 112600, 112600, 112600, 50, 32),
  ('INFY',       'Infosys',                   'LISTED_STOCK',  90000,  90000,  90000, 50, 33),
  ('DLF',        'DLF',                       'LISTED_STOCK',  80000,  80000,  80000, 50, 34),
  ('ETERNAL',    'Zomato (Eternal)',           'LISTED_STOCK',  33100,  33100,  33100, 50, 35),
  ('ITC',        'ITC',                       'LISTED_STOCK',  26500,  26500,  26500, 50, 36),
  ('WIPRO',      'Wipro',                    'LISTED_STOCK',  32000,  32000,  32000, 50, 37),
  ('ONGC',       'ONGC',                      'LISTED_STOCK',  23100,  23100,  23100, 50, 37),
  ('TCS',        'TCS',                       'LISTED_STOCK', 186400, 186400, 186400, 50, 38),
  ('AXISBANK',   'Axis Bank',                 'LISTED_STOCK', 108900, 108900, 108900, 50, 39),
  ('BAJAJ-AUTO', 'Bajaj Auto',               'LISTED_STOCK', 505000, 505000, 505000, 50, 40),
  ('TITAN',      'Titan',                     'LISTED_STOCK', 349900, 349900, 349900, 50, 41),
  ('TATAMOTORS', 'Tata Motors',               'LISTED_STOCK',  79300,  79300,  79300, 50, 42),
  ('SBIN',       'SBI',                       'LISTED_STOCK',  96200,  96200,  96200, 50, 43),
  ('SIEMENS',    'Siemens India',             'LISTED_STOCK', 359900, 359900, 359900, 50, 44),
  ('SUNPHARMA',  'Sun Pharma',                'LISTED_STOCK', 165400, 165400, 165400, 50, 45),
  ('EICHERMOT',  'Eicher Motors',             'LISTED_STOCK', 448000, 448000, 448000, 50, 46),
  ('TECHM',      'Tech Mahindra',             'LISTED_STOCK', 138800, 138800, 138800, 50, 47),
  ('HINDALCO',   'Hindalco',                  'LISTED_STOCK',  95600,  95600,  95600, 50, 48),
  ('TRENT',      'Trent',                     'LISTED_STOCK', 212800, 212800, 212800, 50, 49),
  ('APOLLOHOSP', 'Apollo Hospitals',          'LISTED_STOCK', 670000, 670000, 670000, 50, 50),
  ('DRREDDY',    'Dr. Reddy''s',              'LISTED_STOCK', 620000, 620000, 620000, 50, 51),
  ('BHARTIARTL', 'Bharti Airtel',             'LISTED_STOCK', 185000, 185000, 185000, 50, 52),
  ('ADANIPORTS', 'Adani Ports',               'LISTED_STOCK', 145000, 145000, 145000, 50, 53),
  ('RELIANCE',   'Reliance Industries',       'LISTED_STOCK', 289000, 289000, 289000, 50, 54),
  ('MARUTI',     'Maruti Suzuki',             'LISTED_STOCK',1320000,1320000,1320000, 50, 55),
  ('NESTLEIND',  'Nestle India',              'LISTED_STOCK', 230000, 230000, 230000, 50, 56),
  ('PIDILITE',   'Pidilite Industries',       'LISTED_STOCK', 360000, 360000, 360000, 50, 57),
  ('INDIGO',     'InterGlobe Aviation',       'LISTED_STOCK', 480000, 480000, 480000, 50, 58)
ON CONFLICT (symbol) DO NOTHING;

-- Canonical customer stock order: matches Stock List(3).docx exactly.
UPDATE assets SET display_order=CASE symbol
WHEN 'RELIANCE' THEN 10 WHEN 'HDFCBANK' THEN 11 WHEN 'ICICIBANK' THEN 12 WHEN 'INFY' THEN 13 WHEN 'TCS' THEN 14
WHEN 'BHARTIARTL' THEN 15 WHEN 'LT' THEN 16 WHEN 'AXISBANK' THEN 17 WHEN 'KOTAKBANK' THEN 18 WHEN 'SBIN' THEN 19
WHEN 'BAJFINANCE' THEN 20 WHEN 'MARUTI' THEN 21 WHEN 'M_M' THEN 22 WHEN 'TITAN' THEN 23 WHEN 'ASIANPAINT' THEN 24
WHEN 'ULTRACEMCO' THEN 25 WHEN 'SUNPHARMA' THEN 26 WHEN 'NTPC' THEN 27 WHEN 'POWERGRID' THEN 28 WHEN 'TATAMOTORS' THEN 29
WHEN 'ADANIPORTS' THEN 30 WHEN 'ADANIENT' THEN 31 WHEN 'JSWSTEEL' THEN 32 WHEN 'HCLTECH' THEN 33 WHEN 'TECHM' THEN 34
WHEN 'NESTLEIND' THEN 35 WHEN 'HINDUNILVR' THEN 36 WHEN 'WIPRO' THEN 37 WHEN 'ITC' THEN 38 WHEN 'ONGC' THEN 39
WHEN 'COALINDIA' THEN 40 WHEN 'BAJAJ-AUTO' THEN 41 WHEN 'CIPLA' THEN 42 WHEN 'DRREDDY' THEN 43 WHEN 'INDUSINDBK' THEN 44
WHEN 'TATASTEEL' THEN 45 WHEN 'EICHERMOT' THEN 46 WHEN 'APOLLOHOSP' THEN 47 WHEN 'TRENT' THEN 48 WHEN 'BEL' THEN 49
WHEN 'BHARATFORG' THEN 50 WHEN 'DLF' THEN 51 WHEN 'GRASIM' THEN 52 WHEN 'DIVISLAB' THEN 53 WHEN 'SIEMENS' THEN 54
WHEN 'PIDILITE' THEN 55 WHEN 'SHRIRAMFIN' THEN 56 WHEN 'HINDALCO' THEN 57 WHEN 'ETERNAL' THEN 58 WHEN 'INDIGO' THEN 59
ELSE display_order END,
name=CASE WHEN symbol='NESTLEIND' THEN 'Nestlé India' ELSE name END
WHERE type='LISTED_STOCK';

-- Internal JSE staff accounts. Customer teams are not application users.
INSERT INTO users(email,display_name,role,username,is_active)
SELECT 'admin@jse.local','JSE Administrator','ADMIN','ADMINAP',true
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.username)=lower('ADMINAP'));

INSERT INTO users(email,display_name,role,username,is_active)
SELECT 'associate-admin@jse.local','Associate Administrator','ASSOCIATE_ADMIN','ASSOC-ADMIN',true
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.username)=lower('ASSOC-ADMIN'));

INSERT INTO users(email,display_name,role,username,is_active)
SELECT 'pit-manager-'||lpad(n::text,2,'0')||'@jse.local','Pit Manager '||lpad(n::text,2,'0'),'PIT_MANAGER','PIT-'||lpad(n::text,2,'0'),true
FROM generate_series(1,10) n
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.username)=lower('PIT-'||lpad(n::text,2,'0')));

INSERT INTO users(email,display_name,role,username,is_active)
SELECT 'exchange-'||lpad(n::text,2,'0')||'@jse.local','Exchange '||lpad(n::text,2,'0'),'EXCHANGE','EXCHANGE-'||lpad(n::text,2,'0'),true
FROM generate_series(1,4) n
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.username)=lower('EXCHANGE-'||lpad(n::text,2,'0')));

INSERT INTO users(email,display_name,role,username,is_active)
SELECT 'bank-'||lpad(n::text,2,'0')||'@jse.local','Bank '||lpad(n::text,2,'0'),'BANK','BANK-'||lpad(n::text,2,'0'),true
FROM generate_series(1,4) n
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.username)=lower('BANK-'||lpad(n::text,2,'0')));

INSERT INTO users(email,display_name,role,username,institution_id,is_active)
SELECT 'institution-'||lpad(n::text,2,'0')||'@jse.local','Institutional Investor '||lpad(n::text,2,'0'),'INSTITUTION','INST-'||lpad(n::text,2,'0'),
       (SELECT id FROM institutions WHERE code='INST-01' LIMIT 1),true
FROM generate_series(1,4) n
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.username)=lower('INST-'||lpad(n::text,2,'0')));

UPDATE users SET is_active=false,updated_at=now() WHERE role='PARTICIPANT';

INSERT INTO event_state (id, status)
VALUES (1, 'NOT_STARTED')
ON CONFLICT (id) DO NOTHING;

COMMIT;
