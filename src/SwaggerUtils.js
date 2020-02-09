const fs = require("fs");
const SwaggerUi = require("swagger-ui-express");
const RouteUtil = require("./RouteUtil.js");

function registerExpress(app, swaggerJson, url) {
    app.use(url, SwaggerUi.serve, SwaggerUi.setup(swaggerJson, {
        explorer: true,
    }));

    app.get("/docs", (_, res) => res.redirect(url));
}

function _sanitizeSwaggerPath(path) {
    if (!path.includes(":")) return path;

    const split = path.split("/");

    split.forEach((p, index) => {
        if (p.includes(":")) {
            split[index] = `{${p.replace(":", "")}}`;
        }
    });
    return split.join("/");
}

function _addPathDoc(paths, route, tags) {
    let { doc, path } = route;
    const { method } = route;
    path = _sanitizeSwaggerPath(path);

    if (!doc) doc = {};

    if (!paths[path]) paths[path] = {};
    paths[path][method] = doc;

    if (doc.tags) tags.push(...doc.tags);
}

function convertDocsToSwaggerDoc(
    router,
    swaggerHeader,
    swaggerDefinitions = undefined
) {
    const infoList = RouteUtil.getRoutesInfo(router);
    const paths = {};
    let tags = [];

    infoList.forEach((route) => _addPathDoc(paths, route, tags));

    tags = Array.from(new Set(tags)).map((t) => ({ name: t }));

    const swaggerDoc = Object.assign({}, swaggerHeader);
    swaggerDoc.definitions = swaggerDefinitions;
    swaggerDoc.tags = tags;
    swaggerDoc.paths = paths;
    return swaggerDoc;
}

const sampleSwaggerInfo = {
    version: "1.0.0",
    title: "Expressive API",
    contact: {
        name: "Author",
        email: "Your email address",
        url: "",
    },
};

function writeSwaggerJson(
    router,
    output,
    basePath = "/",
    swaggerInfo = sampleSwaggerInfo
) {
    const swaggerHeader = getSwaggerHeader(basePath, swaggerInfo);
    const swaggerJson = convertDocsToSwaggerDoc(router, swaggerHeader);
    fs.writeFileSync(output, JSON.stringify(swaggerJson, null, 4));
}

function getSwaggerHeader(
    basePath = "/",
    swaggerInfo = sampleSwaggerInfo
) {
    return {
        "swagger": "2.0",
        "info": swaggerInfo,
        "basePath": basePath,
        "schemes": [
            "http",
            "https",
        ],
        "consumes": [
            "application/json",
        ],
        "produces": [
            "application/json",
        ],
    };
}

module.exports = {
    getSwaggerHeader,
    registerExpress,
    convertDocsToSwaggerDoc,
    writeSwaggerJson,
    _sanitizeSwaggerPath
};
