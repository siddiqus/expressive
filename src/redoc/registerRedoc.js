const basicAuth = require('express-basic-auth');
const redocHtml = require('./redocHtmlTemplate');

module.exports = function registerRedoc({ app, swaggerJson, url, authUser }) {
  const specUrl = '/docs/swagger.json';

  const { user, password } = authUser;
  const basicAuthMiddleware = basicAuth({
    challenge: true,
    users: { [user]: password }
  });

  app.get(specUrl, basicAuthMiddleware, (_, res) => {
    res.status(200).send(swaggerJson);
  });

  app.get(url, basicAuthMiddleware, (_, res) => {
    res.type('html');
    res.status(200).send(
      redocHtml({
        title: 'ReDoc',
        specUrl
      })
    );
  });
};
