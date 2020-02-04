const FUNCTION_STRING = "function";
const CLASS_STRING = "class";
const FUNCTION_STRING_LENGTH = FUNCTION_STRING.length;

module.exports = class RouteUtil {
    static getRoutesInfo(router, paths = [], parentPath = "") {
        if (router.routes) {
            router.routes.forEach((route) => {
                const routeData = {
                    method: route.method,
                    path: `${parentPath}${route.path}`,
                };
                if (route.doc) {
                    routeData.doc = route.doc;
                }
                paths.push(routeData);
            });
        }

        if (router.subroutes) {
            router.subroutes.forEach((subroute) => {
                RouteUtil.getRoutesInfo(
                    subroute.router, paths, parentPath + subroute.path
                );
            });
        }
        return paths;
    }

    static getHandlerWithManagedNextCall(handler) {
        return async (req, res, next) => {
            try {
                await handler(req, res, next);

                if (handler.length !== 3) {
                    next();
                }
            } catch (error) {
                next(error);
            }
        };
    }

    static isFunction(functionToCheck) {
        const stringPrefix = functionToCheck.toString().substring(0, FUNCTION_STRING_LENGTH);
        if (stringPrefix.includes(CLASS_STRING)) return false;
        return functionToCheck instanceof Function || stringPrefix === FUNCTION_STRING;
    }
};
