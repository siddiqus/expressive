const { Route, subroute } = require("../../../../src");

const RootGetController = require("./controllers/RootGetController");
const RootGetDoc = require("./docs/RootGetDoc");

const HelloRouter = require("../../routers/Hello/HelloRouter");

module.exports = {
    routes: [
        Route.get("/", RootGetController, {
            doc: RootGetDoc
        })
    ],
    subroutes: [
        subroute("/hello", HelloRouter)
    ]
};
