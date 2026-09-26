const project = {
  id: 'gb-138',
  name: '临终关怀信息指南',
  description: '提供临终关怀知识、症状照护、家属指导和资源清单的指南应用。',
};

const messages = {
  health: `${project.name} backend is running`,
  notFound: 'Not found',
  serverStarted: `${project.id} backend listening`,
};

module.exports = {
  project,
  messages,
};
