const bodyParser = require("body-parser");
const addRequestId = require("express-request-id");
const responseMiddleware = require("./response");

module.exports = class MiddlewareManager {
    constructor(options = {
        bodyLimit: "100kb"
    }) {
        this.options = options;
        this.bodyParser = bodyParser;
        this.addRequestId = addRequestId;
    }

    _getBodyParser() {
        return [
            this.bodyParser.urlencoded({ extended: true }),
            this.bodyParser.json({
                limit: this.options.bodyLimit
            })
        ];
    }

    registerMiddleware(express, userMiddleware) {
        express.use(this._getBodyParser());
        express.use(responseMiddleware);
        express.use(this.addRequestId());

        if (userMiddleware) {
            express.use(userMiddleware);
        }
    }
};
