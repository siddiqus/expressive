# Expressive
**Expressive** is a NodeJS REST API framework built on ExpressJs, bootstrapped with conventions to minimize code. Features include:
  - Templated Routing
  - Pluggable middleware
  - API validation using Express Validator [https://github.com/express-validator/express-validator]
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

### Express App Configuration with middleware and error handling
The ExpressApp class constructor's second parameter is a configuration object that looks like this: 
```
{
    swaggerHeader = null, // this is an optional JSON with the basic swagger info e.g. name, basepath, etc.
    swaggerDefinitions, // this is an optional JSON for the swagger model definitions
    allowCors = false, // this uses the 'cors' npm module to allow CORS in the express app, default false
    middlewares = null, // Array of express middlewares can be provided (optional)
    errorMiddleware = null, // express middleware function to handle errors e.g. function(err, req, res, next){}
    basePath = "/", // Root path of the api, default "/"
}
```

### Express validation using express-validator
Expressive uses express-validator [https://github.com/express-validator/express-validator] for API endpoint validations. A validator can be added to any endpoint using the 'validator' property of a route.
```
{
  path: "/hello",
  method: "get",
  controller: someFunction, // express request handler
  validator: someValidator // optional validator -> an array as defined by Express Validator conventions
}
```


### Documentation with Swagger syntax
Each API endpoint can be documented using Swagger syntax, simply by adding a 'doc' property to the route object.
Example:
```
{
    path: "/hello",
    method: "get",
    controller: async (req, res) => res.json({ hello:"world" }),
    doc: helloDoc // json in swagger syntax
}
```

The 'doc' property could be an object like this:
```
{
    "tags": [
        "Hello"
    ],
    "description": "Say hello.",
    "responses": {
        "200": {
            "description": "Say hello.",
            "schema": {
                "type": "object",
                "properties": {
                    "hello": {
                        "type": "string",
                        "example": "world"
                    }
                }
            }
        }
    }
}
```

