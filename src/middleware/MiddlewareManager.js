const express = require("express");
const addRequestId = require("express-request-id");
const helmet = require("helmet");
const responseMiddleware = require("./response");
const RouteUtil = require("../RouteUtil");

module.exports = class MiddlewareManager {
    constructor(
        options = {
            bodyLimit: "100kb",
            helmetOptions: null
        }
    ) {
        this.options = options;

        this.express = express;
        this.addRequestId = addRequestId;
        this.helmet = helmet;

        this.routeUtil = RouteUtil;
    }

    _registerHelmet(express) {
        const helmet = this.options.helmetOptions
            ? this.helmet(this.options.helmetOptions)
            : this.helmet();
        express.use(helmet);
    }

    registerMiddleware(express, userMiddleware) {
        express.use(this.express.json({
            limit: this.options.bodyLimit
        }));
        express.use(responseMiddleware);
        express.use(this.addRequestId());

        this._registerHelmet(express);

        if (userMiddleware) {
            const nextManagedMiddlewares = userMiddleware
                .map((m) => this.routeUtil.getHandlerWithManagedNextCall(m));
            express.use(nextManagedMiddlewares);
        }
    }
};
