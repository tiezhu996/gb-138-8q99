const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  port: toNumber(process.env.PORT, 3000),
  host: process.env.HOST || '0.0.0.0',
  database: {
    host: process.env.DB_HOST || 'db',
    name: process.env.DB_NAME || 'hospice_guide',
  },
};
