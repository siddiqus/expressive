const Express = require("express");
const cors = require("cors");
const RouterFactory = require("./RouterFactory");
const SwaggerUtils = require("./SwaggerUtils");
const MiddlewareManager = require("./middleware/MiddlewareManager");

module.exports = class ExpressApp {
    constructor(router, {
        basePath = "/",
        showSwaggerOnlyInDev = true,
        swaggerInfo = undefined,
        swaggerDefinitions,
        allowCors = false,
        middlewares = null,
        errorMiddleware = null,
        bodyLimit = "100kb"
    } = {}) {
        this.config = {
            swaggerInfo,
            showSwaggerOnlyInDev,
            swaggerDefinitions,
            basePath,
            allowCors,
            middlewares,
            errorMiddleware,
            bodyLimit
        };
        this.router = router;
        this.express = Express();
        this.SwaggerUtils = SwaggerUtils;
        this.routerFactory = new RouterFactory();

        this.middlewareManager = new MiddlewareManager({
            bodyLimit
        });

        this.registerRoutes();
    }

    _registerSwagger() {
        const swaggerHeader = this.SwaggerUtils.getSwaggerHeader(
            this.config.basePath, this.config.swaggerInfo
        );
        const swaggerJson = this.SwaggerUtils.convertDocsToSwaggerDoc(
            this.router, swaggerHeader, this.config.swaggerDefinitions
        );
        this.SwaggerUtils.registerExpress(this.express, swaggerJson);
    }

    registerRoutes() {
        if (this.config.showSwaggerOnlyInDev) {
            this._registerSwagger();
        }

        if (this.config.allowCors) {
            this.express.use(cors());
        }

        this.middlewareManager.registerMiddleware(
            this.express, this.config.middlewares
        );

        const expressRouter = this.routerFactory.getExpressRouter(this.router);
        this.express.use(this.config.basePath, expressRouter);

        if (this.config.errorMiddleware) {
            this.express.use(this.config.errorMiddleware);
        }
    }
};
