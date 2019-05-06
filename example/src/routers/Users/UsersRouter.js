const { Route } = require("../../../lib/expressive");

const GetUsers = require("./controllers/GetUsers");
const GetUsersDoc = require("./docs/GetUsersDoc");

const GetUserById = require("./controllers/GetUserById");
const UserIdParamValidator = require("./validators/UserIdParamValidator");

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
        Route.get("/", GetUsers, {
            doc: GetUsersDoc
        }),
        Route.get("/:userId", GetUserById, {
            validator: UserIdParamValidator,
            errorHandler: customErrorHandler
        })
    ]
};
