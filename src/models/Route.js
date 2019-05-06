class Route {
    constructor(
        method, path, controller, validator = null, doc = null
    ) {
        this.method = method;
        this.path = path;
        this.controller = controller;
        if (validator) this.validator = validator;
        if (doc) this.doc = doc;
    }
}

function getRouteFn(method) {
    return (path, controller, validator = null, doc = null) => new Route(method, path, controller, validator, doc)
}

Route.get = getRouteFn("get");
Route.post = getRouteFn("post");
Route.put = getRouteFn("put");
Route.delete = getRouteFn("delete");

export default Route;