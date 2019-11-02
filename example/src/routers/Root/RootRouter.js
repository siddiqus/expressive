const { Route, subroute } = require("../../../expressive");

const RootGetController = require("./controllers/RootGetController");
const RootGetDoc = require("./docs/RootGetDoc");

const HelloRouter = require("../../routers/Hello/HelloRouter");

module.exports = {
    routes: [
        Route.get("/", new RootGetController(), {
            doc: RootGetDoc
        })
    ],
    subroutes: [
        subroute("/hello", HelloRouter)
    ]
};
