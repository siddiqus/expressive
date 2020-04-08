const expressModule = require('express');
const addRequestId = require('express-request-id');
const helmet = require('helmet');
const responseMiddleware = require('./response');
const RouteUtil = require('../RouteUtil');

const defaultNotFoundHandler = (req, res) => {
  res.status(404);
  res.json({
    message: `Route '${req.path}' not found`
  });
};

module.exports = class MiddlewareManager {
  constructor(
    options = {
      bodyLimit: '100kb',
      helmetOptions: null
    }
  ) {
    this.options = options;

    this.express = expressModule;
    this.addRequestId = addRequestId;
    this.helmet = helmet;

    this.routeUtil = RouteUtil;

    this.defaultNotFoundHandler = defaultNotFoundHandler;
  }

  _registerHelmet(express) {
    const helmet = this.options.helmetOptions
      ? this.helmet(this.options.helmetOptions)
      : this.helmet();
    express.use(helmet);
  }

  registerMiddleware(express, userMiddleware) {
    express.use(
      this.express.json({
        limit: this.options.bodyLimit
      })
    );
    express.use(responseMiddleware);
    express.use(this.addRequestId());

    this._registerHelmet(express);

    if (userMiddleware && userMiddleware.length > 0) {
      const nextManagedMiddlewares = userMiddleware.map((m) =>
        this.routeUtil.getHandlerWithManagedNextCall(m)
      );
      express.use(nextManagedMiddlewares);
    }
  }

  registerNotFoundHandler(express, notFoundHandler) {
    if (notFoundHandler) {
      express.use(notFoundHandler);
    } else {
      express.use(this.defaultNotFoundHandler);
    }
  }
};
