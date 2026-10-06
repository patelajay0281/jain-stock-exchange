CREATE TABLE IF NOT EXISTS event_snapshot (
 id BIGSERIAL PRIMARY KEY,
 snapshot_type TEXT NOT NULL,
 stock_id BIGINT REFERENCES stocks(id),
 team_id BIGINT REFERENCES teams(id),
 broker_id BIGINT REFERENCES brokers(id),
 value_json TEXT NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT now()
)