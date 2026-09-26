/* eslint-disable */
// 集成验证：用 pg-mem 模拟 PostgreSQL，跑通用药安排的主要业务规则。
// 运行：node test/medication.test.js
const assert = require('node:assert');
const { newDb } = require('pg-mem');

const db = newDb();
const SCHEMA = `
CREATE TABLE medication_schedules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ
);
CREATE TABLE medication_slots (
  id BIGSERIAL PRIMARY KEY,
  schedule_id BIGINT NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
  slot_time TEXT NOT NULL,
  UNIQUE (schedule_id, slot_time)
);
CREATE TABLE medication_doses (
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
CREATE UNIQUE INDEX medication_doses_once_per_day
  ON medication_doses (schedule_id, slot_id, dose_date);
`;

async function main() {
  db.public.none(SCHEMA);

  // 在 require 业务模块之前，把 ./db 替换为 pg-mem 支持
  const Module = require('node:module');
  const dbPath = require.resolve('../src/db');
  const pgPool = new (db.adapters.createPg().Pool)();
  // pg-mem 的 CURRENT_DATE 返回带时分秒的 timestamp（真 PostgreSQL 不会），
  // 这里在测试层统一替换为东八区日期字面量
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

  const medication = require('../src/medication');
  const { todayInShanghai } = require('../src/time');

  // 1. 创建安排：一种药多个时刻
  const created = await medication.createSchedule({
    name: '吗啡缓释片',
    dosage: '10mg',
    times: ['08:00', '20:00', '08:00'], // 重复时刻去重
  });
  assert.ok(!created.error, '创建不应报错');
  assert.deepStrictEqual(created.schedule.times, ['08:00', '20:00'], '时刻去重并排序');
  assert.strictEqual(created.schedule.active, true);

  // 校验失败
  const bad = await medication.createSchedule({ name: '', dosage: '1', times: ['09:00'] });
  assert.strictEqual(bad.error.status, 400, '药名为空返回 400');
  const badTime = await medication.createSchedule({ name: 'A', dosage: '1', times: ['99:99'] });
  assert.strictEqual(badTime.error.status, 400, '非法时刻返回 400');

  // 再加一种药，用于多条目排序
  const created2 = await medication.createSchedule({
    name: '开塞露',
    dosage: '1支',
    times: ['07:30', '12:00'],
  });

  const today = todayInShanghai();
  const now = new Date();
  const currentTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now);
  const ct = currentTime === '24:00' ? '23:59' : currentTime;

  // 2. 今天的清单按时刻排序
  const roster = await medication.getRoster(today, { isToday: true, currentTime: ct });
  assert.strictEqual(roster.total, 4, '今天应有 4 条待喂');
  assert.deepStrictEqual(
    roster.items.map((i) => i.slotTime),
    ['07:30', '08:00', '12:00', '20:00'],
    '清单按时刻升序',
  );
  roster.items.forEach((item) => {
    assert.ok(['pending', 'missed'].includes(item.status), '未喂的只可能是待喂或漏服');
    assert.strictEqual(item.given, null);
  });

  // 3. 找一个已过点的条目，确认标成漏服；找一个未来点的条目，确认待喂
  const missedItem = roster.items.find((i) => i.slotTime < ct);
  const pendingItem = roster.items.find((i) => i.slotTime >= ct);
  if (missedItem) assert.strictEqual(missedItem.status, 'missed', '过点未喂标漏服');
  if (pendingItem) assert.strictEqual(pendingItem.status, 'pending', '未到点是待喂');

  // 4. 点一下记喂药
  const target = pendingItem || missedItem;
  const mark1 = await medication.markGiven({
    scheduleId: target.scheduleId,
    slotId: target.slotId,
    givenBy: '女儿',
  });
  assert.ok(mark1.dose, '首次点击应写入记录');
  assert.strictEqual(mark1.dose.given_by, '女儿');

  // 5. 同一时刻重复点：保留第一条，不新增
  const mark2 = await medication.markGiven({
    scheduleId: target.scheduleId,
    slotId: target.slotId,
    givenBy: '儿子',
  });
  assert.ok(mark2.alreadyGiven, '重复点击返回已有记录');
  assert.strictEqual(mark2.alreadyGiven.given_by, '女儿', '保留的是第一条（女儿）');

  const rosterAfter = await medication.getRoster(today, { isToday: true, currentTime: ct });
  const givenRows = rosterAfter.items.filter((i) => i.status === 'given');
  assert.strictEqual(givenRows.length, 1, '今天只有一条已喂记录');
  assert.strictEqual(givenRows[0].given.by, '女儿');
  assert.strictEqual(givenRows[0].medName, target.medName);
  assert.strictEqual(givenRows[0].dosage, target.dosage);

  // 6. 停用安排：今天清单不再出现，但喂过的记录还在
  const deactivate = await medication.setScheduleActive(created.schedule.id, false);
  assert.strictEqual(deactivate.schedule.active, false);
  const rosterInactive = await medication.getRoster(today, { isToday: true, currentTime: ct });
  assert.ok(
    rosterInactive.items.every((i) => i.scheduleId !== created.schedule.id),
    '停用后不出现在今天清单',
  );

  // 停用当天已喂过的记录在数据库里原样保留（快照药名/剂量/喂药人）
  const keptRows = await require.cache[require.resolve('../src/db')].exports.query(
    `SELECT med_name, dosage, given_by FROM medication_doses
      WHERE schedule_id = $1 ORDER BY id`,
    [target.scheduleId],
  );
  const kept = keptRows.rows.find((row) => row.given_by === '女儿');
  assert.ok(kept, '停用后之前喂过的记录留着');
  assert.strictEqual(kept.med_name, target.medName);
  assert.strictEqual(kept.dosage, target.dosage);

  // 7. 重新启用后回到清单
  const reactivate = await medication.setScheduleActive(created.schedule.id, true);
  assert.strictEqual(reactivate.schedule.active, true);

  // 8. 缺省喂药人
  const another = rosterAfter.items.find(
    (i) => i.scheduleId !== target.scheduleId || i.slotId !== target.slotId,
  );
  const noName = await medication.markGiven({
    scheduleId: another.scheduleId,
    slotId: another.slotId,
    givenBy: '   ',
  });
  assert.ok(noName.dose, '未填名字也能记');
  assert.strictEqual(noName.dose.given_by, '家人', '缺省喂药人为“家人”');

  // 9. 跨天：昨天喂过和漏掉的都留着，第二天重新排一份
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const yesterdayRoster = await medication.getRoster(yesterday, {
    isToday: false,
    currentTime: '23:59',
  });
  assert.strictEqual(yesterdayRoster.total, 4, '昨天同样排了一份 4 条');
  assert.ok(
    yesterdayRoster.items.every((i) => i.status === 'missed'),
    '昨天没喂过的全部标漏服',
  );

  console.log('全部用药业务规则验证通过 ✅');
  process.exit(0);
}

main().catch((error) => {
  console.error('测试失败 ❌');
  console.error(error);
  process.exit(1);
});
