import { Router } from "express";
import { validationResult } from "express-validator/check";

export default class RouterFactory {
    _hasValidationErrors(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
            return true;
        } else return false;
    }

    _getWrappedController(controller, errorHandler = null) {
        return async (req, res, next) => {
            try {
                if (!this._hasValidationErrors(req, res)) {
                    await controller(req, res, next);
                }
            } catch (e) {
                if(errorHandler){
                    errorHandler(e, req, res, next);
                } else {
                    next(e);
                }
            }
        }
    }

    _registerRoute(router, { method, path, controller, validator = [], errorHandler = null }) {
        router[method](path, validator, this._getWrappedController(controller, errorHandler));
    }

    _registerSubroute(router, { path, router: subrouter, validator = [] }) {
        router.use(path, validator, this.getExpressRouter(subrouter));
    }

    getExpressRouter(routeConfigs) {
        const router = Router({ mergeParams: true });

        if (routeConfigs.routes) {
            routeConfigs.routes.forEach((routeConf) => {
                this._registerRoute(router, routeConf);
            })
        }

        if (routeConfigs.subroutes) {
            routeConfigs.subroutes.forEach(subroute => {
                this._registerSubroute(router, subroute);
            });
        }

        return router;
    }
}