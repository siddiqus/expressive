[![Expressive Logo](https://raw.githubusercontent.com/siddiqus/expressive/master/logo.png)](https://github.com/siddiqus/expressive/)

[![Build Status](https://travis-ci.org/siddiqus/expressive.svg?branch=master)](https://travis-ci.org/siddiqus/expressive)
[![Coverage Status](https://coveralls.io/repos/github/siddiqus/expressive/badge.svg?branch=master)](https://coveralls.io/github/siddiqus/expressive?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/533736ee85578f98a732/maintainability)](https://codeclimate.com/github/siddiqus/expressive/maintainability)
[![codebeat badge](https://codebeat.co/badges/6e3ba61c-d5cf-4a05-9aa7-ee7dd1591fe2)](https://codebeat.co/projects/github-com-siddiqus-expressive-master)

# Expressive
Fast, opinionated, minimalist, and conventional REST API framework for [node](http://nodejs.org).

**Expressive** is a NodeJS REST API framework built on ExpressJs, bootstrapped with conventions to minimize code. Features include:
  - Templated Routing
    - Write APIs with declarative endpoints (including nested endpoints) easily
  - Pluggable middleware with built-ins
    - Inject own middleware just like Express
    - Built in middleware e.g. body-parser, cors, etc.
    - Security middleware i.e. helmet
  - API validation using Express Validator https://github.com/express-validator/express-validator
    - Validate each endpoint with Express Validator functions, and error messages will be automatically sent in the response. 
  - Centralized error handling
    - All errors thrown in controller functions will go into one user-defined error middleware function (can be defined with app constructor)
  - Doc generation through Swagger https://swagger.io/
    - Each endpoint can have an associated doc using Swagger syntax (JSON/JS), making doc writing easier and distributed.
    - Swagger doc can be viewed in development at http://localhost:8080/docs

## Quickstart
Install the package:  ```npm i -S @siddiqus/expressive```

Here is a basic example:
__*It is required for controllers to extend BaseController. This also allows for dependencies to be instantiated inside the constructor, which can be useful for testing.__

```javascript
const { Route, ExpressApp, BaseController } = require("@siddiqus/expressive");

class HelloGetController extends BaseController {
  handleRequest (req, res) => {
    res.send({
        hello: "world"
    })
  };
}

const router = {
    routes: [
      Route.get("/hello", HelloGetController)
    ]
}

const app = new ExpressApp(router);
const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Listening on port " + port));
```
Running this node script will start an Express app on port 8080. A GET request on [http://localhost:8080/hello] will return the following JSON response
```json
{
    "hello": "world"
}
```

The ExpressJS app can be used from the *express* property of the *app* object e.g. ```app.express```


## Routing by convention
It is easy to create routes and nested routes using Expressive. Here are some points to note:
  - The ExpressApp class takes a 'router' parameter in its constructor
  - This 'router' object looks like this:
    ```javascript
    {
        routes: [],
        subroutes: []
    }
    ```
  - Each object in the *routes* array is an instance of the Route class. For example, we can use the Route class's GET method to create a GET endpoint like so:
    ```javascript
    const { Route } = require("@siddiqus/expressive");

    const helloGetRoute = Route.get(
      "/some/path", // required - relative end path of endpoint
      SomeController, // required - express request handler e.g. function (req, res, next) => { }
      {
        doc: someDocJs, // optional - Swagger json format for a given endpoint
        validator: someExpressValidator, // optional - validator array in express-validator format
        errorHandler: someErrorHandlerFunction // optional - express middleware to handle errors for this specific endpoint, e.g. function(err, req, res, next){}
      }
    );
    ```
    Similarly, the class methods `post`, `put`, `delete`, `patch`, `head`, and `options` are available for the Route class e.g.  `Route.post`.

  - Each object in the *subroutes* array can be constructed using the `subroute` function, like so:
    ```javascript
    const { subroute } = require("@siddiqus/expressive");

    const router = {
      subroutes: [
        subroute("/some/sub/path", someRouter) // 'someRouter' is another router object
      ]
    };
    ```

Let's say we want to create an API with the following routes:
  - GET /
  - GET /hello/
  - GET /hello/users
  - POST /hello/users

We need to define a router object as follows:
```javascript
const { Route, subroute } = require("@siddiqus/expressive");

const helloRouter = {
    routes: [
        [
            // with some predefined controller functions
            Route.get("/", GetHelloController), 
            Route.get("/users", GetUsersController),
            Route.post("/users", PostUsersController)
        ]
    ]
}

const apiRouter = {
    routes: [
	    Route.get("/", ApiRootController) // some predefined controller
    ],
    subroutes: [
	    subroute("/hello", helloRouter)
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
    corsConfig = null, // config for cors based on the 'cors' npm module, if none is provided, then allows all origin
    middlewares = null, // Array of express middlewares can be provided (optional)
    errorMiddleware = null, // express middleware function to handle errors e.g. function(err, req, res, next){}
    basePath = "/", // Root path of the api, default "/"
}
```

The Expressive app comes with the following built-in middleware:
- [body-parser](https://www.npmjs.com/package/body-parser) - manage request body in middleware
- [cors](https://www.npmjs.com/package/cors) - Allow CORS requests
- [express-request-id](https://www.npmjs.com/package/express-request-id) - Assign a unique ID for each request
- [helmet](https://www.npmjs.com/package/helmet) - Add various HTTP headers for basic security 

The 'middlewares' property in the app config object is an array of middleware functions that are injected after the built-in middleware for API request handling.

### CORS
You can enable CORS through the [cors](https://www.npmjs.com/package/cors) module using Expressive like this:
```javascript
const app = new ExpressApp(router, {
    allowCors: true
});
```

This will allow CORS for all origins. If you want to configure CORS as per the module's documentation, you can do so with the 'corsConfig' parameter:

```javascript
const app = new ExpressApp(router, {
    allowCors: true,
    corsConfig: {
        origin: 'http://example.com',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
});
```

### Centralized error handling
The API endpoint controllers are all wrapped with a common try/catch block, allowing centralized error handling. To catch an error from any controller, pass an error handling middleware function to the ExpressApp constructor options parameter. For example,
```javascript
const { ExpressApp } = require("@siddiqus/expressive");

const app = new ExpressApp(router, {
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
const { Route } = require("@siddiqus/expressive");

function customErrorHandler(err, req, res, next) {
  if (err.message == "Could not find user") {
      res.status(404);
      res.send("Not found");
  } else {
      res.status(500);
      res.send("Internal server error");
  }
  next();
}

const getUserById = Route.get(
  "/users/:userId", 
  GetSpecificUser, // some predefined controller
  {
    errorHandler: customErrorHandler
  }
);
```

### Express validation using express-validator
Expressive uses express-validator [https://github.com/express-validator/express-validator] for API endpoint validations. A validator can be added to any endpoint using the 'validator' property of a route.
```javascript
const { Route } = require("@siddiqus/expressive");

const getUserById = Route.get(
  "/users/:userId", 
  GetSpecificUser, // some predefined controller
  {
    validator: UserIdParamValidator, // some predefined validator
  }
);
```

### Documentation with Swagger syntax
Each API endpoint can be documented using Swagger syntax, simply by adding a 'doc' property to the route object.
Example:
```javascript
const getUserById = Route.get(
    "/hello", 
    GetHelloController, // some predefined controller
    {
        doc: GetHelloDocJs // Swagger doc format for an endpoint
    }
);
```

The 'GetUserByIdDocJs' JS or JSON could be something like this: 
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
const { ExpressApp } = require("@siddiqus/expressive");

const swaggerInfo = {
    version: "1.0.0",
    title: "Example Expressive App",
    contact: {
        name: "Sabbir Siddiqui",
        email: "sabbir.m.siddiqui@gmail.com"
    }
};

const app = new ExpressApp(router, {
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
