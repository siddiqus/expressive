# Expressive
**Expressive** is a NodeJS API framework built on ExpressJs, bootstrapped with conventions to minimize code. This includes:
  - Templated Routing
  - Pluggable middleware
  - Doc generation through Swagger ([https://swagger.io/])

# Quickstart
Here is a basic example:

```
const expressive = require("./lib/expressive");
const router = {
    routes: [
        {
            path: "/hello",
            method: "get",
            controller: async (req, res) => {
                res.send({
                    hello: "world"
                })
            }
        }
    ]
}

const app = new expressive.ExpressApp(router);
const port = process.env.PORT || 8080;
app.express.listen(port, () => console.log("Listening on port " + port));
```
Running this node script will start an Express app on port 8080. A GET request on [http://localhost:8080/hello] will return the following JSON response
```
{
    "hello": "world"
}
```

# Routing by convention
It is easy to create routes and nested routes using Expressive. Here are some points:
  - The ExpressApp class takes a 'router' parameter in its constructor
  - This 'router' object looks like this:
    ```
    {
        routes: [],
        subroutes: []
    }
    ```
  - Each object in the *routes* array looks like this:
    ```
    {
        path: '/some/path',
        method: "get", // or put, post, delete,
        controller: someFunction // express request handler e.g. function (req, res, next) => { }
    }
    ```
  - Each object in the *subroutes* array looks like this:
    ```
    {
       path: "/some/sub/path",
       router: someRouter // this is also a router object
    }
    ```
Let's say we want to create the following routes:
  - GET /hello/
  - GET /hello/users
  - POST /hello/users

We need to define a router object as follows:
```
{
    subroutes: [
        {
            path: "/hello",
            router: {
                routes: [
                    [
                        {
                            path: "/",
                            method: "get",
                            controller: getHello // some function
                        },
                        {
                            path: "/users",
                            method: "get",
                            controller: getUsersController // some function
                        },
                        {
                            path: "/users",
                            method: "post",
                            controller: postUsersController // some function
                        }
                    ]
                ]
            }
        }
    ]
}
```

# Express App Configuration with middleware and error handling
tbd

# Documentation with Swagger syntax
tbd
