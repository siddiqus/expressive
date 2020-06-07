const fs = require('fs');
const basicAuth = require('express-basic-auth');
const SwaggerUi = require('swagger-ui-express');
const RouteUtil = require('./RouteUtil.js');
const Utils = require('./Utils');

const { joiSchemaToSwaggerRequestParameters } = require('./CelebrateUtils');

function registerExpress({ app, swaggerJson, url, authUser }) {
  const { user, password } = authUser;
  const basicAuthMiddleware = basicAuth({
    challenge: true,
    users: { [user]: password }
  });

  app.use(
    url,
    basicAuthMiddleware,
    SwaggerUi.serve,
    SwaggerUi.setup(swaggerJson, {
      explorer: true
    })
  );

  app.get('/docs', basicAuthMiddleware, (_, res) => res.redirect(url));
}

function _sanitizeSwaggerPath(path) {
  const normalizedPath = Utils.normalizePathSlashes(path);
  if (!normalizedPath.includes(':')) return normalizedPath;

  const split = normalizedPath.split('/');

  split.forEach((p, index) => {
    if (p.includes(':')) {
      split[index] = `{${p.replace(':', '')}}`;
    }
  });
  return split.join('/');
}

function _setDocResponses(doc, validationSchema) {
  const docResponses = doc.responses || {};

  if (!docResponses[400] && validationSchema) {
    docResponses[400] = {
      description: 'Schema validation error response'
    };
  }

  if (!docResponses[200]) {
    docResponses[200] = {
      description: 'Success response'
    };
  }

  doc.responses = docResponses;
}

function _setAuthorizerDocInDescription(doc, authorizer) {
  if (!authorizer || !(typeof authorizer === 'object')) return;
  const authStr = `Authorized: ${JSON.stringify(authorizer)}`;
  if (doc.description) {
    doc.description = `${authStr}\n\n${doc.description}`;
  } else {
    doc.description = authStr;
  }
}

function _setDocParameters(doc, validationSchema) {
  doc.parameters =
    doc.parameters || joiSchemaToSwaggerRequestParameters(validationSchema);

  if (doc.parameters.find((p) => p.type === 'file')) {
    doc.consumes = ['multipart/form-data'];
  }
}

function _addPathDoc(paths, route, tags) {
  let { doc = {}, path, validationSchema, authorizer } = route;
  const { method } = route;
  path = _sanitizeSwaggerPath(path);
  doc.summary = doc.summary || path;

  _setAuthorizerDocInDescription(doc, authorizer);
  _setDocParameters(doc, validationSchema);
  _setDocResponses(doc, validationSchema);

  paths[path] = paths[path] || {};
  paths[path][method] = doc;

  if (doc.tags) tags.push(...doc.tags);
}

function _handleRedirects(paths, route) {
  const { method, path } = route;
  if (!route.redirectUrl) return;

  const redirectUrl = Utils.normalizePathSlashes(route.redirectUrl);

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

  infoList.forEach((route) => _addPathDoc(paths, route, tags));
  infoList.forEach((route) => _handleRedirects(paths, route));

  tags = Array.from(new Set(tags)).map((t) => ({ name: t }));

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

function writeSwaggerJson(router, output, basePath = '/', swaggerInfo = null) {
  const swaggerHeader = getSwaggerHeader(
    basePath,
    swaggerInfo || sampleSwaggerInfo
  );
  const swaggerJson = convertDocsToSwaggerDoc(router, swaggerHeader);
  fs.writeFileSync(output, JSON.stringify(swaggerJson, null, 4));
}

function getSwaggerHeader(basePath = '/', swaggerInfo = null) {
  return {
    swagger: '2.0',
    info: swaggerInfo || sampleSwaggerInfo,
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
