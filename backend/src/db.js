const { Pool } = require('pg');
const { TIME_ZONE } = require('./time');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hospice_guide',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'app_pwd',
  max: 10,
  // 会话时区固定为东八区，DATE / NOW() 的展示与“今天清单”按同一时区计算
  options: `-c timezone=${TIME_ZONE}`,
});

const query = (text, params) => pool.query(text, params);

const SCHEMA_SQL = `
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

CREATE TABLE IF NOT EXISTS medication_doses (
  id BIGSERIAL PRIMARY KEY,
  schedule_id BIGINT NOT NULL,
  slot_id BIGINT NOT NULL,
  dose_date DATE NOT NULL,
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
`;

const ensureSchema = async () => {
  await pool.query(SCHEMA_SQL);
};

// 数据库可能比后端晚就绪，启动时做有限次重试
const waitForDatabase = async (retries = 30, delayMs = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      await ensureSchema();
      logger.info('database ready, medication schema ensured');
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      logger.error(`database not ready (attempt ${attempt}/${retries}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

const closePool = () => pool.end();

module.exports = {
  pool,
  query,
  waitForDatabase,
  closePool,
};
