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

  const redirectUrl =
    url.charAt(0) === '/' ? url.substring(1, url.length) : url;
  app.get('/docs', basicAuthMiddleware, (_, res) => res.redirect(redirectUrl));
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
  if (!authorizer) return;
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

function _getUniqueArray(arr) {
  return Array.from(new Set(arr));
}

function _capitalize(string) {
  if (string.length <= 1) return string.toUpperCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function _setTagFromPath(path, doc) {
  if (!path) return;
  const tags = path
    .split('/')
    .filter(Boolean)
    .filter((s) => !s.includes(':'))
    .map((s) => s.replace(/-|_/g, ' ').split(' ').map(_capitalize).join(' '));
  if (!tags.length) return;

  if (!doc.tags) doc.tags = [];
  doc.tags = _getUniqueArray([...tags, ...doc.tags]);
}

function _addPathDoc(paths, route, tags) {
  let { doc = {}, path, validationSchema, authorizer, parentPath } = route;

  _setTagFromPath(parentPath, doc);
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

function writeSwaggerJson({
  router,
  output,
  basePath = '/',
  swaggerInfo = null,
  swaggerSecurityDefinitions = null
}) {
  const swaggerHeader = getSwaggerHeader({
    basePath,
    swaggerInfo: swaggerInfo || sampleSwaggerInfo,
    swaggerSecurityDefinitions
  });
  const swaggerJson = convertDocsToSwaggerDoc(router, swaggerHeader);
  fs.writeFileSync(output, JSON.stringify(swaggerJson, null, 4));
}

function getSwaggerHeader({
  basePath = '/',
  swaggerInfo = null,
  swaggerSecurityDefinitions = null
}) {
  const swaggerHeader = {
    swagger: '2.0',
    info: swaggerInfo || sampleSwaggerInfo,
    basePath: basePath,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json']
  };

  if (swaggerSecurityDefinitions) {
    swaggerHeader.securityDefinitions = swaggerSecurityDefinitions;
    swaggerHeader.security = Object.keys(swaggerSecurityDefinitions).map(
      (s) => ({
        [s]: []
      })
    );
  }

  return swaggerHeader;
}

module.exports = {
  getSwaggerHeader,
  registerExpress,
  convertDocsToSwaggerDoc,
  writeSwaggerJson,
  _sanitizeSwaggerPath
};
