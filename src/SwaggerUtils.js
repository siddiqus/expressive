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

function _getParametersFromValidationSchema(validationSchema) {
    const parameters = [];
    if (!validationSchema) return parameters;

    const { params, query, body, headers } = validationSchema;

    const parameterKeyMap = {
        path: params,
        query,
        body,
        headers
    };

    Object.keys(parameterKeyMap).forEach((parameterName) => {
        if (parameterKeyMap[parameterName]) {
            Object.keys(parameterKeyMap[parameterName]).forEach((key) => {
                const parameterSchema = parameterKeyMap[parameterName][key];
                const isRequired = parameterSchema._flags.presence === "required";
                const defaultValue = parameterSchema._flags.default;
                const type = parameterSchema.type;
                parameters.push({
                    name: key,
                    in: parameterName,
                    required: isRequired,
                    schema: {
                        type,
                        default: defaultValue
                    }
                });
            });
        }
    });

    return parameters;
}

function _addPathDoc(paths, route, tags) {
    let { doc, path, validationSchema } = route;
    const { method } = route;
    path = _sanitizeSwaggerPath(path);

    if (!doc) doc = {};

    if (!doc.summary) doc.summary = path;

    if (!doc.parameters) {
        doc.parameters = _getParametersFromValidationSchema(validationSchema);
    }

    if (!paths[path]) paths[path] = {};
    paths[path][method] = doc;

    if (doc.tags) tags.push(...doc.tags);
}

function _handleRedirects(paths, route) {
    const { method, path } = route;
    let { redirectUrl } = route;

    if (!redirectUrl) return;
    if (redirectUrl.charAt(redirectUrl.length - 1) !== "/") redirectUrl = `${redirectUrl}/`;

    if (!paths[redirectUrl]) return;

    const doc = { ...paths[redirectUrl][method] };
    doc.description = `[Redirected to ${redirectUrl}] ${doc.description || ""}`;
    doc.summary = `[Redirected to ${redirectUrl}] ${doc.summary || ""}`;
    paths[path][method] = doc;
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
    infoList.forEach((route) => _handleRedirects(paths, route));

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
