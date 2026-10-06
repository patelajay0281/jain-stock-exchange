-- Loan is a credit limit, not starting cash. Convert untouched legacy starter state.
UPDATE teams t
SET total_cash=2000000, available_cash=2000000
FROM participant_loans l
WHERE l.team_id=t.id
  AND t.total_cash=2500000
  AND t.available_cash=2500000
  AND l.principal_due=500000
  AND l.interest_due=5000;

UPDATE participant_loans
SET original_principal=500000,
    principal_due=0,
    interest_rate=0.01,
    interest_due=0,
    interest_paid=0,
    principal_paid=0,
    status='AVAILABLE',
    updated_at=now()
WHERE principal_due=500000
  AND interest_due=5000
  AND original_principal=500000;