-- JAIN STOCK EXCHANGE — institutional cash is unrestricted and may temporarily go negative
-- Institution buys are explicitly exempt from cash-limit checks.
ALTER TABLE public.institutions DROP CONSTRAINT IF EXISTS institutions_cash_paise_check;
ALTER TABLE public.institution_cash_ledger DROP CONSTRAINT IF EXISTS institution_cash_ledger_balance_after_paise_check;
ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_check;
ALTER TABLE public.settlements ADD CONSTRAINT settlements_check CHECK (
  (institution_cash_before_paise IS NULL AND institution_cash_after_paise IS NULL)
  OR
  (institution_cash_before_paise IS NOT NULL AND institution_cash_after_paise IS NOT NULL)
);