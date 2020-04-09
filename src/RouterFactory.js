/* eslint-disable no-invalid-this */
const { Router } = require('express');
const { celebrate: celebrateMiddleware } = require('celebrate');
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
    this.celebrateMiddleware = celebrateMiddleware;
    this.CelebrateUtils = CelebrateUtils;
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

  _registerCelebrateMiddleware(validationSchema, routerArgs) {
    if (validationSchema) {
      this.CelebrateUtils.lowercaseHeaderSchemaProperties(validationSchema);
      routerArgs.push(
        this.celebrateMiddleware(validationSchema, {
          abortEarly: false
        })
      );
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

    this._registerCelebrateMiddleware(validationSchema, routerArgs);

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
    { path, router: subrouter, middleware = [], authorizer }
  ) {
    const routerArgs = [path];

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

  getExpressRouter(routeConfigs) {
    const router = this._getRouter();

    if (routeConfigs.routes) {
      routeConfigs.routes.forEach((routeConf) => {
        this._registerRoute(router, routeConf);
      });
    }

    if (routeConfigs.subroutes) {
      routeConfigs.subroutes.forEach((subroute) => {
        this._registerSubroute(router, subroute);
      });
    }

    return router;
  }
};
