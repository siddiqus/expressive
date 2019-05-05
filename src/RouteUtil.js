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
}
