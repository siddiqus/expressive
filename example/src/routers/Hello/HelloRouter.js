const { RestMethods } = require("../../../lib/expressive");
const GetUsers = require("./controllers/GetUsers");
const Hello = require("./controllers/Hello");
const HelloDoc = require("./docs/HelloDoc");

const HelloName = require("./controllers/HelloName");
const HelloNameDoc = require("./docs/HelloNameDoc");

const GetUserById = require("./controllers/GetUserById");
const GetUsersDoc = require("./docs/GetUsersDoc");

const UserIdParamValidator = require("./validators/UserIdParamValidator");
const HelloNameValidator = require("./validators/HelloNameValidator");

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
        {
            method: RestMethods.POST,
            path: "/",
            controller: HelloName,
            validator: HelloNameValidator,
            doc: HelloNameDoc
        },
        {
            method: RestMethods.GET,
            path: "/",
            controller: Hello,
            doc: HelloDoc
        },
        {
            method: RestMethods.GET,
            path: "/users",
            controller: GetUsers,
            doc: GetUsersDoc
        },
        {
            method: RestMethods.GET,
            path: "/users/:userId",
            controller: GetUserById,
            validator: UserIdParamValidator,
            errorHandler: customErrorHandler
        }
    ]
}