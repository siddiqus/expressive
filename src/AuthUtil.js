const Ramda = require('ramda');
const RouteUtil = require('./RouteUtil');

module.exports = class AuthUtil {
  constructor() {
    this.routeUtil = RouteUtil;
  }

  injectAuthMiddleware(authObject) {
    return (req) => {
      let { authorizer } = req;
      if (!authorizer) authorizer = [];

      authorizer.push(authObject);
      authorizer = authorizer.flat();

      authorizer = Ramda.uniqWith(Ramda.eqProps, authorizer);
      req.authorizer = authorizer;
    };
  }

  getAuthorizerMiddleware(authorizer, authObjectHandler) {
    if (!authorizer) return null;

    const isObject = typeof authorizer === 'object';

    if (isObject && !authObjectHandler) {
      throw new Error(
        `Authorizer declared as object but 'authObjectHandler' not defined in ExpressiveOptions`
      );
    }

    const handlers = [];
    let authMiddleware = authorizer;
    if (isObject) {
      handlers.push(this.injectAuthMiddleware(authorizer));
      authMiddleware = authObjectHandler;
    }

    handlers.push(this.routeUtil.getHandlerWithManagedNextCall(authMiddleware));

    return handlers;
  }
};
