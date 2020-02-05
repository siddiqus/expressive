class Route {
    constructor(
        method, path, controller, {
            validator, doc, authorizer, middleware
        } = {}
    ) {
        this.method = method;
        this.path = path;
        this.controller = controller;
        if (validator) this.validator = validator;
        if (doc) this.doc = doc;
        if (authorizer) this.authorizer = authorizer;
        if (middleware) this.middleware = middleware;
    }
}

function getRouteFn(method) {
    return (
        path, controller, {
            validator = null,
            doc = null,
            middleware = null,
            authorizer
        } = {}
    ) => new Route(method, path, controller, {
        validator,
        doc,
        authorizer,
        middleware
    });
};

Route.get = getRouteFn("get");
Route.post = getRouteFn("post");
Route.put = getRouteFn("put");
Route.delete = getRouteFn("delete");
Route.patch = getRouteFn("patch");
Route.head = getRouteFn("head");
Route.options = getRouteFn("options");

module.exports = Route;
