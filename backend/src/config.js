const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  port: toNumber(process.env.PORT, 3000),
  host: process.env.HOST || '0.0.0.0',
  database: {
    host: process.env.DB_HOST || 'db',
    port: toNumber(process.env.DB_PORT, 5432),
    name: process.env.DB_NAME || 'hospice_guide',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
};
