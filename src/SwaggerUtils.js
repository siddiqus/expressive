const fs = require('fs');
const SwaggerUi = require('swagger-ui-express');
const RouteUtil = require('./RouteUtil.js');
const { joiSchemaToSwaggerRequestParameters } = require('./CelebrateUtils');

function registerExpress(app, swaggerJson, url) {
  app.use(
    url,
    SwaggerUi.serve,
    SwaggerUi.setup(swaggerJson, {
      explorer: true
    })
  );

  app.get('/docs', (_, res) => res.redirect(url));
}

function _sanitizeSwaggerPath(path) {
  if (!path.includes(':')) return path;

  const split = path.split('/');

  split.forEach((p, index) => {
    if (p.includes(':')) {
      split[index] = `{${p.replace(':', '')}}`;
    }
  });
  return split.join('/');
}

function _addDocResponses(doc) {
  if (!doc.responses) {
    doc.responses = {
      200: {
        description: 'Success response'
      },
      400: {
        description: 'Schema validation error response'
      }
    };
  } else {
    doc.responses[200] = doc.responses[200] || {};
    doc.responses[400] = doc.responses[400] || {};
  }
}

function _addPathDoc(paths, route, tags) {
  let { doc, path, validationSchema } = route;
  const { method } = route;
  path = _sanitizeSwaggerPath(path);

  doc = doc || {};
  doc.summary = doc.summary || path;

  doc.parameters =
    doc.parameters || joiSchemaToSwaggerRequestParameters(validationSchema);

  _addDocResponses(doc);

  paths[path] = paths[path] || {};
  paths[path][method] = doc;

  if (doc.tags) tags.push(...doc.tags);
}

function _normalizeEndSlash(path) {
  if (path && path.charAt(path.length - 1) !== '/') return `${path}/`;
  return path;
}

function _handleRedirects(paths, route) {
  const { method, path } = route;
  const redirectUrl = _normalizeEndSlash(route.redirectUrl);
  if (!redirectUrl) return;

  const doc =
    paths[redirectUrl] && paths[redirectUrl][method]
      ? { ...paths[redirectUrl][method] }
      : {};

  doc.description = `[Redirected to ${redirectUrl}] ${doc.description || ''}`;
  doc.summary = `[Redirected to ${redirectUrl}] ${doc.summary || ''}`;

  paths[path][method] = doc;
}

function convertDocsToSwaggerDoc(
  router,
  swaggerHeader,
  swaggerDefinitions = undefined
) {
  const infoList = RouteUtil.getRoutesInfo(router);
  const paths = {};
  let tags = [];

  infoList.forEach(route => _addPathDoc(paths, route, tags));
  infoList.forEach(route => _handleRedirects(paths, route));

  tags = Array.from(new Set(tags)).map(t => ({ name: t }));

  const swaggerDoc = Object.assign({}, swaggerHeader);
  swaggerDoc.definitions = swaggerDefinitions;
  swaggerDoc.tags = tags;
  swaggerDoc.paths = paths;
  return swaggerDoc;
}

const sampleSwaggerInfo = {
  version: '1.0.0',
  title: 'Expressive API',
  contact: {
    name: 'Author',
    email: 'Your email address',
    url: ''
  }
};

function writeSwaggerJson(
  router,
  output,
  basePath = '/',
  swaggerInfo = sampleSwaggerInfo
) {
  const swaggerHeader = getSwaggerHeader(basePath, swaggerInfo);
  const swaggerJson = convertDocsToSwaggerDoc(router, swaggerHeader);
  fs.writeFileSync(output, JSON.stringify(swaggerJson, null, 4));
}

function getSwaggerHeader(basePath = '/', swaggerInfo = sampleSwaggerInfo) {
  return {
    swagger: '2.0',
    info: swaggerInfo,
    basePath: basePath,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json']
  };
}

module.exports = {
  getSwaggerHeader,
  registerExpress,
  convertDocsToSwaggerDoc,
  writeSwaggerJson,
  _sanitizeSwaggerPath
};
