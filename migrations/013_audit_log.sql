CREATE TABLE IF NOT EXISTS audit_log (
 id BIGSERIAL PRIMARY KEY,
 actor_id TEXT,
 actor_role TEXT,
 action TEXT NOT NULL,
 order_id BIGINT,
 team_id BIGINT,
 details TEXT,
 created_at TIMESTAMP NOT NULL DEFAULT now()
)