import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createSchedule,
  getRoster,
  getSchedules,
  getTodayRoster,
  markDoseGiven,
  setScheduleActive,
} from '../api/medication';

const GIVER_KEY = 'medicationGiver';
const SHANGHAI_TZ = 'Asia/Shanghai';

const todayString = () => new Date().toLocaleDateString('en-CA', { timeZone: SHANGHAI_TZ });

const shiftDate = (dateStr, delta) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta));
  return date.toISOString().slice(0, 10);
};

const formatDateLabel = (dateStr, isToday) => {
  if (isToday) return '今天';
  const [year, month, day] = dateStr.split('-').map(Number);
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
    new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  ];
  return `${month}月${day}日 ${weekday}`;
};

const useGiver = () => {
  const [giver, setGiver] = useState(() => localStorage.getItem(GIVER_KEY) || '');
  const saveGiver = (value) => {
    setGiver(value);
    localStorage.setItem(GIVER_KEY, value);
  };
  return [giver, saveGiver];
};

const Medication = () => {
  const [today] = useState(todayString);
  const [viewDate, setViewDate] = useState(today);
  const [roster, setRoster] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [giver, setGiver] = useGiver();
  const [showManage, setShowManage] = useState(false);
  const [notice, setNotice] = useState('');

  const isToday = viewDate === today;

  const refresh = useCallback(async () => {
    setError('');
    try {
      const [rosterData, scheduleData] = await Promise.all([
        isToday ? getTodayRoster() : getRoster(viewDate),
        getSchedules(),
      ]);
      setRoster(rosterData);
      setSchedules(scheduleData.schedules);
    } catch (err) {
      setError(err.message || '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [isToday, viewDate]);

  // 切换查看日期时重新拉取
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [rosterData, scheduleData] = await Promise.all([
          isToday ? getTodayRoster() : getRoster(viewDate),
          getSchedules(),
        ]);
        if (!cancelled) {
          setRoster(rosterData);
          setSchedules(scheduleData.schedules);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || '加载失败，请稍后重试');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isToday, viewDate]);

  // 多个人同时照看：每 20 秒、切回标签页时自动同步同一份数据
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, 20000);
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const flashNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleMarkGiven = async (item) => {
    const name = giver.trim() || '家人';
    setGiver(name);
    try {
      const result = await markDoseGiven(item.scheduleId, item.slotId, name);
      if (result.alreadyGiven) {
        flashNotice(`这顿已经由 ${result.alreadyGiven.given_by} 记过了，不会重复记录`);
      } else {
        flashNotice(`已记下：${name} 于 ${result.dose.given_time} 喂了 ${item.medName}`);
      }
      await refresh();
    } catch (err) {
      setError(err.message || '登记失败，请稍后重试');
    }
  };

  const handleToggleActive = async (schedule) => {
    const next = !schedule.active;
    if (
      !next &&
      !window.confirm(`停用「${schedule.name}」后，它将不再出现在待喂清单里，历史记录会保留。确定停用吗？`)
    ) {
      return;
    }
    try {
      await setScheduleActive(schedule.id, next);
      await refresh();
    } catch (err) {
      setError(err.message || '操作失败，请稍后重试');
    }
  };

  const activeSchedules = schedules.filter((schedule) => schedule.active);

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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-warm-800">用药安排</h1>
              <p className="text-xs text-warm-500">全家共用同一份喂药清单，谁喂谁点一下</p>
            </div>
            <button
              onClick={() => setShowManage((value) => !value)}
              className="px-4 py-2.5 bg-white/80 hover:bg-white text-sky-700 rounded-full text-sm font-semibold shadow-sm border border-sky-100 transition-colors"
            >
              {showManage ? '返回清单' : '⚙️ 安排管理'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-10">
        {notice && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-sky-600 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium">
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm flex items-center justify-between gap-4">
            <span>⚠️ {error}</span>
            <button onClick={refresh} className="font-semibold underline underline-offset-2">重试</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 text-warm-400 text-lg">正在打开全家共用的用药清单…</div>
        ) : showManage ? (
          <ScheduleManager
            schedules={schedules}
            onChanged={refresh}
            onError={setError}
            onToggleActive={handleToggleActive}
          />
        ) : (
          <>
            {/* 喂药人身份 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-5 mb-6 border border-white/60 flex items-center gap-4 flex-wrap">
              <span className="text-2xl">🙋</span>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-warm-500 mb-1">我是（点“确认喂药”时会记下这个名字）</label>
                <input
                  type="text"
                  value={giver}
                  onChange={(event) => setGiver(event.target.value)}
                  placeholder="例如：女儿 / 儿子 / 护工小王"
                  maxLength={20}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-sky-100 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none bg-white/70"
                />
              </div>
              <p className="text-xs text-warm-400 max-w-[180px]">
                名单保存在服务器上，家里其他人打开看到的也是同一份
              </p>
            </div>

            {/* 日期切换 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setViewDate(shiftDate(viewDate, -1))}
                disabled={viewDate <= shiftDate(today, -30)}
                className="px-4 py-2.5 bg-white/80 rounded-full shadow-sm border border-white/60 text-warm-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                ← 前一天
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-warm-800">{formatDateLabel(viewDate, isToday)}</div>
                <div className="text-xs text-warm-400 mt-0.5">{viewDate} · 只能翻到今天为止</div>
              </div>
              <button
                onClick={() => setViewDate(shiftDate(viewDate, 1))}
                disabled={isToday}
                className="px-4 py-2.5 bg-white/80 rounded-full shadow-sm border border-white/60 text-warm-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                后一天 →
              </button>
            </div>

            {/* 今日概览 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/80 rounded-2xl p-5 text-center shadow-sm border border-white/60">
                <div className="text-3xl font-bold text-warm-800">{roster.total}</div>
                <div className="text-xs text-warm-500 mt-1">当天共 {roster.total} 次</div>
              </div>
              <div className="bg-emerald-50/80 rounded-2xl p-5 text-center shadow-sm border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-600">{roster.givenCount}</div>
                <div className="text-xs text-emerald-700/70 mt-1">已喂</div>
              </div>
              <div className="bg-red-50/80 rounded-2xl p-5 text-center shadow-sm border border-red-100">
                <div className="text-3xl font-bold text-red-500">{roster.missedCount}</div>
                <div className="text-xs text-red-600/70 mt-1">漏服</div>
              </div>
            </div>

            <DoseList
              items={roster.items}
              isToday={isToday}
              giverName={giver.trim() || '家人'}
              onMark={handleMarkGiven}
              onManage={() => setShowManage(true)}
              hasActiveSchedules={activeSchedules.length > 0}
            />
          </>
        )}
      </main>

      <footer className="relative bg-gradient-to-r from-sky-800 to-blue-900 text-white/80 py-10 mt-20">
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

const StatusBadge = ({ item }) => {
  if (item.status === 'given') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
        ✅ {item.given.time} 已喂{isLateText(item)}
      </span>
    );
  }
  if (item.status === 'missed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
        ⏰ 漏服
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
      ⏳ 待喂
    </span>
  );
};

const isLateText = (item) => (item.given.late ? '（晚于安排）' : '');

const DoseList = ({ items, isToday, giverName, onMark, onManage, hasActiveSchedules }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/60">
        <div className="text-6xl mb-5">💊</div>
        <h3 className="text-2xl font-bold text-warm-800 mb-3">
          {hasActiveSchedules ? '这一天没有用药安排' : '还没有用药安排'}
        </h3>
        <p className="text-warm-500 mb-6">
          {hasActiveSchedules
            ? '当天的安排可能后来被停用了，喂过的记录可以换个日期翻看。'
            : '把每天要喂的药、剂量和时刻记下来，全家照着同一份清单喂。'}
        </p>
        {!hasActiveSchedules && (
          <button
            onClick={onManage}
            className="px-7 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            去添加用药安排
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <DoseCard key={`${item.scheduleId}-${item.slotId}`} item={item} isToday={isToday} giverName={giverName} onMark={onMark} />
      ))}
    </div>
  );
};

const DoseCard = ({ item, isToday, giverName, onMark }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    try {
      await onMark(item);
    } finally {
      setSubmitting(false);
    }
  };

  const cardColor =
    item.status === 'given'
      ? 'bg-emerald-50/70 border-emerald-200'
      : item.status === 'missed'
        ? 'bg-red-50/60 border-red-200'
        : 'bg-white/85 border-white/70';

  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-md p-5 border ${cardColor} flex items-center gap-5`}>
      <div className="flex-shrink-0 w-20 text-center">
        <div className="text-2xl font-bold text-warm-800">{item.slotTime}</div>
        <div className="mt-1"><StatusBadge item={item} /></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold text-warm-800">{item.medName}</span>
          <span className="text-sm text-warm-500">每次 {item.dosage}</span>
        </div>
        {item.status === 'given' ? (
          <p className="text-sm text-emerald-700 mt-1.5">
            {item.given.time} 由 <span className="font-semibold">{item.given.by}</span> 喂的
            {item.given.late && <span className="text-amber-600">（晚于安排 {item.slotTime}）</span>}
          </p>
        ) : item.status === 'missed' ? (
          <p className="text-sm text-red-500/90 mt-1.5">
            安排 {item.slotTime} 喂，到点没记{isToday ? '；如已补喂请尽快点右边补记' : ''}
          </p>
        ) : (
          <p className="text-sm text-warm-400 mt-1.5">到点后由“{giverName}”点右边确认</p>
        )}
      </div>
      {item.status !== 'given' && isToday && (
        <button
          onClick={handleClick}
          disabled={submitting}
          className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-white shadow-md transition-all disabled:opacity-60 ${
            item.status === 'missed'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg'
              : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg'
          }`}
        >
          {submitting ? '登记中…' : item.status === 'missed' ? '补记已喂' : '✅ 确认喂药'}
        </button>
      )}
    </div>
  );
};

const TIME_OPTIONS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

const ScheduleManager = ({ schedules, onChanged, onError, onToggleActive }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState(['08:00']);
  const [submitting, setSubmitting] = useState(false);
  const lastInputRef = useRef(null);

  const addTime = () => {
    const used = new Set(times);
    const next = TIME_OPTIONS.find((value) => !used.has(value));
    if (next) setTimes([...times, next]);
  };

  const updateTime = (index, value) => {
    setTimes(times.map((item, i) => (i === index ? value : item)));
  };

  const removeTime = (index) => {
    if (times.length === 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !dosage.trim() || times.length === 0) return;
    setSubmitting(true);
    onError('');
    try {
      await createSchedule({
        name: name.trim(),
        dosage: dosage.trim(),
        times: [...new Set(times)].sort(),
      });
      setName('');
      setDosage('');
      setTimes(['08:00']);
      await onChanged();
    } catch (err) {
      onError(err.message || '添加失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const usedTimes = new Set(times);

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-xl p-7 border border-white/60"
      >
        <h2 className="text-xl font-bold text-warm-800 mb-1">添加用药安排</h2>
        <p className="text-sm text-warm-500 mb-6">一种药可以排好几个时刻，保存后全家立刻看到</p>
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold text-warm-700 mb-2">药名</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="如：吗啡缓释片"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none bg-white/70"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-warm-700 mb-2">每次剂量</label>
            <input
              type="text"
              value={dosage}
              onChange={(event) => setDosage(event.target.value)}
              placeholder="如：10mg / 半片 / 5ml"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none bg-white/70"
            />
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-warm-700">每天喂药时刻</label>
            <button
              type="button"
              onClick={addTime}
              className="text-sm text-sky-600 font-semibold hover:text-sky-700"
            >
              ＋ 再加一个时刻
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {times.map((time, index) => (
              <div key={index} className="flex items-center gap-1 bg-sky-50 rounded-xl p-1.5 border border-sky-100">
                <select
                  value={time}
                  ref={index === times.length - 1 ? lastInputRef : null}
                  onChange={(event) => updateTime(index, event.target.value)}
                  className="bg-transparent px-2 py-1.5 outline-none font-semibold text-warm-800"
                >
                  {TIME_OPTIONS.map((option) => (
                    <option key={option} value={option} disabled={usedTimes.has(option) && option !== time}>
                      {option}
                    </option>
                  ))}
                </select>
                {times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTime(index)}
                    className="w-7 h-7 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50"
                    aria-label="删除该时刻"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-warm-400 mt-2">时刻按整点预设；同一时刻不会重复添加</p>
        </div>
        <button
          type="submit"
          disabled={submitting || !name.trim() || !dosage.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {submitting ? '保存中…' : '保存安排'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold text-warm-800 mb-4">
          全部安排（{schedules.length}）
        </h2>
        {schedules.length === 0 ? (
          <div className="bg-white/70 rounded-2xl p-10 text-center text-warm-400 border border-white/60">
            还没有安排，先在上面添加第一种药吧
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`rounded-2xl shadow-sm border p-5 flex items-center gap-5 ${
                  schedule.active ? 'bg-white/85 border-white/70' : 'bg-warm-50/80 border-warm-200'
                }`}
              >
                <div className="text-3xl">{schedule.active ? '💊' : '⏸️'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-lg font-bold ${schedule.active ? 'text-warm-800' : 'text-warm-400'}`}>
                      {schedule.name}
                    </span>
                    <span className="text-sm text-warm-500">每次 {schedule.dosage}</span>
                    {!schedule.active && (
                      <span className="px-2 py-0.5 rounded-full bg-warm-200 text-warm-600 text-xs font-semibold">
                        已停用
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {schedule.times.map((time) => (
                      <span
                        key={time}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          schedule.active ? 'bg-sky-50 text-sky-700' : 'bg-warm-100 text-warm-400'
                        }`}
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onToggleActive(schedule)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    schedule.active
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {schedule.active ? '停用' : '重新启用'}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-warm-400 mt-4 leading-relaxed">
          停用后该安排不再出现在待喂清单里；之前已经喂过的记录会一直保留，在清单页翻到对应日期仍能看到。
        </p>
      </div>
    </div>
  );
};

export default Medication;
