import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchSchedules,
  createSchedule,
  setScheduleActive,
  fetchDay,
  logDose,
} from '../api';

const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toTimeStr = (d) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

const formatDateLabel = (dateStr, todayStr) => {
  if (dateStr === todayStr) return '今天';
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date(`${todayStr}T00:00:00`);
  const diff = Math.round((d - today) / 86400000);
  if (diff === -1) return '昨天';
  if (diff === 1) return '明天';
  return null;
};

const getSlotStatus = (slot, dateStr, now) => {
  if (slot.log) return 'given';
  const todayStr = toDateStr(now);
  if (dateStr < todayStr) return 'missed';
  if (dateStr > todayStr) return 'upcoming';
  return slot.timeOfDay <= toTimeStr(now) ? 'missed' : 'upcoming';
};

const statusStyle = {
  given: { badge: 'bg-green-100 text-green-700 border-green-200', label: '已喂' },
  missed: { badge: 'bg-red-100 text-red-600 border-red-200', label: '漏服' },
  upcoming: { badge: 'bg-sky-100 text-sky-700 border-sky-200', label: '待喂' },
};

const Medication = () => {
  const [now, setNow] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => toDateStr(new Date()));
  const [slots, setSlots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [markingSlot, setMarkingSlot] = useState(null);
  const [caregiver, setCaregiver] = useState(
    () => localStorage.getItem('medicationCaregiver') || ''
  );

  const [medName, setMedName] = useState('');
  const [dose, setDose] = useState('');
  const [times, setTimes] = useState(['08:00']);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const todayStr = toDateStr(now);

  const loadDay = useCallback(async (date) => {
    try {
      const data = await fetchDay(date);
      setSlots(data.slots);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadSchedules = useCallback(async () => {
    try {
      const data = await fetchSchedules();
      setSchedules(data.schedules);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [dayData, scheduleData] = await Promise.all([
          fetchDay(viewDate),
          fetchSchedules(),
        ]);
        if (cancelled) return;
        setSlots(dayData.slots);
        setSchedules(scheduleData.schedules);
        setError('');
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [viewDate]);

  // 每 30 秒刷新一次当前时间，让“漏服”状态随时间自动更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const shiftDate = (days) => {
    const d = new Date(`${viewDate}T00:00:00`);
    d.setDate(d.getDate() + days);
    setLoading(true);
    setViewDate(toDateStr(d));
  };

  const confirmMark = async (slot) => {
    const name = caregiver.trim();
    if (!name) return;
    localStorage.setItem('medicationCaregiver', name);
    try {
      await logDose({
        scheduleId: slot.scheduleId,
        date: viewDate,
        timeOfDay: slot.timeOfDay,
        givenBy: name,
      });
      setMarkingSlot(null);
      await loadDay(viewDate);
    } catch (err) {
      setError(err.message);
    }
  };

  const addSchedule = async () => {
    const validTimes = times.filter((t) => t);
    if (!medName.trim() || !dose.trim() || validTimes.length === 0) {
      setFormError('请填写药名、每次剂量和至少一个喂药时刻');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createSchedule({ medName: medName.trim(), dose: dose.trim(), times: validTimes });
      setMedName('');
      setDose('');
      setTimes(['08:00']);
      await Promise.all([loadSchedules(), loadDay(viewDate)]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSchedule = async (schedule) => {
    const action = schedule.active ? '停用' : '重新启用';
    if (!window.confirm(`确定要${action}「${schedule.med_name}」的用药安排吗？${
      schedule.active ? '停用后不再出现在每日清单，之前的喂药记录会保留。' : ''
    }`)) return;
    try {
      await setScheduleActive(schedule.id, !schedule.active);
      await Promise.all([loadSchedules(), loadDay(viewDate)]);
    } catch (err) {
      setError(err.message);
    }
  };

  const dateLabel = formatDateLabel(viewDate, todayStr);
  const canMark = viewDate <= todayStr;
  const givenCount = slots.filter((s) => s.log).length;
  const missedCount = slots.filter((s) => getSlotStatus(s, viewDate, now) === 'missed').length;
  const activeSchedules = schedules.filter((s) => s.active);
  const inactiveSchedules = schedules.filter((s) => !s.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <header className="relative bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              to="/symptoms"
              className="p-2.5 hover:bg-warm-100 rounded-full transition-colors group"
            >
              <svg className="w-6 h-6 text-warm-600 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-warm-800">用药安排</h1>
              <p className="text-xs text-warm-500">全家共用一份，按时喂药不漏服</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 日期切换 */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-white/60">
          <div className="flex items-center justify-between">
            <button
              onClick={() => shiftDate(-1)}
              className="p-3 hover:bg-sky-50 rounded-2xl transition-colors text-warm-500 hover:text-sky-600"
              aria-label="前一天"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-2xl font-bold text-warm-800">{viewDate}</h2>
                {dateLabel && (
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                    {dateLabel}
                  </span>
                )}
              </div>
              {slots.length > 0 && (
                <p className="text-sm text-warm-500 mt-1">
                  共 {slots.length} 次 · 已喂 {givenCount} 次
                  {missedCount > 0 && <span className="text-red-500"> · 漏服 {missedCount} 次</span>}
                </p>
              )}
              {viewDate !== todayStr && (
                <button
                  onClick={() => {
                    setLoading(true);
                    setViewDate(todayStr);
                  }}
                  className="mt-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  回到今天
                </button>
              )}
            </div>
            <button
              onClick={() => shiftDate(1)}
              className="p-3 hover:bg-sky-50 rounded-2xl transition-colors text-warm-500 hover:text-sky-600"
              aria-label="后一天"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 当日待喂清单 */}
        <div className="space-y-4 mb-12">
          {loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/60 text-warm-400">
              加载中…
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/60">
              <div className="text-6xl mb-4">💊</div>
              <h3 className="text-xl font-bold text-warm-800 mb-2">这一天没有用药安排</h3>
              <p className="text-warm-500">在下方添加用药安排后，每天会自动生成待喂清单</p>
            </div>
          ) : (
            slots.map((slot, index) => {
              const status = getSlotStatus(slot, viewDate, now);
              const style = statusStyle[status];
              const key = `${slot.scheduleId}-${slot.timeOfDay}`;
              const isMarking = markingSlot === key;
              return (
                <div
                  key={key}
                  className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-md flex items-center gap-5 ${
                    status === 'given' ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80' : ''
                  }`}
                >
                  <div className="text-center flex-shrink-0 w-16">
                    <div className="text-2xl font-bold text-warm-800">{slot.timeOfDay}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-warm-800">{slot.medName}</p>
                    <p className="text-sm text-warm-500">每次 {slot.dose}</p>
                    {slot.log && (
                      <p className="text-sm text-green-600 mt-1">
                        ✅ {slot.log.givenBy} 于 {new Date(slot.log.givenAt).toLocaleString('zh-CN', { hour12: false })} 喂过
                      </p>
                    )}
                  </div>
                  {!slot.log && canMark && !isMarking && (
                    <button
                      onClick={() => setMarkingSlot(key)}
                      className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      记录喂药
                    </button>
                  )}
                  {!slot.log && isMarking && (
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <input
                        type="text"
                        value={caregiver}
                        onChange={(e) => setCaregiver(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && confirmMark(slot)}
                        placeholder="谁喂的？"
                        autoFocus
                        className="w-28 px-3 py-2 rounded-xl border-2 border-sky-100 focus:border-sky-400 outline-none text-sm bg-white"
                      />
                      <button
                        onClick={() => confirmMark(slot)}
                        disabled={!caregiver.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setMarkingSlot(null)}
                        className="px-3 py-2 text-warm-400 hover:text-warm-600 text-sm"
                      >
                        取消
                      </button>
                    </div>
                  )}
                  <span className="absolute top-2 right-3 text-xs text-warm-300">#{index + 1}</span>
                </div>
              );
            })
          )}
        </div>

        {/* 新增用药安排 */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/60">
          <h3 className="text-xl font-bold text-warm-800 mb-1 flex items-center gap-2">
            <span>➕</span>
            <span>添加用药安排</span>
          </h3>
          <p className="text-sm text-warm-500 mb-6">记下药名、每次剂量和每天要喂的时刻，一天可以排好几个时刻</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="药名，如：吗啡缓释片"
              className="px-4 py-3 rounded-2xl border-2 border-sky-100 focus:border-sky-400 outline-none bg-white/50"
            />
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="每次剂量，如：1片 / 10mg"
              className="px-4 py-3 rounded-2xl border-2 border-sky-100 focus:border-sky-400 outline-none bg-white/50"
            />
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-warm-600 mb-2">每天喂药时刻</p>
            <div className="flex flex-wrap items-center gap-3">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => {
                      const next = [...times];
                      next[i] = e.target.value;
                      setTimes(next);
                    }}
                    className="px-3 py-2 rounded-xl border-2 border-sky-100 focus:border-sky-400 outline-none bg-white/50"
                  />
                  {times.length > 1 && (
                    <button
                      onClick={() => setTimes(times.filter((_, j) => j !== i))}
                      className="p-1.5 text-warm-300 hover:text-red-500 transition-colors"
                      aria-label="删除这个时刻"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setTimes([...times, ''])}
                className="px-4 py-2 rounded-xl border-2 border-dashed border-sky-200 text-sky-600 hover:border-sky-400 hover:bg-sky-50 transition-colors text-sm font-medium"
              >
                + 加一个时刻
              </button>
            </div>
          </div>
          {formError && <p className="text-sm text-red-500 mb-3">{formError}</p>}
          <button
            onClick={addSchedule}
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
          >
            {submitting ? '保存中…' : '保存安排'}
          </button>
        </div>

        {/* 现有安排 */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/60">
          <h3 className="text-xl font-bold text-warm-800 mb-6 flex items-center gap-2">
            <span>📋</span>
            <span>进行中的用药安排（{activeSchedules.length}）</span>
          </h3>
          {activeSchedules.length === 0 ? (
            <p className="text-warm-400 text-center py-6">还没有进行中的用药安排</p>
          ) : (
            <div className="space-y-4">
              {activeSchedules.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-warm-800">
                      {s.med_name}
                      <span className="ml-2 text-sm font-normal text-warm-500">每次 {s.dose}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {s.times.map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-white rounded-lg text-sm text-sky-700 border border-sky-100 font-medium">
                          🕐 {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSchedule(s)}
                    className="flex-shrink-0 px-4 py-2 text-sm text-warm-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                  >
                    停用
                  </button>
                </div>
              ))}
            </div>
          )}

          {inactiveSchedules.length > 0 && (
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-warm-400 mb-3">已停用（{inactiveSchedules.length}）· 历史喂药记录仍保留</h4>
              <div className="space-y-3">
                {inactiveSchedules.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-warm-50/60 border border-warm-100 opacity-70">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-warm-500">
                        {s.med_name}
                        <span className="ml-2 text-sm font-normal text-warm-400">每次 {s.dose}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {s.times.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-white/70 rounded-lg text-xs text-warm-400 border border-warm-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSchedule(s)}
                      className="flex-shrink-0 px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded-xl transition-colors font-medium"
                    >
                      重新启用
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mt-8">
          <div className="relative flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">⚠️</span>
            <p className="text-amber-700 leading-relaxed text-sm">
              用药请严格遵循医嘱，本清单仅用于家人之间核对喂药时间，不能替代医生或护士的指导。
              如出现漏服，请勿自行加倍补服，请先咨询医护人员。
            </p>
          </div>
        </div>
      </main>

      <footer className="relative bg-gradient-to-r from-sky-800 to-blue-900 text-white/80 py-10 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🕊️</span>
            <span className="text-lg font-semibold text-white">安宁疗护信息指南</span>
          </div>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            本平台仅供信息参考，具体诊疗请遵医嘱。如有紧急情况，请立即就医。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Medication;
