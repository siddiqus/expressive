const RouteUtil = require('./RouteUtil');

function _getUniqueArray(arr) {
  const strArray = arr.map((a) => a.toString());
  const uniqueStrArray = strArray.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  const indicesArray = uniqueStrArray.map((u) => strArray.indexOf(u));
  return indicesArray.map((i) => arr[i]);
}

module.exports = class AuthUtil {
  constructor() {
    this.routeUtil = RouteUtil;
  }

  getMiddlewareForInjectingAuthProperties(authObject) {
    return (req) => {
      let { authorizer } = req;
      if (!authorizer) authorizer = [];

      authorizer.push(authObject);
      // eslint-disable-next-line prefer-spread
      authorizer = [].concat.apply([], authorizer);

      authorizer = _getUniqueArray(authorizer); // Ramda.uniqWith(Ramda.eqProps, authorizer);
      req.authorizer = authorizer;
    };
  }

  getAuthorizerMiddleware(authorizer, authObjectHandler) {
    if (!authorizer) return null;

    const isObject = ['object', 'string'].includes(typeof authorizer);

    if (isObject && !authObjectHandler) {
      throw new Error(
        `'authorizer' object declared, but 'authObjectHandler' ` +
          `is not defined in ExpressApp constructor params`
      );
    }

    let handlers = [];
    if (isObject) {
      handlers = [
        this.getMiddlewareForInjectingAuthProperties(authorizer),
        authObjectHandler
      ];
    } else {
      handlers = [authorizer];
    }

    return handlers.map((h) => this.routeUtil.getHandlerWithManagedNextCall(h));
  }
};
