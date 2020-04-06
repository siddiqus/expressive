const { Route } = require("../../../expressive");

const GetUsers = require("./controllers/GetUsers");
const GetUsersDoc = require("./docs/GetUsersDoc");

const GetUserById = require("./controllers/GetUserById");
const GetUserByIdDoc = require("./docs/GetUserByIdDoc");

function customErrorHandler(err, req, res, next) {
    if (err.message === "Could not find user") {
        res.status(404);
        res.send("Not found");
    } else {
        res.status(500);
        res.send("Internal server error");
    }
    next();
}

module.exports = {
    routes: [
        Route.get("/", {
            controller: GetUsers,
            doc: GetUsersDoc
        }),
        Route.get("/:userId", {
            controller: GetUserById,
            // validator: UserIdParamValidator,
            errorHandler: customErrorHandler,
            doc: GetUserByIdDoc
        })
    ]
};
