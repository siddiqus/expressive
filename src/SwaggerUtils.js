import fs from "fs";
import SwaggerUi from "swagger-ui-express";
import GetRoutesInfo from "./GetRoutesInfo";


function registerExpress(express, swaggerJson) {
    express.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerJson, {
        explorer: true
    }));
}

function convertDocsToSwaggerDoc(router, swaggerHeader, swaggerDefinitions = undefined) {
    const infoList = GetRoutesInfo(router);
    const paths = {};
    let tags = [];

    infoList.forEach((route) => {
        if (route.doc) {
            if (paths[route.path]) {
                paths[route.path][route.method] = route.doc;
            } else {
                paths[route.path] = {
                    [route.method]: route.doc
                }
            }
            tags.concat(route.doc.tags);
        }
    })

    tags = Array.from(new Set(tags)).map(t => ({ name: t }));
    return {
        ...swaggerHeader,
        definitions: swaggerDefinitions,
        tags,
        paths
    };
}

function writeSwaggerJson(router, swaggerHeader, output) {
    const swaggerJson = convertDocsToSwaggerDoc(router, swaggerHeader);
    fs.writeFileSync(output, JSON.stringify(swaggerJson, null, 4));
}

export default {
    registerExpress,
    convertDocsToSwaggerDoc,
    writeSwaggerJson
}