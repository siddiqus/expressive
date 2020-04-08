const express = require('express');
const cors = require('cors');
const { errors: celebrateErrors } = require('celebrate');
const RouterFactory = require('./RouterFactory');
const RouteUtil = require('./RouteUtil');
const SwaggerUtils = require('./SwaggerUtils');
const registerRedoc = require('./redoc/registerRedoc');
const MiddlewareManager = require('./middleware/MiddlewareManager');

module.exports = class ExpressApp {
  constructor(
    router,
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
      celebrateErrorHandler = null
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
      celebrateErrorHandler
    };
    this.router = router;

    this._init();

    this.registerHandlers();
  }

  _init() {
    this.routeUtil = RouteUtil;
    this.SwaggerUtils = SwaggerUtils;
    this.registerRedoc = registerRedoc;
    this.routerFactory = new RouterFactory();

    this.middlewareManager = new MiddlewareManager({
      bodyLimit: this.config.bodyLimit,
      helmetOptions: this.config.helmetOptions
    });

    this._setExpress();
  }

  _setExpress() {
    this.express = express();
    this.listen = this.express.listen.bind(this.express);
  }

  _registerSwagger() {
    const shouldRegister =
      (this.config.showSwaggerOnlyInDev &&
        process.env.NODE_ENV === 'development') ||
      !this.config.showSwaggerOnlyInDev;

    if (!shouldRegister) return;

    const swaggerHeader = this.SwaggerUtils.getSwaggerHeader(
      this.config.basePath,
      this.config.swaggerInfo
    );
    const swaggerJson = this.SwaggerUtils.convertDocsToSwaggerDoc(
      this.router,
      swaggerHeader,
      this.config.swaggerDefinitions
    );

    this.SwaggerUtils.registerExpress(
      this.express,
      swaggerJson,
      '/docs/swagger'
    );
    console.log('Swagger doc up and running on /docs');

    this.registerRedoc(this.express, swaggerJson, '/docs/redoc');
  }

  _configureCors() {
    if (!this.config.allowCors) return;

    const corsMiddleware = this.config.corsConfig
      ? cors(this.config.corsConfig)
      : cors();
    this.express.use(corsMiddleware);
  }

  _getDuplicateUrls() {
    const routeList = this.routeUtil.getRoutesInfo(this.router);
    const urlStrings = routeList.map(({ path, method }) => {
      const sanitizedPath =
        path.charAt(path.length - 1) === '/'
          ? path.substring(0, path.length - 1)
          : path;
      return `${method} ${sanitizedPath}`;
    });

    const duplicates = urlStrings.filter(
      (item, index) => urlStrings.indexOf(item) !== index
    );
    return duplicates;
  }

  _registerRoutes() {
    const duplicateUrls = this._getDuplicateUrls();
    if (duplicateUrls.length > 0) {
      throw new Error(
        `Duplicate endpoints detected! -> ${duplicateUrls.join(', ')}`
      );
    }

    const expressRouter = this.routerFactory.getExpressRouter(this.router);
    this.express.use(this.config.basePath, expressRouter);
  }

  _registerCelebrateMiddleware() {
    if (this.config.celebrateErrorHandler) {
      this.express.use(this.config.celebrateErrorHandler);
    } else {
      this.express.use(celebrateErrors());
    }
  }

  registerHandlers() {
    this._registerSwagger();

    this._configureCors();

    if (this.config.authorizer) {
      this.express.use(
        this.routeUtil.getHandlerWithManagedNextCall(this.config.authorizer)
      );
    }

    this.middlewareManager.registerMiddleware(
      this.express,
      this.config.middleware
    );

    this._registerRoutes();

    this._registerCelebrateMiddleware();

    if (this.config.errorHandler) {
      this.express.use(this.config.errorHandler);
    }
  }
};
