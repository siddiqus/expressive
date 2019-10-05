const bodyParser = require("body-parser");
const addRequestId = require("express-request-id");
const helmet = require("helmet");
const responseMiddleware = require("./response");

module.exports = class MiddlewareManager {
    constructor(
        options = {
            bodyLimit: "100kb",
            helmetOptions: null
        }
    ) {
        this.options = options;

        this.bodyParser = bodyParser;
        this.addRequestId = addRequestId;
        this.helmet = helmet;
    }

    _getBodyParser() {
        return [
            this.bodyParser.urlencoded({ extended: true }),
            this.bodyParser.json({
                limit: this.options.bodyLimit
            })
        ];
    }

    _registerHelmet(express) {
        const helmet = this.options.helmetOptions
            ? this.helmet(this.options.helmetOptions)
            : this.helmet();
        express.use(helmet);
    }

    registerMiddleware(express, userMiddleware) {
        express.use(this._getBodyParser());
        express.use(responseMiddleware);
        express.use(this.addRequestId());

        this._registerHelmet(express);

        if (userMiddleware) {
            express.use(userMiddleware);
        }
    }
};
