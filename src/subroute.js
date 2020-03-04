module.exports = (path, router, { authorizer, middleware } = {}) => {
    return {
        path,
        router,
        authorizer,
        middleware: middleware || []
    };
};
