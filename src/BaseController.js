function _sendJsonResponseWithMessage(code, message) {
    return _sendJsonResponse.call(this, code, { message });
}

function _sendJsonResponse(code, data) {
    return !!data ? this.res.status(code).json(data) : this.res.sendStatus(code);
}

module.exports = class BaseController {
    constructor() {
        this.req = null;
        this.res = null;
        this.next = null;
    }

    async handleRequest() {
        throw new Error(`'handleRequest' not implemented in ${this.constructor.name}`);
    }

    ok(dto = null) {
        return _sendJsonResponse.call(this, 200, dto);
    }

    created(data = null) {
        return _sendJsonResponse.call(this, 201, data);
    }

    accepted(data = null) {
        return _sendJsonResponse.call(this, 202, data);
    }

    noContent() {
        return _sendJsonResponse.call(this, 204);
    }

    badRequest(message = "Bad request") {
        return _sendJsonResponseWithMessage.call(this, 400, message);
    }

    unauthorized(message = "Unauthorized") {
        return _sendJsonResponseWithMessage.call(this, 401, message);
    }

    forbidden(message = "Forbidden") {
        return _sendJsonResponseWithMessage.call(this, 403, message);
    }

    notFound(message = "Not Found") {
        return _sendJsonResponseWithMessage.call(this, 404, message);
    }

    tooMany(message = "Too many requests") {
        return _sendJsonResponseWithMessage.call(this, 429, message);
    }

    internalServerError(message = "Internal server error", body = {}) {
        return _sendJsonResponse.call(this, 500, {
            message,
            ...body
        });
    }
};
