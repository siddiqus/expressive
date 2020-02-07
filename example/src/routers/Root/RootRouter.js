const { Route, subroute } = require("../../../expressive");

const RootGetController = require("./controllers/RootGetController");
const RootGetDoc = require("./docs/RootGetDoc");

const HelloRouter = require("../../routers/Hello/HelloRouter");

module.exports = {
    routes: [
        Route.get("/", RootGetController, {
            doc: RootGetDoc
        }),
        Route.get("/hey", "/hello")
    ],
    subroutes: [
        subroute("/hello", HelloRouter, {
            authorizer: (req, res) => {
                console.log("auth from hello subroute")
            }
        })
    ]
};
