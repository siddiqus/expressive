const Ramda = require('ramda');
const RouteUtil = require('./RouteUtil');

module.exports = class AuthUtil {
  constructor() {
    this.routeUtil = RouteUtil;
  }

  getAuthInjectorMiddleware(authObject) {
    return (req, res, next) => {
      let { authorizer } = req;
      if (!authorizer) authorizer = [];

      authorizer.push(authObject);
      // eslint-disable-next-line prefer-spread
      authorizer = [].concat.apply([], authorizer);

      authorizer = Ramda.uniqWith(Ramda.eqProps, authorizer);
      req.authorizer = authorizer;
      next();
    };
  }

  getAuthorizerMiddleware(authorizer, authObjectHandler) {
    if (!authorizer) return null;

    const isObject = typeof authorizer === 'object';

    if (isObject && !authObjectHandler) {
      throw new Error(
        `'authorizer' object declared, but 'authObjectHandler' ` +
          `not defined in ExpressApp constructor params`
      );
    }

    let handlers = [];
    if (isObject) {
      handlers = [
        this.getAuthInjectorMiddleware(authorizer),
        authObjectHandler
      ];
    } else {
      handlers = [authorizer];
    }

    return handlers.map((h) => this.routeUtil.getHandlerWithManagedNextCall(h));
  }
};
