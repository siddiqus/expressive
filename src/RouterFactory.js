const { Router } = require("express");
const { validationResult } = require("express-validator");

module.exports = class RouterFactory {
    constructor() {
        this.validationResult = validationResult;
    }

    _hasValidationErrors(req, res) {
        const errors = this.validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422);
            res.json({
                errors: errors.array({
                    onlyFirstError: true
                })
            });
            return true;
        } else return false;
    }

    _getWrappedController(controller, errorHandler = null) {
        const requestHandler = new controller();
        return async (req, res, next) => {
            try {
                if (!this._hasValidationErrors(req, res)) {
                    await requestHandler.handleRequest(req, res, next);
                }
            } catch (e) {
                if (errorHandler) {
                    errorHandler(e, req, res, next);
                } else {
                    next(e);
                }
            }
        };
    }

    _registerRoute(router, {
        method, path, controller, validator = [], errorHandler = null
    }) {
        router[method](
            path,
            validator,
            this._getWrappedController(controller, errorHandler)
        );
    }

    _registerSubroute(router, {
        path, router: subrouter, validator = []
    }) {
        router.use(path, validator, this.getExpressRouter(subrouter));
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
