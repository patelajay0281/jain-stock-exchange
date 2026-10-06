CREATE TABLE IF NOT EXISTS participant_loans (
 id BIGSERIAL PRIMARY KEY,
 team_id BIGINT NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
 original_principal NUMERIC NOT NULL DEFAULT 500000,
 principal_due NUMERIC NOT NULL DEFAULT 500000,
 interest_rate NUMERIC NOT NULL DEFAULT 0.01,
 interest_due NUMERIC NOT NULL DEFAULT 5000,
 interest_paid NUMERIC NOT NULL DEFAULT 0,
 principal_paid NUMERIC NOT NULL DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'OUTSTANDING',
 created_at TIMESTAMP NOT NULL DEFAULT now(),
 updated_at TIMESTAMP NOT NULL DEFAULT now()
);
INSERT INTO participant_loans (team_id)
SELECT id FROM teams
ON CONFLICT (team_id) DO NOTHING;
UPDATE teams SET total_cash=total_cash+500000, available_cash=available_cash+500000;
UPDATE event_config SET brokerage_rate=0.005,updated_at=now() WHERE id=1;
INSERT INTO cash_ledger (team_id,entry_type,credit,balance_after,note)
SELECT id,'LOAN_DISBURSEMENT',500000,available_cash,'Participant loan disbursement: ₹5,00,000'
FROM teams;