const { RestMethods } = require("../../../lib/expressive");
const GetUsers = require("./controllers/GetUsers");
const Hello = require("./controllers/Hello");
const HelloDocs = require("./docs/HelloDocs");
const GetSpecificUser = require("./controllers/GetSpecificUser");
const UserIdParamValidator = require("./validators/UserIdParamValidator");

module.exports = {
    routes: [
        {
            method: RestMethods.GET,
            path: "/",
            controller: Hello,
            doc: HelloDocs
        },
        {
            method: RestMethods.GET,
            path: "/users",
            controller: GetUsers
        },
        {
            method: RestMethods.GET,
            path: "/users/:userId",
            controller: GetSpecificUser,
            validator: UserIdParamValidator
        }
    ]
}