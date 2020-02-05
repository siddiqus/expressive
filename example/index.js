
const { ExpressApp } = require("./expressive");
const router = require("./src/routers/Root/RootRouter");
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

function centralizedErrorHandler(err, req, res, next) {
    res.status(500).json({
        message: err.message
    });
}

const app = new ExpressApp(router, {
    allowCors: true,
    swaggerInfo,
    swaggerDefinitions,
    errorHandler: centralizedErrorHandler,
    authorizer: (req, res) => {
        console.log("auth from top");
    }
});

app.listen(port, () => console.log("Listening on port " + port));
module.exports = app.express;
