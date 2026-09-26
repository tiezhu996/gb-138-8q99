const config = require('./config');
const { project, messages } = require('./constants');
const { sendJson } = require('./response');

const handleRequest = (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: project.id,
      message: messages.health,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.pathname === '/api/info') {
    sendJson(res, 200, {
      ...project,
      database: config.database,
    });
    return;
  }

  sendJson(res, 404, { error: messages.notFound, path: url.pathname });
};

module.exports = {
  handleRequest,
};
