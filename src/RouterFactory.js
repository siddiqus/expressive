const { Router } = require("express");
const { validationResult } = require("express-validator");

const FUNCTION_STRING = "function";
const CLASS_STRING = "class";
const FUNCTION_STRING_LENGTH = FUNCTION_STRING.length;

async function _handleRequestBase(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;

    return this.handleRequest();
}

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
        const stringPrefix = functionToCheck.toString().substring(0, FUNCTION_STRING_LENGTH);
        if (stringPrefix.includes(CLASS_STRING)) return false;
        return functionToCheck instanceof Function || stringPrefix === FUNCTION_STRING;
    }

    _getWrappedController(Controller, errorHandler = null) {
        return async (req, res, next) => {
            if (this._hasValidationErrors(req, res)) return;

            try {
                await (this._isFunction(Controller) ? Controller(req, res, next) : _handleRequestBase.call(new Controller(), req, res, next));
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
