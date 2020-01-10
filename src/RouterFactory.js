const { Router } = require("express");
const { validationResult } = require("express-validator");

module.exports = class RouterFactory {
    constructor() {
        this.validationResult = validationResult;
    }

    _hasValidationErrors(req, res) {
        const errors = this.validationResult(req);
        if (errors.isEmpty()) return false;

        res.status(422);
        res.json({
            errors: errors.array()
        });
        
        return true;
    }

    _isFunction(functionToCheck) {
        return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
    }

    _getWrappedController(controller, errorHandler = null) {
        return async (req, res, next) => {
            try {
                if (!this._hasValidationErrors(req, res)) {
                    await (this._isFunction(controller) ? controller(req, res, next) : controller._handleRequestBase(req, res, next));
                }
            } catch (e) {
                return errorHandler ? errorHandler(e, req, res, next) : next(e);
            }
        };
    }

    _registerRoute(router, {
        method, path, controller, validator = [], errorHandler = null, middleware = []
    }) {
        const routerArgs = [
            path, validator, ...middleware,
            this._getWrappedController(controller, errorHandler)
        ];

        router[method](...routerArgs);
    }

    _registerSubroute(router, {
        path, router: subrouter, middleware = []
    }) {
        const routerArgs = [
            path, ...middleware,
            this.getExpressRouter(subrouter) 
        ];
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
