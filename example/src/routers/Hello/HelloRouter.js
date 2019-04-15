const { RestMethods } = require("../../../lib/expressive");
const GetUsers = require("./controllers/GetUsers");
const Hello = require("./controllers/Hello");
const HelloDocs = require("./docs/HelloDocs");

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
        }
    ]
}