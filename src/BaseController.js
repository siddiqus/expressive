module.exports = class BaseController {
    constructor() {
        this.req = null;
        this.res = null;
        this.next = null;
    }

    async _handleRequestBase(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;

        await this.handleRequest();
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

    ok(dto) {
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

    badRequest(message) {
        return this._sendJsonResponseWithMessage(400, message || "Unauthorized");
    }

    unauthorized(message) {
        return this._sendJsonResponseWithMessage(401, message || "Unauthorized");
    }

    forbidden(message) {
        return this._sendJsonResponseWithMessage(403, message || "Forbidden");
    }

    notFound(message) {
        return this._sendJsonResponseWithMessage(404, message || "Not found");
    }

    tooMany(message) {
        return this._sendJsonResponseWithMessage(429, message || "Too many requests");
    }

    internalServerError(message, body = {}) {
        return this._sendJsonResponse(500, {
            message,
            ...body
        });
    }
};
