/* eslint-disable no-invalid-this */
const { Router } = require("express");
const RouteUtil = require("./RouteUtil");

async function _handleRequestBase(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;

    return this.handleRequest();
}

module.exports = class RouterFactory {
    constructor() {
        this.routeUtil = RouteUtil;
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

    _registerRoute(router, {
        method, path, controller, validator = null, authorizer = null, middleware = null
    }) {
        const routerArgs = [
            path
        ];

        if (validator) {
            routerArgs.push(validator);
        }

        if (authorizer) {
            routerArgs.push(this.routeUtil.getHandlerWithManagedNextCall(authorizer));
        }

        const nextAdjustedMiddleware = !middleware ? []
            : middleware.map((m) => this.routeUtil.getHandlerWithManagedNextCall(m));

        routerArgs.push(
            ...nextAdjustedMiddleware,
            this._getWrappedController(controller)
        );
        router[method](...routerArgs);
    }

    _registerSubroute(router, {
        path, router: subrouter, middleware = [], authorizer
    }) {
        const nextAdjustedMiddleware = middleware
            .map((m) => this.routeUtil.getHandlerWithManagedNextCall(m));

        const routerArgs = [
            path
        ];

        if (authorizer) {
            routerArgs.push(this.routeUtil.getHandlerWithManagedNextCall(authorizer));
        }

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
