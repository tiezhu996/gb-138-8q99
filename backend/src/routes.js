const config = require('./config');
const { project, messages } = require('./constants');
const { sendJson } = require('./response');
const logger = require('./logger');
const medications = require('./medications');

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('请求体过大'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('请求体不是有效的 JSON'));
      }
    });
    req.on('error', reject);
  });

const handleRequest = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  try {
    if (path === '/api/health') {
      sendJson(res, 200, {
        status: 'ok',
        service: project.id,
        message: messages.health,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (path === '/api/info') {
      sendJson(res, 200, {
        ...project,
        database: config.database,
      });
      return;
    }

    if (path === '/api/medications/schedules' && method === 'GET') {
      await medications.listSchedules(res);
      return;
    }

    if (path === '/api/medications/schedules' && method === 'POST') {
      await medications.createSchedule(res, await readBody(req));
      return;
    }

    const scheduleAction = path.match(/^\/api\/medications\/schedules\/(\d+)\/(activate|deactivate)$/);
    if (scheduleAction && method === 'POST') {
      await medications.setScheduleActive(res, Number(scheduleAction[1]), scheduleAction[2] === 'activate');
      return;
    }

    if (path === '/api/medications/day' && method === 'GET') {
      await medications.getDay(res, url);
      return;
    }

    if (path === '/api/medications/log' && method === 'POST') {
      await medications.createLog(res, await readBody(req));
      return;
    }

    sendJson(res, 404, { error: messages.notFound, path });
  } catch (err) {
    logger.error(`request failed: ${method} ${path} - ${err.message}`);
    sendJson(res, 500, { error: err.message || '服务器内部错误' });
  }
};

module.exports = {
  handleRequest,
};
