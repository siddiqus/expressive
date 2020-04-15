/* eslint-disable no-invalid-this */
const { Router } = require('express');
const RouteUtil = require('./RouteUtil');
const AuthUtil = require('./AuthUtil');
const CelebrateUtils = require('./CelebrateUtils');

async function _handleRequestBase(req, res, next) {
  this.req = req;
  this.res = res;
  this.next = next;

  return this.handleRequest();
}

module.exports = class RouterFactory {
  constructor(expressiveOptions) {
    this.expressiveOptions = expressiveOptions;
    this.routeUtil = RouteUtil;
    this.authUtil = new AuthUtil();
    this.celebrateUtils = new CelebrateUtils();
  }

  async _executeController(controller, { req, res, next }) {
    if (this.routeUtil.isUrlPath(controller)) {
      return res.redirect(controller);
    }

    if (this.routeUtil.isFunction(controller)) {
      return controller(req, res, next);
    }

    const Controller = controller;
    return _handleRequestBase.call(new Controller(), req, res, next);
  }

  _getWrappedController(controller) {
    return async (req, res, next) => {
      try {
        await this._executeController(controller, { req, res, next });
      } catch (e) {
        return next(e);
      }
    };
  }

  _registerCelebrateErrorHandler(validationSchema, routerArgs) {
    const middleware = this.celebrateUtils.getCelebrateMiddleware(
      validationSchema
    );
    if (middleware) {
      routerArgs.push(middleware);
    }
  }

  _setAuthorizerMiddleware(authorizer, routerArgs) {
    const authMiddleware = this.authUtil.getAuthorizerMiddleware(
      authorizer,
      this.expressiveOptions.authObjectHandler
    );

    if (authMiddleware) {
      routerArgs.push(authMiddleware);
    }
  }

  _registerRoute(
    router,
    {
      method,
      path,
      controller,
      validationSchema = null,
      authorizer = null,
      middleware = null
    }
  ) {
    const routerArgs = [path];

    this._registerCelebrateErrorHandler(validationSchema, routerArgs);

    this._setAuthorizerMiddleware(authorizer, routerArgs);

    const nextAdjustedMiddleware = !middleware
      ? []
      : middleware.map((m) => this.routeUtil.getHandlerWithManagedNextCall(m));

    routerArgs.push(
      ...nextAdjustedMiddleware,
      this._getWrappedController(controller)
    );

    router[method](...routerArgs);
  }

  _registerSubroute(
    router,
    { path, router: subrouter, middleware = [], authorizer, validationSchema }
  ) {
    const routerArgs = [path];

    this._registerCelebrateErrorHandler(validationSchema, routerArgs);
    this._setAuthorizerMiddleware(authorizer, routerArgs);

    const nextAdjustedMiddleware = middleware.map((m) =>
      this.routeUtil.getHandlerWithManagedNextCall(m)
    );

    routerArgs.push(
      ...nextAdjustedMiddleware,
      this.getExpressRouter(subrouter)
    );

    router.use(...routerArgs);
  }

  _getRouter() {
    return new Router({
      mergeParams: true
    });
  }

  _handleDuplicateUrls(expressiveRouter) {
    const duplicateUrls = this.routeUtil.getDuplicateUrls(expressiveRouter);
    if (duplicateUrls.length > 0) {
      throw new Error(
        `Duplicate endpoints detected! -> ${duplicateUrls.join(', ')}`
      );
    }
  }

  getExpressRouter(expressiveRouter) {
    this._handleDuplicateUrls(expressiveRouter);

    const router = this._getRouter();

    if (expressiveRouter.routes) {
      expressiveRouter.routes.forEach((routeConf) => {
        this._registerRoute(router, routeConf);
      });
    }

    if (expressiveRouter.subroutes) {
      expressiveRouter.subroutes.forEach((subroute) => {
        this._registerSubroute(router, subroute);
      });
    }

    return router;
  }
};
