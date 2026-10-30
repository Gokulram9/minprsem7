const { app, initializeServerless } = require('../index');

module.exports = async function handler(req, res) {
  await initializeServerless();
  return app(req, res);
};
