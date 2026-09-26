CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_metadata (key, value)
VALUES ('project', 'gb-138')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;

-- 用药安排
-- 一种药（一个安排）对应每天多个喂药时刻；停用只标记 active=false，不删除历史。
CREATE TABLE IF NOT EXISTS medication_schedules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS medication_slots (
  id BIGSERIAL PRIMARY KEY,
  schedule_id BIGINT NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
  slot_time TEXT NOT NULL CHECK (slot_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  UNIQUE (schedule_id, slot_time)
);

-- 喂药记录：按 安排+时刻+日历日 唯一，同一时刻重复点只保留第一条
CREATE TABLE IF NOT EXISTS medication_doses (
  id BIGSERIAL PRIMARY KEY,
  schedule_id BIGINT NOT NULL,
  slot_id BIGINT NOT NULL,
  dose_date DATE NOT NULL,
  -- 记录喂药当时的药名和剂量快照，安排后来被停用/删除也不影响旧记录阅读
  med_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  given_by TEXT NOT NULL,
  given_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS medication_doses_once_per_day
  ON medication_doses (schedule_id, slot_id, dose_date);
CREATE INDEX IF NOT EXISTS medication_doses_date_idx
  ON medication_doses (dose_date);
CREATE INDEX IF NOT EXISTS medication_slots_schedule_idx
  ON medication_slots (schedule_id);
