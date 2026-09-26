const { Pool } = require('pg');
const config = require('./config');
const logger = require('./logger');

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
});

pool.on('error', (err) => {
  logger.error(`database pool error: ${err.message}`);
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
