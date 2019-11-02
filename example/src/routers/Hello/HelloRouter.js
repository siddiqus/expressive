const { Route, subroute } = require("../../../expressive");
const HelloDoc = require("./docs/HelloDoc");

const HelloName = require("./controllers/HelloName");
const HelloNameDoc = require("./docs/HelloNameDoc");

const HelloNameValidator = require("./validators/HelloNameValidator");

const UsersRouter = require("../Users/UsersRouter");

module.exports = {
    routes: [
        Route.post("/", new HelloName(), {
            validator: HelloNameValidator,
            doc: HelloNameDoc
        }),
        Route.get("/", (req, res) => {
            res.json({
                hello: "world"
            });
        }, {
            doc: HelloDoc
        })
    ],
    subroutes: [
        subroute("/users", UsersRouter)
    ]
};
