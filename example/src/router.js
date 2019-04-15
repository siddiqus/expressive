const HelloRouter = require("./routers/Hello/HelloRouter");

module.exports = {
    subroutes: [
        {
            path: "/hello",
            router: HelloRouter
        }
    ]
}