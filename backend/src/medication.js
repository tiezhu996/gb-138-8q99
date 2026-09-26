const { query, pool } = require('./db');
const { isValidTime } = require('./time');

const GIVER_MAX_LENGTH = 20;

const normalizeText = (value, maxLength) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
};

const validateTimes = (times) => {
  if (!Array.isArray(times) || times.length === 0) return null;
  const cleaned = [];
  for (const raw of times) {
    if (!isValidTime(raw)) return null;
    if (!cleaned.includes(raw)) cleaned.push(raw);
  }
  return cleaned.sort();
};

const loadSchedules = async () => {
  const result = await query(
    `SELECT s.id, s.name, s.dosage, s.active,
            s.created_at, s.deactivated_at,
            COALESCE(sl.times, ARRAY[]::text[]) AS times
       FROM medication_schedules s
       LEFT JOIN (
         SELECT schedule_id, array_agg(slot_time ORDER BY slot_time) AS times
           FROM medication_slots
          GROUP BY schedule_id
       ) sl ON sl.schedule_id = s.id
      ORDER BY s.active DESC, s.id DESC`,
  );
  return result.rows;
};

const createSchedule = async ({ name, dosage, times }) => {
  const cleanName = normalizeText(name, 50);
  const cleanDosage = normalizeText(dosage, 30);
  const cleanTimes = validateTimes(times);
  if (!cleanName || !cleanDosage || !cleanTimes) {
    return { error: { status: 400, message: '药名、剂量和至少一个喂药时刻不能为空' } };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      'INSERT INTO medication_schedules (name, dosage) VALUES ($1, $2) RETURNING *',
      [cleanName, cleanDosage],
    );
    const scheduleId = inserted.rows[0].id;
    const values = cleanTimes.map((_, index) => `($1, $${index + 2})`).join(', ');
    await client.query(
      `INSERT INTO medication_slots (schedule_id, slot_time) VALUES ${values}`,
      [scheduleId, ...cleanTimes],
    );
    await client.query('COMMIT');
    const schedules = await loadSchedules();
    return { schedule: schedules.find((item) => item.id === scheduleId) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const setScheduleActive = async (id, active) => {
  if (!Number.isInteger(id) || id <= 0 || typeof active !== 'boolean') {
    return { error: { status: 400, message: '参数不正确' } };
  }
  const result = await query(
    `UPDATE medication_schedules
        SET active = $2,
            deactivated_at = CASE WHEN $2 THEN NULL ELSE NOW() END
      WHERE id = $1
      RETURNING *`,
    [id, active],
  );
  if (result.rows.length === 0) {
    return { error: { status: 404, message: '用药安排不存在' } };
  }
  const schedules = await loadSchedules();
  return { schedule: schedules.find((item) => item.id === id) };
};

// 某日清单（数据库会话时区固定为 Asia/Shanghai，见 db.js，日期比较都在东八区内完成）：
// - 今天：只排“启用中”的安排
// - 以前的日期：当天处于启用状态的安排（当天才停用的仍保留），喂过/漏服都留着可翻
const ROSTER_SQL = `
  WITH applicable AS (
    SELECT id, name, dosage
      FROM medication_schedules
     WHERE $1::date = CURRENT_DATE AND active = TRUE
    UNION ALL
    SELECT id, name, dosage
      FROM medication_schedules
     WHERE $1::date < CURRENT_DATE
       AND (active = TRUE
            OR (deactivated_at IS NOT NULL AND deactivated_at::date >= $2::date))
  )
  SELECT a.id AS schedule_id, a.name AS med_name, a.dosage,
         sl.id AS slot_id, sl.slot_time,
         d.id AS dose_id, d.given_by, d.given_at
    FROM applicable a
    JOIN medication_slots sl ON sl.schedule_id = a.id
    LEFT JOIN medication_doses d
      ON d.schedule_id = a.id
     AND d.slot_id = sl.id
     AND d.dose_date = $3::date
   ORDER BY sl.slot_time, a.id
`;

const formatShanghaiHM = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);

const getRoster = async (date, { isToday, currentTime }) => {
  const result = await query(ROSTER_SQL, [date, date, date]);
  const items = result.rows.map((row) => {
    const given = row.dose_id !== null;
    const givenTime = given ? formatShanghaiHM(row.given_at) : null;
    let status;
    if (given) {
      status = 'given';
    } else if (!isToday || row.slot_time < currentTime) {
      // 过去日期一律算漏服；今天过了点还没喂也算漏服
      status = 'missed';
    } else {
      status = 'pending';
    }
    return {
      scheduleId: row.schedule_id,
      slotId: row.slot_id,
      medName: row.med_name,
      dosage: row.dosage,
      slotTime: row.slot_time,
      status,
      given: given
        ? {
            by: row.given_by,
            at: row.given_at instanceof Date ? row.given_at.toISOString() : row.given_at,
            time: givenTime,
            // 实际喂的时间晚于安排时刻
            late: givenTime > row.slot_time,
          }
        : null,
    };
  });

  return {
    date,
    isToday,
    currentTime,
    total: items.length,
    givenCount: items.filter((item) => item.status === 'given').length,
    missedCount: items.filter((item) => item.status === 'missed').length,
    items,
  };
};

// 记一次喂药：唯一索引兜底，两个家人同时点也只会留下第一条
const toDoseView = (row) => ({
  id: row.id,
  given_by: row.given_by,
  given_time: formatShanghaiHM(row.given_at),
});

const markGiven = async ({ scheduleId, slotId, givenBy }) => {
  if (!Number.isInteger(scheduleId) || !Number.isInteger(slotId) || scheduleId <= 0 || slotId <= 0) {
    return { error: { status: 400, message: '参数不正确' } };
  }
  const giver = normalizeText(givenBy, GIVER_MAX_LENGTH) || '家人';

  const slot = await query(
    `SELECT s.id AS schedule_id, s.name, s.dosage, sl.slot_time
       FROM medication_schedules s
       JOIN medication_slots sl ON sl.schedule_id = s.id AND sl.id = $2
      WHERE s.id = $1 AND s.active = TRUE`,
    [scheduleId, slotId],
  );
  if (slot.rows.length === 0) {
    return { error: { status: 404, message: '该用药安排已停用或不存在' } };
  }
  const { name, dosage, slot_time } = slot.rows[0];

  const existing = await query(
    `SELECT id, given_by, given_at
       FROM medication_doses
      WHERE schedule_id = $1 AND slot_id = $2 AND dose_date = CURRENT_DATE`,
    [scheduleId, slotId],
  );
  if (existing.rows.length > 0) {
    // 同一时刻重复点：返回已存在的第一条，不新增
    return { alreadyGiven: toDoseView(existing.rows[0]) };
  }

  const inserted = await query(
    `INSERT INTO medication_doses
       (schedule_id, slot_id, dose_date, med_name, dosage, slot_time, given_by)
     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
     ON CONFLICT (schedule_id, slot_id, dose_date) DO NOTHING
     RETURNING id, given_by, given_at`,
    [scheduleId, slotId, name, dosage, slot_time, giver],
  );

  if (inserted.rows.length === 0) {
    // 并发下被别人抢先记过：取回第一条，不新增
    const raced = await query(
      `SELECT id, given_by, given_at
         FROM medication_doses
        WHERE schedule_id = $1 AND slot_id = $2 AND dose_date = CURRENT_DATE`,
      [scheduleId, slotId],
    );
    if (raced.rows.length > 0) return { alreadyGiven: toDoseView(raced.rows[0]) };
    return { error: { status: 404, message: '该用药安排已停用或不存在' } };
  }

  return { dose: toDoseView(inserted.rows[0]) };
};

module.exports = {
  loadSchedules,
  createSchedule,
  setScheduleActive,
  getRoster,
  markGiven,
};
