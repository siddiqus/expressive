const express = require("express");
const cors = require("cors");
const RouterFactory = require("./RouterFactory");
const RouteUtil = require("./RouteUtil");
const SwaggerUtils = require("./SwaggerUtils");
const MiddlewareManager = require("./middleware/MiddlewareManager");

module.exports = class ExpressApp {
    constructor(
        router,
        {
            basePath = "/",
            showSwaggerOnlyInDev = true,
            swaggerInfo = undefined,
            swaggerDefinitions,
            allowCors = false,
            corsConfig = null,
            middleware = null,
            authorizer = null,
            errorHandler = null,
            bodyLimit = "100kb",
            helmetOptions = null
        } = {}
    ) {
        this.routeUtil = RouteUtil;

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
            authorizer
        };

        this.router = router;

        this._setExpress();

        this.SwaggerUtils = SwaggerUtils;
        this.routerFactory = new RouterFactory();

        this.middlewareManager = new MiddlewareManager({
            bodyLimit,
            helmetOptions
        });

        this.registerRoutes();
    }

    _setExpress() {
        this.express = express();
        this.listen = this.express.listen.bind(this.express);
    }

    _registerSwagger() {
        const swaggerHeader = this.SwaggerUtils.getSwaggerHeader(
            this.config.basePath,
            this.config.swaggerInfo
        );
        const swaggerJson = this.SwaggerUtils.convertDocsToSwaggerDoc(
            this.router,
            swaggerHeader,
            this.config.swaggerDefinitions
        );
        this.SwaggerUtils.registerExpress(this.express, swaggerJson);
    }

    registerRoutes() {
        if (
            (this.config.showSwaggerOnlyInDev &&
                process.env.NODE_ENV === "development") ||
            !this.config.showSwaggerOnlyInDev
        ) {
            this._registerSwagger();
        }

        if (this.config.allowCors) {
            const corsMiddleware = this.config.corsConfig
                ? cors(this.config.corsConfig)
                : cors();
            this.express.use(corsMiddleware);
        }

        if (this.config.authorizer) {
            this.express.use(this.routeUtil.getHandlerWithManagedNextCall(this.config.authorizer));
        }

        this.middlewareManager.registerMiddleware(
            this.express,
            this.config.middleware
        );

        const expressRouter = this.routerFactory.getExpressRouter(this.router);
        this.express.use(this.config.basePath, expressRouter);

        if (this.config.errorHandler) {
            this.express.use(this.config.errorHandler);
        }
    }
};
