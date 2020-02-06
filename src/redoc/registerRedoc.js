const redocHtml = require("./redocHtmlTemplate");

module.exports = function registerRedoc(app, swaggerJson, url) {
    const specUrl = "/docs/swagger.json";

    app.get(specUrl, (_, res) => {
        res.status(200).send(swaggerJson);
    });

    app.get(url, (_, res) => {
        res.type("html");
        res.status(200).send(redocHtml({
            title: "ReDoc",
            specUrl
        }));
    });
}