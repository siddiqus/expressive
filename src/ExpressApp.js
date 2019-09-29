const express = require("express");
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
        corsConfig = null,
        middlewares = null,
        errorMiddleware = null,
        bodyLimit = "100kb",
        helmetOptions = null
    } = {}) {
        this.config = {
            swaggerInfo,
            showSwaggerOnlyInDev,
            swaggerDefinitions,
            basePath,
            allowCors,
            corsConfig,
            middlewares,
            errorMiddleware,
            bodyLimit,
            helmetOptions
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
            this.config.basePath, this.config.swaggerInfo
        );
        const swaggerJson = this.SwaggerUtils.convertDocsToSwaggerDoc(
            this.router, swaggerHeader, this.config.swaggerDefinitions
        );
        this.SwaggerUtils.registerExpress(this.express, swaggerJson);
    }

    registerRoutes() {
        if ((this.config.showSwaggerOnlyInDev && process.env.NODE_ENV === "development")
                || !this.config.showSwaggerOnlyInDev) {
            this._registerSwagger();
        }

        if (this.config.allowCors) {
            const corsMiddleware = this.config.corsConfig ? cors(this.config.corsConfig) : cors();
            this.express.use(corsMiddleware);
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
