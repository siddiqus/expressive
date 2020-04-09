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

  registerAuthorizerForExpress(expressInstance, authorizer, authObjectHandler) {
    if (!authorizer) return;

    const isObject = typeof authorizer === 'object';

    if (isObject && !authObjectHandler) {
      throw new Error(
        `Authorizer declared as object but 'authObjectHandler' not defined in ExpressiveOptions`
      );
    }

    let authMiddleware = authorizer;
    if (isObject) {
      expressInstance.use(this.injectAuthMiddleware(authorizer));
      authMiddleware = authObjectHandler;
    }

    expressInstance.use(
      this.routeUtil.getHandlerWithManagedNextCall(authMiddleware)
    );
  }
};
