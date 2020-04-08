function _sendJsonResponseWithMessage(res, code, message) {
  return _sendJsonResponse(res, code, { message });
}

function _sendJsonResponse(res, code, data) {
  const wrappedData = BaseController.bodyWrapper(data);
  return !!data ? res.status(code).json(wrappedData) : res.sendStatus(code);
}

class BaseController {
  static bodyWrapper(data) {
    return data;
  }

  constructor() {
    this.req = null;
    this.res = null;
    this.next = null;
  }

  async handleRequest() {
    throw new Error(
      `'handleRequest' not implemented in ${this.constructor.name}`
    );
  }

  ok(dto = null) {
    return _sendJsonResponse(this.res, 200, dto);
  }

  created(data = null) {
    return _sendJsonResponse(this.res, 201, data);
  }

  accepted(data = null) {
    return _sendJsonResponse(this.res, 202, data);
  }

  noContent() {
    return _sendJsonResponse(this.res, 204);
  }

  badRequest(message = 'Bad request') {
    return _sendJsonResponseWithMessage(this.res, 400, message);
  }

  unauthorized(message = 'Unauthorized') {
    return _sendJsonResponseWithMessage(this.res, 401, message);
  }

  forbidden(message = 'Forbidden') {
    return _sendJsonResponseWithMessage(this.res, 403, message);
  }

  notFound(message = 'Not Found') {
    return _sendJsonResponseWithMessage(this.res, 404, message);
  }

  tooMany(message = 'Too many requests') {
    return _sendJsonResponseWithMessage(this.res, 429, message);
  }

  internalServerError(message = 'Internal server error', body = {}) {
    return _sendJsonResponse(this.res, 500, {
      message,
      ...body
    });
  }
}

module.exports = BaseController;
