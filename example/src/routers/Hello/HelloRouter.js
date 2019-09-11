const { Route, subroute } = require("../../../expressive");
const Hello = require("./controllers/Hello");
const HelloDoc = require("./docs/HelloDoc");

const HelloName = require("./controllers/HelloName");
const HelloNameDoc = require("./docs/HelloNameDoc");

const HelloNameValidator = require("./validators/HelloNameValidator");

const UsersRouter = require("../Users/UsersRouter");

module.exports = {
    routes: [
        Route.post("/", HelloName, {
            validator: HelloNameValidator,
            doc: HelloNameDoc
        }),
        Route.get("/", Hello, {
            doc: HelloDoc
        })
    ],
    subroutes: [
        subroute("/users", UsersRouter)
    ]
};
