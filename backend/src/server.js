const http = require('node:http');
const config = require('./config');
const { messages } = require('./constants');
const { handleRequest } = require('./routes');
const { waitForDatabase, closePool } = require('./db');
const logger = require('./logger');

const server = http.createServer(handleRequest);

const start = async () => {
  await waitForDatabase();
  server.listen(config.port, config.host, () => {
    logger.info(`${messages.serverStarted} on ${config.port}`);
  });
};

const shutdown = async () => {
  server.close(() => {
    closePool().finally(() => process.exit(0));
  });
  // 连接关闭最多等 5 秒
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start().catch((error) => {
  logger.error('failed to start server', error);
  process.exit(1);
});
