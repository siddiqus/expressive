function getRouteFn(method) {
    return (
        ...args
    ) => {
        const [path] = args;

        if (
            args.length === 2
            && args[1].__proto__.constructor.name === "Object"
        ) { // 2nd is not object
            return {
                method,
                path,
                ...args[1]
            };
        };

        const [, controller, params = {}] = args;
        return {
            method,
            path,
            controller,
            ...params
        };
    };
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
