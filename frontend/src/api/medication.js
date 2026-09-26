const BASE = '/api/medications';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // 空响应体时忽略
  }
  if (!res.ok) {
    throw new Error(payload?.error || `请求失败（${res.status}）`);
  }
  return payload;
}

export const getTodayRoster = () => request('/today');

export const getRoster = (date) => request(`/roster?date=${encodeURIComponent(date)}`);

export const getSchedules = () => request('/schedules');

export const createSchedule = ({ name, dosage, times }) =>
  request('/schedules', {
    method: 'POST',
    body: JSON.stringify({ name, dosage, times }),
  });

export const setScheduleActive = (id, active) =>
  request(`/schedules/${id}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });

// 同一时刻重复点：后端按 (安排, 时刻, 当天) 唯一，只保留第一条
export const markDoseGiven = (scheduleId, slotId, givenBy) =>
  request('/doses', {
    method: 'POST',
    body: JSON.stringify({ scheduleId, slotId, givenBy }),
  });
