# Expressive
Fast, opinionated, minimalist, and conventional web framework for [node](http://nodejs.org).

**Expressive** is a NodeJS REST API framework built on ExpressJs, bootstrapped with conventions to minimize code. Features include:
  - Templated Routing
    - Write APIs with declarative endpoints (including nested endpoints) easily
  - Pluggable middleware
    - Just like Express, inject own middleware functions
  - API validation using Express Validator [https://github.com/express-validator/express-validator]
    - Validate each endpoint with Express Validator functions, and error messages will be automatically sent in the response. 
  - Centralized error handling
    - All errors thrown in controller functions will go into one user-defined error middleware function (can be defined with app constructor)
  - Doc generation through Swagger ([https://swagger.io/])
    - Each endpoint can have an associated doc using Swagger syntax (JSON/JS), making doc writing easier and distributed.
    - Swagger doc can be viewed in development at http://localhost:8080/docs

## Quickstart
Here is a basic example:

```javascript
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
```json
{
    "hello": "world"
}
```
**Notice that the express app is the *express* property of the *app* object.**


## Routing by convention
It is easy to create routes and nested routes using Expressive. Here are some points:
  - The ExpressApp class takes a 'router' parameter in its constructor
  - This 'router' object looks like this:
    ```javascript
    {
        routes: [],
        subroutes: []
    }
    ```
  - Each object in the *routes* array looks like this:
    ```javascript
    {
        path: '/some/path', // required - relative end path of endpoint
        method: "get", // required - request HTTP method
        controller: someFunction, // required - express request handler e.g. function (req, res, next) => { }
        validator: someValidatorArray, // optional - validator array in express-validator format
        errorHandler: someHandler // optional - express middleware function for error handling, e.g. function(err, req, res, next){}
    }
    ```
  - Each object in the *subroutes* array looks like this:
    ```javascript
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
```javascript
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
```javascript
{
    swaggerInfo = null, // this is an optional JSON with the basic swagger info detailed later
    swaggerDefinitions, // this is an optional JSON for the swagger model definitions
    allowCors = false, // this uses the 'cors' npm module to allow CORS in the express app, default false
    middlewares = null, // Array of express middlewares can be provided (optional)
    errorMiddleware = null, // express middleware function to handle errors e.g. function(err, req, res, next){}
    basePath = "/", // Root path of the api, default "/"
}
```

### Centralized error handling
The API endpoint controllers are all wrapped with a common try/catch block, allowing centralized error handling. To catch an error from any controller, pass an error handling middleware function to the ExpressApp constructor options parameter. For example,
```javascript
const app = new expressive.ExpressApp(router, {
  errorMiddleware: (error, req, res, next) => {
      res.status(500);
      res.send({
        message: "There was an internal error."
      });
  }
}
```

Error handling can be overridden for individual endpoints using the 'errorHandler' property in the route object. Example:
```javascript
{
    method: RestMethods.GET,
    path: "/users/:userId",
    controller: GetSpecificUser,
    validator: UserIdParamValidator,
    errorHandler: function customErrorHandler(err, req, res, next) {
        if (err.message == "Could not find user") {
            res.status(404);
            res.send("Not found");
        } else {
            res.status(500);
            res.send("Internal server error");
        }
        next();
    }
}
```

### Express validation using express-validator
Expressive uses express-validator [https://github.com/express-validator/express-validator] for API endpoint validations. A validator can be added to any endpoint using the 'validator' property of a route.
```javascript
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
```javascript
{
    path: "/hello",
    method: "get",
    controller: async (req, res) => res.json({ hello:"world" }),
    doc: helloDoc // json in swagger syntax
}
```

The 'doc' property could be an object like this:
```javascript
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
In Development, Swagger docs can be seen at the url http://localhost:8080/docs (basically /docs after your app URL in *Dev*).

---

You can initialize your app with the basic swagger 'info' property as shown below:
```javascript
const swaggerInfo = {
    version: "1.0.0",
    title: "Example Expressive App",
    contact: {
        name: "Sabbir Siddiqui",
        email: "sabbir.m.siddiqui@gmail.com"
    }
};

const app = new expressive.ExpressApp(router, {
    allowCors: true,
    swaggerInfo: swaggerInfo
});

```

---

To create a swagger.json file, the function *writeSwaggerJson* can be used from the *SwaggerUtils* export. Example:

```javascript
const { SwaggerUtils } = require("expressive");
const appConfig = {
    basePath: "/",
    swaggerInfo: {} // swagger info property as shown above
};
SwaggerUtils.writeSwaggerJson(
  router, // express router configuration
  appConfig, // json for basic Swagger info
  outputPath // absolute path of output file
)
```

### Example
See the 'example' folder in this repo.
