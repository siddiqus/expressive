import Express from "express";
import cors from "cors";
import RouterFactory from "./RouterFactory";
import SwaggerUtils from "./SwaggerUtils";

export default class ExpressApp {
    constructor(router, {
        swaggerHeader = null,
        swaggerDefinitions,
        allowCors = false,
        middlewares = null,
        errorMiddleware = null,
        basePath = "/"
    }) {
        this.config = {
            basePath,
            swaggerHeader, swaggerDefinitions,
            allowCors,
            middlewares, errorMiddleware
        };
        this.router = router;
        this.express = Express();
        this.register_routes();
    }

    register_routes() {
        if (this.config.swaggerHeader && process.env.NODE_ENV === "development") {
            const swaggerJson = SwaggerUtils.convertDocsToSwaggerDoc(
                this.router, this.config.swaggerHeader, this.config.swaggerDefinitions
            );
            SwaggerUtils.registerExpress(this.express, swaggerJson);
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
