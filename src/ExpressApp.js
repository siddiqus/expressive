import Express from "express";
import cors from "cors";
import RouterFactory from "./RouterFactory";
import SwaggerUtils from "./SwaggerUtils";

export default class ExpressApp {
    constructor(router, {
        basePath = "/",
        showSwaggerOnlyInDev = true,
        swaggerInfo = undefined,
        swaggerDefinitions,
        allowCors = false,
        middlewares = null,
        errorMiddleware = null
    }) {
        this.config = {
            swaggerInfo,
            showSwaggerOnlyInDev,
            swaggerDefinitions,
            basePath,
            allowCors,
            middlewares,
            errorMiddleware
        };
        this.router = router;
        this.express = Express();
        this.register_routes();
    }

    _registerSwagger() {
        const swaggerHeader = SwaggerUtils.getSwaggerHeader(
            this.config.basePath, this.config.swaggerInfo
        );
        const swaggerJson = SwaggerUtils.convertDocsToSwaggerDoc(
            this.router, swaggerHeader, this.config.swaggerDefinitions
        );
        SwaggerUtils.registerExpress(this.express, swaggerJson);
    }

    register_routes() {
        if (this.config.showSwaggerOnlyInDev) {
            this._registerSwagger()
        }

        if (this.config.allowCors) {
            this.express.use(cors());
        }

        if (this.config.middlewares) {
            this.express.use(this.config.middlewares);
        }

        const router = new RouterFactory().getExpressRouter(this.router);
        this.express.use(this.config.basePath, router);

        if (this.config.errorMiddleware) {
            this.express.use(this.config.errorMiddleware);
        }
    }
}
