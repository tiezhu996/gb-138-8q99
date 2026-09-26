const request = async (path, options = {}) => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `请求失败（${res.status}）`);
  }
  return data;
};

export const fetchSchedules = () => request('/api/medications/schedules');

export const createSchedule = (payload) =>
  request('/api/medications/schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const setScheduleActive = (id, active) =>
  request(`/api/medications/schedules/${id}/${active ? 'activate' : 'deactivate'}`, {
    method: 'POST',
  });

export const fetchDay = (date) => request(`/api/medications/day?date=${date}`);

export const logDose = (payload) =>
  request('/api/medications/log', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
