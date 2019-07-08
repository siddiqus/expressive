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

const methods = ["get", "post", "put", "delete", "patch", "head", "options"];
methods.forEach((m) => {
    Route[m] = getRouteFn(m);
});

module.exports = Route;
