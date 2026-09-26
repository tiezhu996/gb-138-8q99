/* eslint-disable */
// 本地冒烟用：用 pg-mem 内存库替代真实 PostgreSQL 启动真实 HTTP 服务。
// 运行：node test/smoke-server.js
const { newDb } = require('pg-mem');

const db = newDb();
const pgPool = new (db.adapters.createPg().Pool)();
const fixedDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
const patchSql = (text) => text.replace(/CURRENT_DATE/g, `'${fixedDate}'::date`);
const pool = {
  query: (text, params) => pgPool.query(patchSql(text), params),
  connect: async () => {
    const client = await pgPool.connect();
    return {
      query: (text, params) => client.query(patchSql(text), params),
      release: () => client.release(),
    };
  },
};

const Module = require('node:module');
const dbPath = require.resolve('../src/db');
require.cache[dbPath] = new Module(dbPath, module);
require.cache[dbPath].exports = {
  pool,
  query: pool.query,
  waitForDatabase: async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medication_schedules (
        id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, dosage TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deactivated_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS medication_slots (
        id BIGSERIAL PRIMARY KEY, schedule_id BIGINT NOT NULL,
        slot_time TEXT NOT NULL, UNIQUE (schedule_id, slot_time)
      );
      CREATE TABLE IF NOT EXISTS medication_doses (
        id BIGSERIAL PRIMARY KEY, schedule_id BIGINT NOT NULL, slot_id BIGINT NOT NULL,
        dose_date DATE NOT NULL, med_name TEXT NOT NULL, dosage TEXT NOT NULL,
        slot_time TEXT NOT NULL, given_by TEXT NOT NULL,
        given_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq
        ON medication_doses (schedule_id, slot_id, dose_date);
    `);
  },
  closePool: async () => {},
};

process.env.PORT = '3399';
require('../src/server');
