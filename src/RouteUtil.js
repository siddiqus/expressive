const Utils = require('./Utils');
const FUNCTION_STRING = 'function';
const CLASS_STRING = 'class';
const FUNCTION_STRING_LENGTH = FUNCTION_STRING.length;

function _addRouteToPaths(paths, parentPath, route) {
  const routeData = {
    ...route,
    path: Utils.normalizePathSlashes(`${parentPath}${route.path}`),
    parentPath,
    validationSchema: route.controller.validationSchema,
    doc: route.controller.doc,
    authorizer: route.controller.authorizer
  };

  delete routeData.controller;

  Utils.clearNullValuesInObject(routeData);

  paths.push(routeData);
}

function _getSubroutes(paths, parentPath, subroute) {
  return RouteUtil.getRoutesInfo(
    subroute.router,
    paths,
    parentPath + subroute.path
  );
}

class RouteUtil {
  static getRoutesInfo(router, paths = [], parentPath = '') {
    if (!router) {
      return paths;
    }
    if (router.routes) {
      router.routes.forEach(({ path, method, controller }) =>
        _addRouteToPaths(paths, parentPath, {
          path,
          method,
          controller
        })
      );
    }

    if (router.subroutes) {
      router.subroutes.forEach((subroute) =>
        _getSubroutes(paths, parentPath, subroute)
      );
    }
    return paths;
  }

  static getHandlerWithManagedNextCall(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);

        if (handler.length !== 3) {
          return next();
        }
      } catch (error) {
        return next(error);
      }
    };
  }

  static getErrorHandlerWithManagedNextCall(handler) {
    return async (err, req, res, next) => {
      try {
        await handler(err, req, res, next);

        if (handler.length !== 4) {
          return next();
        }
      } catch (error) {
        return next(error);
      }
    };
  }

  static isFunction(functionToCheck) {
    const stringPrefix = functionToCheck
      .toString()
      .substring(0, FUNCTION_STRING_LENGTH);
    if (stringPrefix.includes(CLASS_STRING)) return false;
    return (
      functionToCheck instanceof Function || stringPrefix === FUNCTION_STRING
    );
  }

  static isUrlPath(string) {
    if (typeof string !== 'string') return false;
    const regex = /^(\/[a-zA-Z0-9\-:]+)*\/?$/g;
    return regex.test(string);
  }

  static getDuplicateUrls(expressiveRouter) {
    const routeList = RouteUtil.getRoutesInfo(expressiveRouter);
    const urlStrings = routeList.map(({ path, method }) => {
      const sanitizedPath = Utils.normalizePathSlashes(path);
      return `${method} ${sanitizedPath}`;
    });

    const duplicates = urlStrings.filter(
      (item, index) => urlStrings.indexOf(item) !== index
    );
    return duplicates;
  }
}

module.exports = RouteUtil;
