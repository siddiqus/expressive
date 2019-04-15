
const expressive = require("./lib/expressive");
const router = require("./src/router");
const swaggerHeader = require("./src/docs/SwaggerHeader.json");

const port = process.env.PORT || 8080;

const app = new expressive.ExpressApp(router, {
    allowCors: true,
    swaggerHeader
});

app.express.listen(port, () => console.log("Listening on port " + port));
module.exports = app.express;