-- JAIN STOCK EXCHANGE — database-enforced trading increments and whole-rupee prices
DO $$
BEGIN
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_quantity_lot_50_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_quantity_lot_50_check CHECK (quantity % 50 = 0);
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_price_whole_rupee_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_price_whole_rupee_check CHECK (price_paise % 100 = 0);

  ALTER TABLE public.holdings DROP CONSTRAINT IF EXISTS holdings_quantity_lot_50_check;
  ALTER TABLE public.holdings ADD CONSTRAINT holdings_quantity_lot_50_check CHECK (quantity % 50 = 0);

  ALTER TABLE public.institutional_holdings DROP CONSTRAINT IF EXISTS institutional_holdings_quantity_lot_50_check;
  ALTER TABLE public.institutional_holdings ADD CONSTRAINT institutional_holdings_quantity_lot_50_check CHECK (quantity % 50 = 0);

  ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_prices_whole_rupee_check;
  ALTER TABLE public.assets ADD CONSTRAINT assets_prices_whole_rupee_check CHECK (
    base_price_paise % 100 = 0 AND current_price_paise % 100 = 0 AND previous_price_paise % 100 = 0
  );

  ALTER TABLE public.price_history DROP CONSTRAINT IF EXISTS price_history_prices_whole_rupee_check;
  ALTER TABLE public.price_history ADD CONSTRAINT price_history_prices_whole_rupee_check CHECK (
    previous_price_paise % 100 = 0 AND new_price_paise % 100 = 0
  );
END $$;