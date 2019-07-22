class Route {
    constructor(
        method, path, controller, {
            validator, doc, errorHandler
        } = {}
    ) {
        this.method = method;
        this.path = path;
        this.controller = controller;
        if (validator) this.validator = validator;
        if (doc) this.doc = doc;
        if (errorHandler) this.errorHandler = errorHandler;
    }
}

function getRouteFn(method) {
    return (
        path, controller, {
            validator = null,
            doc = null,
            errorHandler = null
        } = {}
    ) => new Route(method, path, controller, {
        validator,
        doc,
        errorHandler
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
