
const expressive = require("./lib/expressive");
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

const app = new expressive.ExpressApp(router, {
    allowCors: true,
    swaggerInfo,
    swaggerDefinitions
});

app.express.listen(port, () => console.log("Listening on port " + port));
module.exports = app.express;