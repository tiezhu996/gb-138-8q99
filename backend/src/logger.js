const format = (message) => `[${new Date().toISOString()}] ${message}`;

module.exports = {
  info(message, meta) {
    if (meta === undefined) {
      console.log(format(message));
      return;
    }
    console.log(format(message), meta);
  },
  error(message, meta) {
    if (meta === undefined) {
      console.error(format(message));
      return;
    }
    console.error(format(message), meta);
  },
};
