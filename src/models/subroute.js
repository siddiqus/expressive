module.exports = (path, router, {
    middleware: []
} = {}) => {
    return {
        path,
        router,
        middleware
    };
};
