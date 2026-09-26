CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_metadata (key, value)
VALUES ('project', 'gb-138')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;

-- 用药安排：一条安排 = 药名 + 每次剂量；每天喂药时刻放在子表，一天可排多条
CREATE TABLE IF NOT EXISTS medication_schedules (
  id SERIAL PRIMARY KEY,
  med_name TEXT NOT NULL,
  dose TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medication_schedule_times (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
  time_of_day TIME NOT NULL,
  UNIQUE (schedule_id, time_of_day)
);

-- 喂药记录：同一安排同一天同一时刻只保留第一条（唯一约束保证幂等）
CREATE TABLE IF NOT EXISTS medication_logs (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES medication_schedules(id),
  log_date DATE NOT NULL,
  time_of_day TIME NOT NULL,
  given_by TEXT NOT NULL,
  given_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (schedule_id, log_date, time_of_day)
);

CREATE INDEX IF NOT EXISTS idx_medication_logs_date ON medication_logs (log_date);
