CREATE TABLE IF NOT EXISTS institutional_investors (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  cash NUMERIC(16,2) NOT NULL DEFAULT 20000000,
  available_cash NUMERIC(16,2) NOT NULL DEFAULT 20000000,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ipo_offerings (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  price NUMERIC(14,2) NOT NULL,
  available_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS institutional_orders (
  id BIGSERIAL PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  investor_id BIGINT NOT NULL REFERENCES institutional_investors(id),
  stock_id BIGINT NULL REFERENCES stocks(id),
  ipo_id BIGINT NULL REFERENCES ipo_offerings(id),
  side TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(14,2) NOT NULL,
  trade_value NUMERIC(16,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'SETTLED',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_institutional_orders_created ON institutional_orders(created_at DESC);