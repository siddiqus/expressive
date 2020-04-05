function getRouteFn(method) {
    return (
        path, {
            controller,
            middleware = [],
            validator = undefined,
            doc = undefined,
            authorizer = undefined
        } = {}
    ) => ({
        method,
        path,
        controller,
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
