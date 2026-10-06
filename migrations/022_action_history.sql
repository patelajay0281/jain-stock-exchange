CREATE TABLE IF NOT EXISTS action_history (
 id BIGSERIAL PRIMARY KEY,
 order_id BIGINT REFERENCES orders(id),
 action TEXT NOT NULL,
 previous_status TEXT,
 new_status TEXT,
 reversal_status TEXT,
 created_at TIMESTAMP NOT NULL DEFAULT now()
)