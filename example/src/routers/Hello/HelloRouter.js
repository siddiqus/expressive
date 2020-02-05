const { Route, subroute } = require("../../../expressive");
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
        Route.get("/", (req, res) => {
            res.json({
                hello: "world"
            });
        }, {
            doc: HelloDoc,
            middleware: [
                async (req, res) => console.log("from mid 1"),
                (req, res, next) => console.log("from mid 2") || next(),
            ],
            authorizer: (req, res) => {
                console.log("auth from hello route")
            }
        })
    ],
    subroutes: [
        subroute("/users", UsersRouter, {
            middleware: [
                async (req, res) => console.log("from mid 1"),
                (req, res) => console.log("from mid 2"),
            ]
        })
    ]
};
