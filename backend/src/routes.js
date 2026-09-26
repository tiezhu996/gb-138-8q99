const config = require('./config');
const { project, messages } = require('./constants');
const { sendJson } = require('./response');
const { todayInShanghai, isValidDate } = require('./time');
const medication = require('./medication');
const logger = require('./logger');

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 16 * 1024) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });

const route = (method, pattern) => {
  const source = pattern
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment.startsWith(':')
        ? { name: segment.slice(1), param: true }
        : { value: segment },
    );
  return (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length !== source.length) return null;
    const params = {};
    for (let i = 0; i < source.length; i += 1) {
      const expected = source[i];
      if (expected.param) {
        params[expected.name] = decodeURIComponent(segments[i]);
      } else if (expected.value !== segments[i]) {
        return null;
      }
    }
    return params;
  };
};

const schedulePatchRoute = route('PATCH', '/api/medications/schedules/:id/active');

const handleMedication = async (req, res, url) => {
  const { pathname } = url;
  const method = req.method;

  // 某天的待喂清单：/api/medications/today 或 /api/medications/roster?date=YYYY-MM-DD
  if (method === 'GET' && (pathname === '/api/medications/today' || pathname === '/api/medications/roster')) {
    const today = todayInShanghai();
    const dateParam = url.searchParams.get('date');
    if (pathname === '/api/medications/today' && dateParam && dateParam !== today) {
      sendJson(res, 400, { error: 'today 接口不能查询其他日期' });
      return;
    }
    const date = pathname === '/api/medications/today' ? today : dateParam || today;
    if (!isValidDate(date)) {
      sendJson(res, 400, { error: '日期格式不正确，应为 YYYY-MM-DD' });
      return;
    }
    if (date > today) {
      sendJson(res, 400, { error: '还不能查看以后的安排' });
      return;
    }
    const now = new Date();
    const currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    const roster = await medication.getRoster(date, {
      isToday: date === today,
      currentTime: currentTime === '24:00' ? '23:59' : currentTime,
    });
    sendJson(res, 200, roster);
    return;
  }

  if (method === 'GET' && pathname === '/api/medications/schedules') {
    sendJson(res, 200, { schedules: await medication.loadSchedules() });
    return;
  }

  if (method === 'POST' && pathname === '/api/medications/schedules') {
    const body = await readBody(req);
    const result = await medication.createSchedule(body);
    if (result.error) {
      sendJson(res, result.error.status, { error: result.error.message });
      return;
    }
    sendJson(res, 201, { schedule: result.schedule });
    return;
  }

  const patchParams = schedulePatchRoute(pathname);
  if (method === 'PATCH' && patchParams) {
    const id = Number(patchParams.id);
    if (!Number.isInteger(id)) {
      sendJson(res, 400, { error: '安排编号不正确' });
      return;
    }
    const body = await readBody(req);
    const active = Boolean(body && body.active);
    const result = await medication.setScheduleActive(id, active);
    if (result.error) {
      sendJson(res, result.error.status, { error: result.error.message });
      return;
    }
    sendJson(res, 200, { schedule: result.schedule });
    return;
  }

  // 记一次喂药：只能记“今天”
  if (method === 'POST' && pathname === '/api/medications/doses') {
    const body = await readBody(req);
    const result = await medication.markGiven({
      scheduleId: Number(body.scheduleId),
      slotId: Number(body.slotId),
      givenBy: body.givenBy,
    });
    if (result.error) {
      sendJson(res, result.error.status, { error: result.error.message });
      return;
    }
    sendJson(res, 201, result);
    return;
  }

  sendJson(res, 404, { error: messages.notFound, path: pathname });
};

const handleRequest = (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: project.id,
      message: messages.health,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/info') {
    sendJson(res, 200, {
      ...project,
      database: config.database,
    });
    return;
  }

  if (url.pathname.startsWith('/api/medications')) {
    handleMedication(req, res, url).catch((error) => {
      logger.error(`medication request failed: ${req.method} ${url.pathname}`, error);
      if (!res.headersSent) sendJson(res, 500, { error: '服务暂时不可用，请稍后重试' });
    });
    return;
  }

  sendJson(res, 404, { error: messages.notFound, path: url.pathname });
};

module.exports = {
  handleRequest,
};
