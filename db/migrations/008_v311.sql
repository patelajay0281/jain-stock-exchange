-- JAIN STOCK EXCHANGE (JSE) v311
-- 008_v311.sql: brings any database to the v311 operating model (idempotent — safe to re-run).
--   * broker desks log in as BROKER-01…10; PIT-01…10 become dedicated Pit Manager accounts
--   * IPO identity (IPO-01…04) and sector labels; CMS INDEX bases; one prospectus record per IPO
--   * the curated Indian Knowledge System team-name pool and the first reproducible name assignment
--   * v311 rule values (applied once): ₹25,00,000 maximum order, ₹0 minimum order, no minimum cash buffer

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------
UPDATE app_users u SET username = 'BROKER-' || substring(u.username from 5), display_name = coalesce(b.name, 'Broker ' || substring(u.username from 5)), updated_at = now()
FROM brokers b
WHERE u.role = 'BROKER' AND u.username ~ '^PIT-[0-9]{2}$' AND b.id = u.broker_id
  AND NOT EXISTS (SELECT 1 FROM app_users x WHERE lower(x.username) = lower('BROKER-' || substring(u.username from 5)));

INSERT INTO app_users(username, display_name, role, password_hash)
SELECT 'PIT-' || lpad(n::text, 2, '0'), 'Pit Manager ' || lpad(n::text, 2, '0'), 'PIT_MANAGER', crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf', 6))
FROM generate_series(1, 10) n
ON CONFLICT (lower(username)) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Securities: IPO identity (v311 baseline), sector labels, CMS INDEX base prices
-- ---------------------------------------------------------------------------
UPDATE securities SET ipo_code = v.code, name = v.nm
FROM (VALUES ('VOLTRA', 'IPO-01', 'Voltra Motors Ltd'), ('BLUEAI', 'IPO-02', 'Blue Orbit AI Ltd'),
             ('SHREEB', 'IPO-03', 'Shreebuild Industries Ltd'), ('AAROGYA', 'IPO-04', 'Aarogya Lifesciences Ltd')) AS v(sym, code, nm)
WHERE securities.symbol = v.sym AND securities.kind = 'IPO' AND securities.ipo_code IS NULL;

UPDATE securities SET sector = v.sector
FROM (VALUES
  ('RELIANCE','Energy'),('HDFCBANK','Banking'),('ICICIBANK','Banking'),('INFY','Information Technology'),('TCS','Information Technology'),
  ('BHARTIARTL','Telecom'),('LT','Infrastructure'),('AXISBANK','Banking'),('KOTAKBANK','Banking'),('SBIN','Banking'),
  ('BAJFINANCE','Financial Services'),('MARUTI','Automobile'),('M_M','Automobile'),('TITAN','Consumer Durables'),('ASIANPAINT','Paints & Chemicals'),
  ('ULTRACEMCO','Cement & Materials'),('SUNPHARMA','Pharmaceuticals'),('NTPC','Power'),('POWERGRID','Power'),('TATAMOTORS','Automobile'),
  ('ADANIPORTS','Infrastructure'),('ADANIENT','Diversified'),('JSWSTEEL','Metals'),('HCLTECH','Information Technology'),('TECHM','Information Technology'),
  ('NESTLEIND','FMCG'),('HINDUNILVR','FMCG'),('WIPRO','Information Technology'),('ITC','FMCG'),('ONGC','Energy'),
  ('COALINDIA','Energy'),('BAJAJ-AUTO','Automobile'),('CIPLA','Pharmaceuticals'),('DRREDDY','Pharmaceuticals'),('INDUSINDBK','Banking'),
  ('TATASTEEL','Metals'),('EICHERMOT','Automobile'),('APOLLOHOSP','Healthcare'),('TRENT','Retail'),('BEL','Defence'),
  ('BHARATFORG','Capital Goods'),('DLF','Real Estate'),('GRASIM','Cement & Materials'),('DIVISLAB','Pharmaceuticals'),('SIEMENS','Capital Goods'),
  ('PIDILITE','Paints & Chemicals'),('SHRIRAMFIN','Financial Services'),('HINDALCO','Metals'),('ETERNAL','Internet & Consumer Tech'),('INDIGO','Aviation')
) AS v(sym, sector)
WHERE securities.symbol = v.sym AND securities.kind = 'EQUITY' AND securities.sector IS NULL;

UPDATE securities SET index_base_price = base_price WHERE kind = 'EQUITY' AND index_base_price IS NULL;
UPDATE securities SET index_base_price = coalesce(listing_price, price) WHERE kind = 'IPO' AND listed_at IS NOT NULL AND index_base_price IS NULL;
UPDATE securities SET index_base_price = NULL WHERE kind = 'IPO' AND listed_at IS NULL AND index_base_price IS NOT NULL;

INSERT INTO ipo_prospectus(security_id) SELECT id FROM securities WHERE kind = 'IPO' ON CONFLICT (security_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Curated Indian Knowledge System team-name pool (122 unique names)
-- ---------------------------------------------------------------------------
INSERT INTO team_name_pool(name, category, meaning) VALUES
  ('Aryabhata', 'Mathematics & Astronomy', '5th-century mathematician-astronomer, author of the Aryabhatiya'),
  ('Brahmagupta', 'Mathematics & Astronomy', '7th-century mathematician who set out rules for computing with zero'),
  ('Bhaskaracharya', 'Mathematics & Astronomy', '12th-century mathematician-astronomer, author of Lilavati and Siddhanta Shiromani'),
  ('Varahamihira', 'Mathematics & Astronomy', '6th-century astronomer, author of the Pancha Siddhantika'),
  ('Madhava', 'Mathematics & Astronomy', '14th-century founder of the Kerala school, pioneer of infinite series'),
  ('Nilakantha', 'Mathematics & Astronomy', 'Nilakantha Somayaji, Kerala astronomer and author of the Tantrasangraha'),
  ('Baudhayana', 'Mathematics & Astronomy', 'Author of the Baudhayana Shulba Sutra on geometry'),
  ('Apastamba', 'Mathematics & Astronomy', 'Author of a Shulba Sutra on geometric constructions'),
  ('Pingala', 'Mathematics & Astronomy', 'Ancient prosodist whose Chandahshastra used binary-like patterns'),
  ('Mahaviracharya', 'Mathematics & Astronomy', '9th-century mathematician, author of the Ganita Sara Sangraha'),
  ('Sridhara', 'Mathematics & Astronomy', 'Mathematician, author of the Patiganita and the Trishatika'),
  ('Lalla', 'Mathematics & Astronomy', '8th-century astronomer, author of the Shishyadhivriddhida'),
  ('Jyeshthadeva', 'Mathematics & Astronomy', 'Kerala-school author of the Yuktibhasha, a book of mathematical rationale'),
  ('Parameshvara', 'Mathematics & Astronomy', 'Kerala-school astronomer who devised the Drigganita system'),
  ('Achyuta Pisharati', 'Mathematics & Astronomy', '16th–17th-century astronomer of the Kerala school'),
  ('Shankara Variyar', 'Mathematics & Astronomy', 'Kerala-school mathematician and commentator'),
  ('Virahanka', 'Mathematics & Astronomy', 'Prosodist who described the number sequence later called Fibonacci numbers'),
  ('Halayudha', 'Mathematics & Astronomy', '10th-century commentator on Pingala who described the Meru Prastara'),
  ('Vateshvara', 'Mathematics & Astronomy', '10th-century astronomer, author of the Vateshvara Siddhanta'),
  ('Munjala', 'Mathematics & Astronomy', '10th-century astronomer, author of the Laghumanasa'),
  ('Sripati', 'Mathematics & Astronomy', '11th-century astronomer-mathematician, author of the Siddhanta Shekhara'),
  ('Narayana Pandita', 'Mathematics & Astronomy', '14th-century mathematician, author of the Ganita Kaumudi'),
  ('Kamalakara', 'Mathematics & Astronomy', '17th-century astronomer, author of the Siddhanta Tattva Viveka'),
  ('Jagannatha Samrat', 'Mathematics & Astronomy', '18th-century astronomer at Jaipur, author of the Samrat Siddhanta'),
  ('Jantar Mantar', 'Mathematics & Astronomy', 'The 18th-century astronomical observatories built by Sawai Jai Singh II'),
  ('Hemachandra', 'Mathematics & Astronomy', '12th-century polymath who also described the Fibonacci-type sequence'),
  ('Charaka', 'Medicine & Life Sciences', 'Physician of the Charaka Samhita, a foundational text of Ayurveda'),
  ('Sushruta', 'Medicine & Life Sciences', 'Physician-surgeon of the Sushruta Samhita on surgery'),
  ('Vagbhata', 'Medicine & Life Sciences', 'Author of the Ashtanga Hridaya, a classic of Ayurveda'),
  ('Jivaka', 'Medicine & Life Sciences', 'Renowned physician of ancient India'),
  ('Ayurveda', 'Medicine & Life Sciences', 'The traditional Indian science of life and health'),
  ('Panini', 'Language & Grammar', 'Grammarian, author of the Ashtadhyayi'),
  ('Patanjali', 'Language & Grammar', 'Author of the Mahabhashya on grammar and of the Yoga Sutras'),
  ('Yaska', 'Language & Grammar', 'Author of the Nirukta, the classical study of etymology'),
  ('Bhartrihari', 'Language & Grammar', 'Philosopher of language, author of the Vakyapadiya'),
  ('Tolkappiyar', 'Language & Grammar', 'Author of the Tolkappiyam, the earliest Tamil grammar'),
  ('Kanada', 'Philosophy & Logic', 'Founder of the Vaisheshika school and its atomic theory'),
  ('Akshapada', 'Philosophy & Logic', 'Akshapada Gautama, author of the Nyaya Sutras on logic'),
  ('Kapila', 'Philosophy & Logic', 'Founder of the Samkhya school of philosophy'),
  ('Jaimini', 'Philosophy & Logic', 'Author of the Mimamsa Sutras'),
  ('Badarayana', 'Philosophy & Logic', 'Author of the Brahma Sutras'),
  ('Nagarjuna', 'Philosophy & Logic', '2nd-century philosopher of the Madhyamaka school'),
  ('Aryadeva', 'Philosophy & Logic', 'Philosopher and student of Nagarjuna'),
  ('Vasubandhu', 'Philosophy & Logic', '4th–5th-century philosopher and logician'),
  ('Dignaga', 'Philosophy & Logic', 'Founder of the Buddhist tradition of logic and epistemology'),
  ('Dharmakirti', 'Philosophy & Logic', '7th-century logician and philosopher'),
  ('Shantarakshita', 'Philosophy & Logic', '8th-century philosopher and scholar of Nalanda'),
  ('Nyaya', 'Philosophy & Logic', 'The school of logic and valid reasoning'),
  ('Vaisheshika', 'Philosophy & Logic', 'The school of natural philosophy and atomism'),
  ('Samkhya', 'Philosophy & Logic', 'The enumerative school of philosophy'),
  ('Mimamsa', 'Philosophy & Logic', 'The school of exegesis and interpretation'),
  ('Anvikshiki', 'Philosophy & Logic', 'The science of inquiry, as named in the Arthashastra'),
  ('Tarka', 'Philosophy & Logic', 'Reasoning and argumentation'),
  ('Pramana', 'Philosophy & Logic', 'The means of valid knowledge'),
  ('Kautilya', 'Economics & Statecraft', 'Author of the Arthashastra on economics and statecraft'),
  ('Arthashastra', 'Economics & Statecraft', 'The classical treatise on economics, administration and statecraft'),
  ('Kamandaka', 'Economics & Statecraft', 'Author of the Nitisara on polity'),
  ('Vidura', 'Economics & Statecraft', 'Counsellor known for the Vidura Niti on ethics and governance'),
  ('Thiruvalluvar', 'Economics & Statecraft', 'Poet-philosopher, author of the Thirukkural'),
  ('Gargi', 'Women Scholars', 'Gargi Vachaknavi, philosopher of the Upanishadic debates'),
  ('Maitreyi', 'Women Scholars', 'Philosopher in the Brihadaranyaka Upanishad'),
  ('Lopamudra', 'Women Scholars', 'Seer-poet of the Rigveda'),
  ('Ghosha', 'Women Scholars', 'Seer-poet of the Rigveda'),
  ('Apala', 'Women Scholars', 'Seer-poet of the Rigveda'),
  ('Avvaiyar', 'Women Scholars', 'Celebrated Tamil poet and philosopher'),
  ('Khana', 'Women Scholars', 'Legendary poet of agricultural and astronomical sayings (Khanar Vachan)'),
  ('Ubhaya Bharati', 'Women Scholars', 'Scholar who judged the celebrated Shankara–Mandana debate'),
  ('Natyashastra', 'Arts, Music & Architecture', 'Bharata''s treatise on drama, dance and music'),
  ('Sangita', 'Arts, Music & Architecture', 'Music, as codified in the Sangita Ratnakara'),
  ('Sharngadeva', 'Arts, Music & Architecture', '13th-century author of the Sangita Ratnakara'),
  ('Matanga', 'Arts, Music & Architecture', 'Author of the Brihaddeshi on music'),
  ('Vastu', 'Arts, Music & Architecture', 'Vastu Shastra, the traditional science of architecture'),
  ('Shilpa', 'Arts, Music & Architecture', 'Shilpa Shastra, the science of arts and crafts'),
  ('Mayamata', 'Arts, Music & Architecture', 'Classical treatise on architecture and town planning'),
  ('Manasara', 'Arts, Music & Architecture', 'Classical treatise on architecture and sculpture'),
  ('Rasa', 'Arts, Music & Architecture', 'The aesthetic essence described in the Natyashastra'),
  ('Abhinavagupta', 'Arts, Music & Architecture', '10th–11th-century philosopher of aesthetics'),
  ('Kalidasa', 'Literature & Poetics', 'Classical poet and dramatist'),
  ('Banabhatta', 'Literature & Poetics', '7th-century author of the Harshacharita and Kadambari'),
  ('Dandin', 'Literature & Poetics', 'Author of the Kavyadarsha on poetics'),
  ('Bhamaha', 'Literature & Poetics', 'Early theorist of poetics, author of the Kavyalankara'),
  ('Anandavardhana', 'Literature & Poetics', '9th-century author of the Dhvanyaloka'),
  ('Panchatantra', 'Literature & Poetics', 'The classic collection of fables on practical wisdom'),
  ('Hitopadesha', 'Literature & Poetics', 'The classic book of fables on good counsel'),
  ('Takshashila', 'Centres of Learning', 'Ancient centre of learning in the north-west'),
  ('Nalanda', 'Centres of Learning', 'Ancient university in Bihar'),
  ('Vikramashila', 'Centres of Learning', 'Ancient university in Bihar'),
  ('Valabhi', 'Centres of Learning', 'Ancient centre of learning in Gujarat'),
  ('Odantapuri', 'Centres of Learning', 'Ancient university in Bihar'),
  ('Jagaddala', 'Centres of Learning', 'Ancient university in Bengal'),
  ('Somapura', 'Centres of Learning', 'Somapura Mahavihara, ancient centre of learning in Bengal'),
  ('Pushpagiri', 'Centres of Learning', 'Ancient university in Odisha'),
  ('Ujjayini', 'Centres of Learning', 'Astronomical centre whose meridian anchored classical Indian astronomy'),
  ('Kanchi', 'Centres of Learning', 'Kanchipuram, a historic centre of learning in Tamil Nadu'),
  ('Mithila', 'Centres of Learning', 'Historic centre of Nyaya learning'),
  ('Sharada Peetha', 'Centres of Learning', 'Historic centre of learning in Kashmir'),
  ('Shunya', 'Mathematical Concepts', 'Zero, as a number and as a place-holder'),
  ('Ananta', 'Mathematical Concepts', 'Infinity'),
  ('Ganita', 'Mathematical Concepts', 'Mathematics'),
  ('Bijaganita', 'Mathematical Concepts', 'Algebra'),
  ('Rekhaganita', 'Mathematical Concepts', 'Geometry'),
  ('Kuttaka', 'Mathematical Concepts', 'The pulveriser algorithm for indeterminate equations'),
  ('Chakravala', 'Mathematical Concepts', 'The cyclic method for quadratic indeterminate equations'),
  ('Jya', 'Mathematical Concepts', 'The sine function of Indian trigonometry'),
  ('Meru Prastara', 'Mathematical Concepts', 'The triangular number array known today as Pascal''s triangle'),
  ('Siddhanta', 'Mathematical Concepts', 'The genre of comprehensive astronomical treatises'),
  ('Karana', 'Mathematical Concepts', 'The genre of practical astronomical handbooks'),
  ('Yukti', 'Mathematical Concepts', 'Rationale and demonstration'),
  ('Shiksha', 'Vedangas & Disciplines', 'Phonetics, one of the six Vedangas'),
  ('Vyakarana', 'Vedangas & Disciplines', 'Grammar, one of the six Vedangas'),
  ('Nirukta', 'Vedangas & Disciplines', 'Etymology, one of the six Vedangas'),
  ('Chandas', 'Vedangas & Disciplines', 'Prosody, one of the six Vedangas'),
  ('Jyotisha', 'Vedangas & Disciplines', 'Astronomy and timekeeping, one of the six Vedangas'),
  ('Kalpa', 'Vedangas & Disciplines', 'Procedure manuals, one of the six Vedangas'),
  ('Prajna', 'Qualities of the Learner', 'Wisdom'),
  ('Medha', 'Qualities of the Learner', 'Intellect'),
  ('Viveka', 'Qualities of the Learner', 'Discernment'),
  ('Dhriti', 'Qualities of the Learner', 'Fortitude'),
  ('Sankalpa', 'Qualities of the Learner', 'Resolve'),
  ('Abhyasa', 'Qualities of the Learner', 'Disciplined practice'),
  ('Utsaha', 'Qualities of the Learner', 'Enthusiasm'),
  ('Nishtha', 'Qualities of the Learner', 'Commitment')
ON CONFLICT (lower(name)) DO NOTHING;

-- ---------------------------------------------------------------------------
-- v311 rule values (applied once; later edits in Rules & Configuration are kept)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '008_v311_defaults') THEN
    UPDATE event_config SET max_order_value = 2500000, min_order_value = 0, min_cash_buffer = 0, participant_order_entry = false,
           updated_at = now(), updated_by = 'v311 upgrade' WHERE id = 1;
    INSERT INTO schema_migrations (version) VALUES ('008_v311_defaults');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- First team-name assignment (reproducible: seed + pool → same names); the admin may re-randomize before START
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF (SELECT team_names_assigned_at FROM event_config WHERE id = 1) IS NULL THEN
    PERFORM jse__assign_team_names('{"username":"SYSTEM","role":"SYSTEM"}'::jsonb, 'JSE-DALAL-STREET-2026');
  END IF;
END $$;

INSERT INTO schema_migrations(version) VALUES ('008_v311');
