const expressModule = require('express');
const addRequestId = require('express-request-id');
const helmet = require('helmet');
const cors = require('cors');
const { errors: celebrateErrors } = require('celebrate');
const responseMiddleware = require('./response');
const RouteUtil = require('../RouteUtil');
const AuthUtil = require('../AuthUtil');
const SwaggerUtils = require('../SwaggerUtils');
const registerRedoc = require('../redoc/registerRedoc');

module.exports = class MiddlewareManager {
  constructor(expressiveConfig, expressApp) {
    this.options = expressiveConfig;
    this.express = expressApp;

    this._initDependencies();
  }

  _initDependencies() {
    this.expressModule = expressModule;
    this.addRequestId = addRequestId;
    this.helmet = helmet;

    this.routeUtil = RouteUtil;
    this.authUtil = new AuthUtil();
    this.SwaggerUtils = SwaggerUtils;
    this.registerRedoc = registerRedoc;
    this.celebrateErrors = celebrateErrors;
  }

  defaultNotFoundHandler(req, res) {
    res.status(404);
    res.json({
      message: `Route '${req.path}' not found`
    });
  }

  _registerHelmet() {
    const helmet = this.options.helmetOptions
      ? this.helmet(this.options.helmetOptions)
      : this.helmet();
    this.express.use(helmet);
  }

  registerBasicMiddleware() {
    const { middleware: userMiddleware } = this.options;
    this.express.use(
      this.expressModule.json({
        limit: this.options.bodyLimit
      })
    );
    this.express.use(this.expressModule.urlencoded({ extended: true }));
    this.express.use(responseMiddleware);
    this.express.use(this.addRequestId());

    this._registerHelmet();

    if (userMiddleware && userMiddleware.length > 0) {
      const nextManagedMiddlewares = userMiddleware.map((m) =>
        this.routeUtil.getHandlerWithManagedNextCall(m)
      );
      this.express.use(nextManagedMiddlewares);
    }
  }

  registerNotFoundHandler() {
    const { notFoundHandler } = this.options;
    if (notFoundHandler) {
      this.express.use(notFoundHandler);
    } else {
      this.express.use(this.defaultNotFoundHandler);
    }
  }

  registerAuth() {
    const { authorizer, authObjectHandler } = this.options;
    const authMiddleware = this.authUtil.getAuthorizerMiddleware(
      authorizer,
      authObjectHandler
    );

    if (authMiddleware) {
      this.express.use(authMiddleware);
    }
  }

  registerCelebrateMiddleware() {
    const { celebrateErrorHandler } = this.options;
    if (celebrateErrorHandler) {
      this.express.use(celebrateErrorHandler);
    } else {
      this.express.use(this.celebrateErrors());
    }
  }

  configureCors() {
    if (!this.options.allowCors) return;

    const corsMiddleware = this.options.corsConfig
      ? cors(this.options.corsConfig)
      : cors();
    this.express.use(corsMiddleware);
  }

  registerDocs(expressiveRouter) {
    const env = process.env.NODE_ENV || 'development';
    const shouldRegister =
      (this.options.showSwaggerOnlyInDev && env === 'development') ||
      !this.options.showSwaggerOnlyInDev;

    if (!shouldRegister) return;

    const swaggerHeader = this.SwaggerUtils.getSwaggerHeader(
      this.options.basePath,
      this.options.swaggerInfo
    );
    const swaggerJson = this.SwaggerUtils.convertDocsToSwaggerDoc(
      expressiveRouter,
      swaggerHeader,
      this.options.swaggerDefinitions
    );

    this.SwaggerUtils.registerExpress(
      this.express,
      swaggerJson,
      '/docs/swagger'
    );
    console.log('Swagger doc up and running on /docs');

    this.registerRedoc(this.express, swaggerJson, '/docs/redoc');
  }
};
