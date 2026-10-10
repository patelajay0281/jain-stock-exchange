-- Known passwords for the automated tests. LOCAL TEST DATABASES ONLY — never run this on staging or production.
-- Applied by `npm run db:local -- testpw` after the API has created the schema.
DO $$
BEGIN
  IF current_setting('jse.allow_test_passwords', true) IS DISTINCT FROM 'on'
     AND inet_server_addr() IS NOT NULL AND host(inet_server_addr()) NOT IN ('127.0.0.1', '::1') THEN
    RAISE EXCEPTION 'test passwords may only be set on a local database';
  END IF;
END $$;

UPDATE app_users u SET password_hash = crypt(v.pw, gen_salt('bf', 4)), failed_logins = 0, locked_until = NULL, must_change_password = false
FROM (VALUES ('ADMIN', 'admin-pass-1'), ('BROKER-01', 'broker-pass-01'), ('PIT-01', 'pit-pass-01'), ('EXCHANGE-01', 'exch-pass-01'),
             ('BANK-01', 'bank-pass-01'), ('INST-01', 'inst-pass-01'), ('TEAM-001', 'team-pass-001'), ('TEAM-002', 'team-pass-002'),
             ('FACULTY-01', 'faculty-pass-1')) AS v(username, pw)
WHERE u.username = v.username;

-- load-test accounts: every team, broker, pit, exchange and bank login gets "<username>-pw" (lower case)
UPDATE app_users SET password_hash = crypt(lower(username) || '-pw', gen_salt('bf', 4)), failed_logins = 0, locked_until = NULL, must_change_password = false
WHERE username NOT IN ('ADMIN', 'BROKER-01', 'PIT-01', 'EXCHANGE-01', 'BANK-01', 'INST-01', 'TEAM-001', 'TEAM-002', 'FACULTY-01');
