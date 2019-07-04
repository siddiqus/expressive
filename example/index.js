
const { ExpressApp } = require("../src/index");
const router = require("./src/router");
const swaggerDefinitions = require("./docs/swaggerDefinitions");

const port = process.env.PORT || 8080;

const swaggerInfo = {
    version: "1.0.0",
    title: "Example Expressive App",
    contact: {
        name: "Sabbir Siddiqui",
        email: "sabbir.m.siddiqui@gmail.com"
    }
};

const app = new ExpressApp(router, {
    allowCors: true,
    swaggerInfo,
    swaggerDefinitions
});

app.listen(port, () => console.log("Listening on port " + port));
module.exports = app.express;
