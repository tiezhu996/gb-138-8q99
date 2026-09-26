/* eslint-disable */
// HTTP 层验证：路由、请求体解析、状态码与幂等响应。
// 运行：node test/api.test.js
const assert = require('node:assert');
const { newDb } = require('pg-mem');

async function main() {
  const db = newDb();
  db.public.none(`
CREATE TABLE medication_schedules (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, dosage TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deactivated_at TIMESTAMPTZ
);
CREATE TABLE medication_slots (
  id BIGSERIAL PRIMARY KEY, schedule_id BIGINT NOT NULL,
  slot_time TEXT NOT NULL, UNIQUE (schedule_id, slot_time)
);
CREATE TABLE medication_doses (
  id BIGSERIAL PRIMARY KEY, schedule_id BIGINT NOT NULL, slot_id BIGINT NOT NULL,
  dose_date DATE NOT NULL, med_name TEXT NOT NULL, dosage TEXT NOT NULL,
  slot_time TEXT NOT NULL, given_by TEXT NOT NULL,
  given_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq ON medication_doses (schedule_id, slot_id, dose_date);
`);

  const Module = require('node:module');
  const dbPath = require.resolve('../src/db');
  const pgPool = new (db.adapters.createPg().Pool)();
  const fixedDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const patchSql = (text) => text.replace(/CURRENT_DATE/g, `'${fixedDate}'::date`);
  const fakePool = {
    query: (text, params) => pgPool.query(patchSql(text), params),
    connect: async () => {
      const client = await pgPool.connect();
      return {
        query: (text, params) => client.query(patchSql(text), params),
        release: () => client.release(),
      };
    },
  };
  require.cache[dbPath] = new Module(dbPath, module);
  require.cache[dbPath].exports = {
    pool: fakePool,
    query: fakePool.query,
    waitForDatabase: async () => {},
    closePool: async () => {},
  };

  const http = require('node:http');
  const { handleRequest } = require('../src/routes');
  const server = http.createServer(handleRequest);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  const call = (method, pathname, body) =>
    new Promise((resolve, reject) => {
      const data = body === undefined ? null : JSON.stringify(body);
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: pathname,
          method,
          headers: data
            ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
            : {},
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => { raw += chunk; });
          res.on('end', () =>
            resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
        },
      );
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });

  // health 仍可用
  const health = await call('GET', '/api/health');
  assert.strictEqual(health.status, 200);
  assert.strictEqual(health.body.status, 'ok');

  // 建安排
  const created = await call('POST', '/api/medications/schedules', {
    name: '芬太尼贴剂',
    dosage: '一贴',
    times: ['09:00'],
  });
  assert.strictEqual(created.status, 201);
  const scheduleId = created.body.schedule.id;

  // 非法请求体
  const bad = await call('POST', '/api/medications/schedules', { name: '', dosage: '', times: [] });
  assert.strictEqual(bad.status, 400);

  // 今天清单
  const roster = await call('GET', '/api/medications/today');
  assert.strictEqual(roster.status, 200);
  assert.strictEqual(roster.body.isToday, true);
  assert.strictEqual(roster.body.total, 1);
  const item = roster.body.items[0];

  // 记一次
  const mark = await call('POST', '/api/medications/doses', {
    scheduleId: item.scheduleId,
    slotId: item.slotId,
    givenBy: '大儿子',
  });
  assert.strictEqual(mark.status, 201);
  assert.ok(mark.body.dose);

  // 再点一次：仍是 201 语义的幂等返回，带 alreadyGiven，不给药记录不新增
  const again = await call('POST', '/api/medications/doses', {
    scheduleId: item.scheduleId,
    slotId: item.slotId,
    givenBy: '小女儿',
  });
  assert.strictEqual(again.status, 201);
  assert.ok(again.body.alreadyGiven, '重复点击返回 alreadyGiven');
  assert.strictEqual(again.body.alreadyGiven.given_by, '大儿子');

  const after = await call('GET', '/api/medications/today');
  assert.strictEqual(after.body.givenCount, 1, '全天只有一条喂药记录');
  assert.strictEqual(after.body.items[0].given.by, '大儿子');

  // 停用
  const off = await call('PATCH', `/api/medications/schedules/${scheduleId}/active`, {
    active: false,
  });
  assert.strictEqual(off.status, 200);
  assert.strictEqual(off.body.schedule.active, false);
  const offRoster = await call('GET', '/api/medications/today');
  assert.strictEqual(offRoster.body.total, 0, '停用后清单为空');

  // 停用状态下不能再点
  const markOff = await call('POST', '/api/medications/doses', {
    scheduleId: item.scheduleId,
    slotId: item.slotId,
    givenBy: '谁',
  });
  assert.strictEqual(markOff.status, 404);

  // 重新启用
  const on = await call('PATCH', `/api/medications/schedules/${scheduleId}/active`, {
    active: true,
  });
  assert.strictEqual(on.body.schedule.active, true);

  // 非法日期 / 未来日期
  const badDate = await call('GET', '/api/medications/roster?date=not-a-date');
  assert.strictEqual(badDate.status, 400);
  const future = await call('GET', '/api/medications/roster?date=2099-01-01');
  assert.strictEqual(future.status, 400);

  // 不存在的路由
  const missing = await call('GET', '/api/medications/nope');
  assert.strictEqual(missing.status, 404);

  server.close();
  console.log('HTTP 接口验证通过 ✅');
  process.exit(0);
}

main().catch((error) => {
  console.error('HTTP 测试失败 ❌');
  console.error(error);
  process.exit(1);
});
