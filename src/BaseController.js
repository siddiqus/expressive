module.exports = class BaseController {
    constructor() {
        this.req = null;
        this.res = null;
        this.next = null;
    }

    async handleRequest() {
        throw new Error(`'handleRequest' not implemented in ${this.constructor.name}`);
    }

    _sendJsonResponseWithMessage(code, message) {
        return this._sendJsonResponse(code, { message });
    }

    _sendJsonResponse(code, data) {
        return !!data ? this.res.status(code).json(data) : this.res.sendStatus(code);
    }

    ok(dto = null) {
        return this._sendJsonResponse(200, dto);
    }

    created(data = null) {
        return this._sendJsonResponse(201, data);
    }

    accepted(data = null) {
        return this._sendJsonResponse(202, data);
    }

    noContent() {
        return this._sendJsonResponse(204);
    }

    badRequest(message = "Bad request") {
        return this._sendJsonResponseWithMessage(400, message);
    }

    unauthorized(message = "Unauthorized") {
        return this._sendJsonResponseWithMessage(401, message);
    }

    forbidden(message = "Forbidden") {
        return this._sendJsonResponseWithMessage(403, message);
    }

    notFound(message = "Not found") {
        return this._sendJsonResponseWithMessage(404, message);
    }

    tooMany(message = "Too many requests") {
        return this._sendJsonResponseWithMessage(429, message);
    }

    internalServerError(message = "Internal server error", body = {}) {
        return this._sendJsonResponse(500, {
            message,
            ...body
        });
    }
};
