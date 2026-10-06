CREATE TABLE IF NOT EXISTS daily_order_counters (
  order_date date PRIMARY KEY,
  last_number integer NOT NULL DEFAULT 0
)