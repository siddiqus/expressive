class Endpoint {
    constructor(
        {
            method, path, controller,
            validator, doc, authorizer, middleware
        }
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
            authorizer = null
        } = {}
    ) => new Endpoint({
        method, path, controller,
        validator,
        doc,
        authorizer,
        middleware
    });
}

module.exports = {
    get: getRouteFn("get"),
    post: getRouteFn("post"),
    put: getRouteFn("put"),
    delete: getRouteFn("delete"),
    patch: getRouteFn("patch"),
    head: getRouteFn("head"),
    options: getRouteFn("options")
};
