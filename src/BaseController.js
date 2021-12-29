function _sendJsonResponseWithMessage(res, code, message) {
  return _sendJsonResponse(res, code, { message });
}

function _sendJsonResponse(res, code, data) {
  const wrappedData = BaseController.responseMapper(data);
  if (!!data) {
    res.status(code);
    res.json(wrappedData);
  } else {
    res.sendStatus(code);
  }
}

class BaseController {
  static responseMapper(data) {
    return data;
  }

  static requestMapper(req) {
    return req;
  }

  constructor() {
    this.req = null;
    this.res = null;
    this.next = null;

    this.validationSchema = null;
    this.authorizer = null;
    this.middleware = null;
    this.doc = null;
    this.pre = null;

    this.resolvedBy = null;
  }

  async handleRequest() {
    throw new Error(
      `'handleRequest' not implemented in ${this.constructor.name}`
    );
  }

  getData() {
    const { body, query, params, fileUpload, user } = this.req;
    return {
      body,
      query,
      params,
      fileUpload,
      user
    };
  }

  getHeaders() {
    return this.req.headers;
  }

  getCookies() {
    return {
      cookies: this.req.cookies,
      signedCookies: this.req.signedCookies
    };
  }

  ok(dto = null) {
    this.resolvedBy = 'ok';
    return _sendJsonResponse(this.res, 200, dto);
  }

  created(data = null) {
    this.resolvedBy = 'created';
    return _sendJsonResponse(this.res, 201, data);
  }

  accepted(data = null) {
    this.resolvedBy = 'accepted';
    return _sendJsonResponse(this.res, 202, data);
  }

  noContent() {
    this.resolvedBy = 'noContent';
    return _sendJsonResponse(this.res, 204);
  }

  badRequest(message = 'Bad request') {
    this.resolvedBy = 'badRequest';
    return _sendJsonResponseWithMessage(this.res, 400, message);
  }

  unauthorized(message = 'Unauthorized') {
    this.resolvedBy = 'unauthorized';
    return _sendJsonResponseWithMessage(this.res, 401, message);
  }

  forbidden(message = 'Forbidden') {
    this.resolvedBy = 'forbidden';
    return _sendJsonResponseWithMessage(this.res, 403, message);
  }

  notFound(message = 'Not Found') {
    this.resolvedBy = 'notFound';
    return _sendJsonResponseWithMessage(this.res, 404, message);
  }

  tooMany(message = 'Too many requests') {
    this.resolvedBy = 'tooMany';
    return _sendJsonResponseWithMessage(this.res, 429, message);
  }

  internalServerError(message = 'Internal server error', body = {}) {
    this.resolvedBy = 'internalServerError';
    return _sendJsonResponse(this.res, 500, {
      message,
      ...body
    });
  }

  notImplemented(message = 'Not implemented') {
    this.resolvedBy = 'notImplemented';
    return _sendJsonResponseWithMessage(this.res, 501, message);
  }
}

module.exports = BaseController;
