const express = require('express');
const RouterFactory = require('./RouterFactory');
const RouteUtil = require('./RouteUtil');
const AuthUtil = require('./AuthUtil');
const MiddlewareManager = require('./middleware/MiddlewareManager');

module.exports = class ExpressApp {
  constructor(
    expressiveRouter,
    {
      basePath = '/',
      showSwaggerOnlyInDev = true,
      swaggerInfo = undefined,
      swaggerDefinitions = undefined,
      allowCors = false,
      corsConfig = null,
      middleware = null,
      authorizer = null,
      errorHandler = null,
      bodyLimit = '100kb',
      helmetOptions = null,
      celebrateErrorHandler = null,
      notFoundHandler = null,
      authObjectHandler = null
    } = {}
  ) {
    this.config = {
      swaggerInfo,
      showSwaggerOnlyInDev,
      swaggerDefinitions,
      basePath,
      allowCors,
      corsConfig,
      middleware,
      errorHandler,
      bodyLimit,
      helmetOptions,
      authorizer,
      celebrateErrorHandler,
      notFoundHandler,
      authObjectHandler
    };
    this.expressiveRouter = expressiveRouter;

    this._init();

    this.registerHandlers();
  }

  _init() {
    this.routeUtil = RouteUtil;
    this.authUtil = new AuthUtil();
    this.routerFactory = new RouterFactory(this.config);

    this.express = express();
    this.listen = this.express.listen.bind(this.express);
    this.middlewareManager = new MiddlewareManager(this.config, this.express);
  }

  _registerRoutes() {
    const expressRouter = this.routerFactory.getExpressRouter(
      this.expressiveRouter
    );
    this.express.use(this.config.basePath, expressRouter);
  }

  _registerErrorHandlers() {
    if (!this.config.errorHandler) return;

    let errorHandler;
    if (Array.isArray(this.config.errorHandler)) {
      errorHandler = this.config.errorHandler.map(
        (e) => (err, req, res, next) => e(err, req, res, next)
      );
    } else {
      errorHandler = (err, req, res, next) =>
        this.config.errorHandler(err, req, res, next);
    }
    this.express.use(errorHandler);
  }

  registerHandlers() {
    this.middlewareManager.registerDocs(this.expressiveRouter);

    this.middlewareManager.configureCors();

    this.middlewareManager.registerBasicMiddleware();

    this.middlewareManager.registerAuth();

    this._registerRoutes();

    this.middlewareManager.registerNotFoundHandler();

    this.middlewareManager.registerCelebrateErrorMiddleware();

    this._registerErrorHandlers();
  }
};
