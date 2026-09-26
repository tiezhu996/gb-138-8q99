const http = require('node:http');
const config = require('./config');
const { messages } = require('./constants');
const { handleRequest } = require('./routes');
const logger = require('./logger');

const server = http.createServer(handleRequest);

server.listen(config.port, config.host, () => {
  logger.info(`${messages.serverStarted} on ${config.port}`);
});
