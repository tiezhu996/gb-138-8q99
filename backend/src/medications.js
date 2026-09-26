const db = require('./db');
const { sendJson } = require('./response');

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isValidTime = (value) => typeof value === 'string' && TIME_RE.test(value);
const isValidDate = (value) =>
  typeof value === 'string' && DATE_RE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));

const badRequest = (res, message) => sendJson(res, 400, { error: message });

const toHHMM = (value) => String(value).slice(0, 5);

// 查出全部安排并拼上各自的时刻列表
const fetchSchedulesWithTimes = async () => {
  const [schedules, times] = await Promise.all([
    db.query(
      `SELECT id, med_name, dose, active, created_at, deactivated_at
       FROM medication_schedules
       ORDER BY active DESC, id ASC`
    ),
    db.query(
      `SELECT schedule_id, time_of_day FROM medication_schedule_times ORDER BY time_of_day ASC`
    ),
  ]);
  const timesBySchedule = new Map();
  for (const row of times.rows) {
    const list = timesBySchedule.get(row.schedule_id) || [];
    list.push(toHHMM(row.time_of_day));
    timesBySchedule.set(row.schedule_id, list);
  }
  return schedules.rows.map((s) => ({ ...s, times: timesBySchedule.get(s.id) || [] }));
};

// GET /api/medications/schedules — 全部安排（含已停用），家人看到的都是同一份
const listSchedules = async (res) => {
  sendJson(res, 200, { schedules: await fetchSchedulesWithTimes() });
};

// POST /api/medications/schedules — 新增用药安排
const createSchedule = async (res, body) => {
  const medName = typeof body.medName === 'string' ? body.medName.trim() : '';
  const dose = typeof body.dose === 'string' ? body.dose.trim() : '';
  const rawTimes = Array.isArray(body.times) ? body.times : [];

  if (!medName) return badRequest(res, '请填写药名');
  if (!dose) return badRequest(res, '请填写每次剂量');

  const times = [...new Set(rawTimes.filter(isValidTime))].sort();
  if (times.length === 0) return badRequest(res, '请至少填写一个有效的喂药时刻（HH:MM）');

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO medication_schedules (med_name, dose) VALUES ($1, $2) RETURNING id`,
      [medName, dose]
    );
    const scheduleId = inserted.rows[0].id;
    for (const time of times) {
      await client.query(
        `INSERT INTO medication_schedule_times (schedule_id, time_of_day) VALUES ($1, $2::time)`,
        [scheduleId, time]
      );
    }
    await client.query('COMMIT');
    const schedules = await fetchSchedulesWithTimes();
    sendJson(res, 201, { schedule: schedules.find((s) => s.id === scheduleId) });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// POST /api/medications/schedules/:id/deactivate 与 /activate
// 停用后不再出现在每日清单，历史喂药记录保留
const setScheduleActive = async (res, id, active) => {
  const result = await db.query(
    `UPDATE medication_schedules
     SET active = $2,
         deactivated_at = CASE WHEN $2 THEN NULL ELSE CURRENT_TIMESTAMP END
     WHERE id = $1
     RETURNING id`,
    [id, active]
  );
  if (result.rows.length === 0) {
    sendJson(res, 404, { error: '用药安排不存在' });
    return;
  }
  const schedules = await fetchSchedulesWithTimes();
  sendJson(res, 200, { schedule: schedules.find((s) => s.id === Number(id)) });
};

// GET /api/medications/day?date=YYYY-MM-DD
// 把当天生效的安排按时刻展开成待喂清单，并带上喂药记录。
// 已停用的安排不再出现，但停用前喂过的记录仍然保留可翻查。
const getDay = async (res, url) => {
  const date = url.searchParams.get('date');
  if (!isValidDate(date)) return badRequest(res, '日期格式应为 YYYY-MM-DD');

  const result = await db.query(
    `SELECT s.id AS schedule_id, s.med_name, s.dose,
            t.time_of_day,
            l.id AS log_id, l.given_by, l.given_at
     FROM medication_schedules s
     JOIN medication_schedule_times t ON t.schedule_id = s.id
     LEFT JOIN medication_logs l
       ON l.schedule_id = s.id
      AND l.log_date = $1::date
      AND l.time_of_day = t.time_of_day
     WHERE (s.created_at::date <= $1::date
            AND (s.deactivated_at IS NULL OR s.deactivated_at::date > $1::date))
        OR l.id IS NOT NULL
     ORDER BY t.time_of_day ASC, s.id ASC`,
    [date]
  );

  const slots = result.rows.map((row) => ({
    scheduleId: row.schedule_id,
    medName: row.med_name,
    dose: row.dose,
    timeOfDay: toHHMM(row.time_of_day),
    log: row.log_id
      ? { id: row.log_id, givenBy: row.given_by, givenAt: row.given_at }
      : null,
  }));

  sendJson(res, 200, { date, slots });
};

// POST /api/medications/log — 记录一次喂药。
// 同一安排同一天同一时刻重复提交只保留第一条，不会多记。
const createLog = async (res, body) => {
  const scheduleId = Number(body.scheduleId);
  const date = body.date;
  const timeOfDay = body.timeOfDay;
  const givenBy = typeof body.givenBy === 'string' ? body.givenBy.trim() : '';

  if (!Number.isInteger(scheduleId) || scheduleId <= 0) return badRequest(res, '安排编号无效');
  if (!isValidDate(date)) return badRequest(res, '日期格式应为 YYYY-MM-DD');
  if (!isValidTime(timeOfDay)) return badRequest(res, '时刻格式应为 HH:MM');
  if (!givenBy) return badRequest(res, '请填写喂药人');

  const schedule = await db.query(
    `SELECT 1 FROM medication_schedule_times WHERE schedule_id = $1 AND time_of_day = $2::time`,
    [scheduleId, timeOfDay]
  );
  if (schedule.rows.length === 0) {
    sendJson(res, 404, { error: '用药安排或该时刻不存在' });
    return;
  }

  const selectLog = `
    SELECT id, schedule_id, log_date, time_of_day, given_by, given_at
    FROM medication_logs
    WHERE schedule_id = $1 AND log_date = $2::date AND time_of_day = $3::time`;
  const params = [scheduleId, date, timeOfDay];

  // 同一时刻已有记录就直接返回第一条，不会多记
  const existing = await db.query(selectLog, params);
  if (existing.rows.length > 0) {
    sendJson(res, 200, { log: existing.rows[0], alreadyRecorded: true });
    return;
  }

  // 唯一约束兜底：并发重复提交也只有第一条能落库
  await db.query(
    `INSERT INTO medication_logs (schedule_id, log_date, time_of_day, given_by)
     VALUES ($1, $2::date, $3::time, $4)
     ON CONFLICT (schedule_id, log_date, time_of_day) DO NOTHING`,
    [scheduleId, date, timeOfDay, givenBy]
  );

  const saved = await db.query(selectLog, params);
  sendJson(res, 201, { log: saved.rows[0], alreadyRecorded: false });
};

module.exports = {
  listSchedules,
  createSchedule,
  setScheduleActive,
  getDay,
  createLog,
};
