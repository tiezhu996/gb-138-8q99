// 全家按 Asia/Shanghai（东八区）计算“今天”，避免容器时区不同导致清单日期错位
const TIME_ZONE = 'Asia/Shanghai';

const shanghaiFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// 返回上海时区的日历日，格式 YYYY-MM-DD
const todayInShanghai = (now = new Date()) => shanghaiFormatter.format(now);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const isValidDate = (value) => {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const isValidTime = (value) => typeof value === 'string' && TIME_RE.test(value);

module.exports = {
  TIME_ZONE,
  todayInShanghai,
  isValidDate,
  isValidTime,
};
