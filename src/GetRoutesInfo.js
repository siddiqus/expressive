export default function GetRoutesInfo(router, paths = [], parentPath = "") {
    if (router.routes) {
        router.routes.forEach(route => {
            const routeData = {
                method: route.method,
                path: `${parentPath}${route.path}`,
                doc: route.doc
            };
            paths.push(routeData);
        })
    }

    if (router.subroutes) {
        router.subroutes.forEach(subroute => {
            GetRoutesInfo(subroute.router, paths, parentPath + subroute.path);
        })
    }
    return paths;
}