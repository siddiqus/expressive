[![Expressive Logo](https://raw.githubusercontent.com/siddiqus/expressive/master/logo.png)](https://github.com/siddiqus/expressive/)

[![Build Status](https://travis-ci.org/siddiqus/expressive.svg?branch=master)](https://travis-ci.org/siddiqus/expressive)
[![Coverage Status](https://coveralls.io/repos/github/siddiqus/expressive/badge.svg?branch=master)](https://coveralls.io/github/siddiqus/expressive?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/533736ee85578f98a732/maintainability)](https://codeclimate.com/github/siddiqus/expressive/maintainability)
[![codebeat badge](https://codebeat.co/badges/6e3ba61c-d5cf-4a05-9aa7-ee7dd1591fe2)](https://codebeat.co/projects/github-com-siddiqus-expressive-master)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

# Expressive
Fast, opinionated, minimalist, and conventional REST API framework for [node](http://nodejs.org).

Find the package on npm - https://www.npmjs.com/package/@siddiqus/expressive

- [Expressive](#expressive)
- [Introduction](#introduction)
- [Quickstart](#quickstart)
- [Routing](#routing)
- [The BaseController](#the-basecontroller)
  * [Routes and subroutes](#routes-and-subroutes)
  * [Routing Example](#routing-example)
- [Express App Configuration](#express-app-configuration)
- [Middleware configuration](#middleware-configuration)
  * [Configuring your own middleware](#configuring-your-own-middleware)
  * [Authorization](#authorization)
  * [Built-in Middleware](#built-in-middleware)
    + [CORS](#cors)
    + [Security features with Helmet](#security-features-with-helmet)
- [Centralized error handling](#centralized-error-handling)
- [Asynchronous request handlers and middleware](#asynchronous-request-handlers-and-middleware)
    + [Handling requests](#handling-requests)
    + [Middleware](#middleware)
- [Request validation using express-validator](#request-validation-using-express-validator)
- [Documentation with Swagger and OpenAPI](#documentation-with-swagger-syntax)
- [Example application](#example)


*Table of contents generated with [markdown-toc](http://ecotrust-canada.github.io/markdown-toc/)

# Introduction

**Expressive** is a NodeJS REST API framework built on ExpressJs and best practices for smooth development. Features include:
  - Templated Routing
    - Write APIs with declarative endpoints (including nested endpoints) easily
  - Pluggable middleware with built-ins
    - Inject own middleware just like Express
    - Built in middleware e.g. body-parser, cors, etc.
    - Security middleware i.e. helmet
  - Built in support for asynchronous request handlers and middleware 
  - API validation using Express Validator https://github.com/express-validator/express-validator
    - Validate each endpoint with Express Validator functions, and error messages will be automatically sent in the response. 
  - Centralized error handling
    - All errors thrown in controller functions will go into one user-defined error middleware function (can be defined with app constructor)
  - Built-in doc generation through Swagger https://swagger.io/
    - Each endpoint can have an associated doc using Swagger syntax (JSON/JS), making doc writing easier and distributed.
    - Swagger doc can be viewed with SwaggerUI in development at http://localhost:8080/docs
    - Documentation can also be viewed with [Redoc](https://github.com/Redocly/redoc) at http://localhost:8080/docs/redoc

# Quickstart
Install the package: ```npm i -S @siddiqus/expressive```

Here is a basic example:
__*It is required for controllers to extend BaseController. This also allows for dependencies to be instantiated inside the constructor, which can be useful for testing.__

```javascript
const { Route, ExpressApp, BaseController } = require("@siddiqus/expressive");

class HelloGetController extends BaseController {
  handleRequest (req, res) {
    this.ok({
        hello: "world"
    });
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
Run this node script will start an Express app on port 8080. A GET request on [http://localhost:8080/hello] will return the following JSON response
```json
{
    "hello": "world"
}
```

The ExpressJS app can be used from the *express* property of the *app* object e.g. ```app.express```


# Routing
It is easy to create routes and nested routes using Expressive, with the focus being on each individual endpoint.

# The BaseController
Each separate endpoint e.g. 'GET /users' is handled using a _controller_ class, that extends the `BaseController` class provided by Expressive. There is an 'abstract' method called `handleRequest` that requires an implementation for your own controller. The Express `request`, `response` and `next` objects are available in this method using `this`. This `handleRequest` method can be used as an `async` function also. For example:

```javascript
const { BaseController } = require("@siddiqus/expressive");

class GetUsersController extends BaseController {
    async handleRequest() {
        const id = this.req.params.id; // get an id from the path parameter
        const userData = await someDbModel.getUser(id);
        this.ok(userData); // base methods available for HTTP responses
    }
}
```

Here you'll notice that the request object is available with `this.req` and you can send a JSON response using the `this.ok` function. This function sends back the data with a `200` status code. There are more methods implemented for various HTTP actions e.g. 
- created (201)
- accepted (202)
- noContent (204)
- badRequest (400)
- unauthorized (401)
- forbidden (403)
- notFound (404)
- tooMany (429)
- internalServerError (500)

* Also, you don't always have to extend a BaseController class. You can simply pass a controller function as your request handler. e.g. `function (req, res, next) { }` 

## Routes and subroutes
  - The ExpressApp class takes a 'router' parameter in its constructor's first parameter. This 'router' object looks like this:
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
      SomeController, // required - a controller function or class
      {
        doc: someDocJs, // optional - Swagger json format for a given endpoint
        validator: someExpressValidator, // optional - validator array in express-validator format
        errorHandler: function(err, req, res, next){} // optional - middleware to handle errors for this specific endpoint
      }
    );
    ```
    Similarly, the class methods `post`, `put`, `delete`, `patch`, `head`, and `options` are available for the Route class e.g.  `Route.post`.
  - You can redirect a route by simply passing the redirect url to the controller parameter e.g. `Route.get("/some-url", "/another-url")`
  - Each object in the *subroutes* array can be constructed using the `subroute` function, like so:
    ```javascript
    const { subroute } = require("@siddiqus/expressive");

    const router = {
      subroutes: [
        subroute("/some/sub/path", someRouter) // 'someRouter' is another router object
      ]
    };
    ```

## Routing Example
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
            // get /users and post /users can also be refactored into a separate subroute for "/users"
        ]
    ]
};

const apiRouter = {
    routes: [
	    Route.get("/", ApiRootController) // some predefined controller
    ],
    subroutes: [
	    subroute("/hello", helloRouter)
    ]
}
```

# Express App Configuration
The ExpressApp class constructor's second parameter is a configuration object that looks like this: 
```javascript
{
    swaggerInfo = null, // this is an optional JSON with the basic swagger info detailed later
    swaggerDefinitions, // this is an optional JSON for the swagger model definitions
    allowCors = false, // this uses the 'cors' npm module to allow CORS in the express app, default false
    corsConfig = null, // config for cors based on the 'cors' npm module, allows all origin by default
    middleware = null, // Array of express middlewares can be provided (optional)
    authorizer = null, // some middleware function used for authorization, this executes first
    errorHandler = null, // express middleware function to handle errors e.g. function(err, req, res, next){}
    basePath = "/", // Root path of the api, default "/"
    bodyLimit = "100kb",
    helmetOptions = null // options for the 'helmet' middleware
}
```

# Middleware configuration
Expressive comes with some built-in middleware at the application level. Middlware can be defined at any level - the application level (top), the route level (individual endpoint), and the subroute level (group of endpoints).

*Please* be aware of using the `next()` function accordingly inside your middleware.

## Configuring your own middleware
 **Bear in mind** since the routes follow a hierarchical structure, the middleware will be executed in the order of:
1. route level
2. subroute level
3. ExpressApp level

These are examples on how to declare middleware accross the Expressive application.

### At the application level
```javascript
    const expressApp = new ExpressApp(router, {
        middleware: [] // some array of middleware
    })
```

### At the sub route level
```javascript
    const { subroute } = require("@siddiqus/expressive");
    
    const router = {
        subroutes: [
            subroute("/hello", someHelloRouter, {
                middleware: [] // some array of middleware to execute for all routes under /hello
            })
        ]
    }
```

### At the sub route level
```javascript
    const { subroute } = require("@siddiqus/expressive");
    
    const router = {
        subroutes: [
            subroute("/hello", someHelloRouter, {
                middleware: [] // some array of middleware to execute for all routes under /hello
            })
        ]
    }
```

## Authorization
Authorizer functions can be declared the same way as middleware, except with the `authorizer` property in options. The authorizer function can be declared at 3 levels as well, with the major difference being their execution order. If an authorizer function is declared on all levels i.e. app, subroute and routes, then the request will be authorized in the following order:
1. application level (through ExpressApp constructor)
2. subroute level (on a group of endpoints)
3. route level (on an individual endpoint)

## Built-in Middleware

The Expressive app comes with the following built-in middleware:
- [body-parser](https://www.npmjs.com/package/body-parser) - manage request body in middleware
- [cors](https://www.npmjs.com/package/cors) - Allow CORS requests
- [express-request-id](https://www.npmjs.com/package/express-request-id) - Assign a unique ID for each request
- [helmet](https://www.npmjs.com/package/helmet) - Add various HTTP headers for basic security 

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

### Security features with Helmet
The `helmet` middleware is enabled with default configuration, and can be configured manually through the ExpressApp constructor, like so: 

```javascript
const app = new ExpressApp(router, {
    helmetConfig: {
        // some helmet configuration, see https://www.npmjs.com/package/helmet
    }
});
```

# Centralized error handling
To catch an error from any controller, pass an error handling function using the 'errorHandler' property in the options parameter for the ExpressApp constructor. For example:
```javascript
const { ExpressApp } = require("@siddiqus/expressive");

function centralizedErrorHandling (err, req, res, next) {
    res.status(500);
    res.send({
        message: "There was an internal error."
    });
}

const app = new ExpressApp(router, {
  errorMiddleware: centralizedErrorHandling // all errors go here
}
```
It is recommended that you define custom Error classes to throw from inside your controllers, and then handle them in a switch in your central error handler.

# Asynchronous request handlers and middleware
Expressive does some work under the covers to manage async request handlers as well as async middleware.

### Handling requests
In any controller (that extends the `BaseController` of course), you can declare the `handleRequest` function as async, but this is optional.
So both of these are okay:
```javascript
class SomeController extends BaseController {
  handleRequest(req, res, next) {
    // some non-async code
  }
}
```

And this is also okay:
```javascript
class SomeController extends BaseController {
  async handleRequest(req, res, next) {
    // some async code
  }
}
```

### Middleware
This example shows both async and non-async middleware being passed to multiple levels e.g. routes and subroutes.

```javascript
Route.get("/hello", (req, res) => {
    res.json({
        hello: "world"
    });
}, {
    middleware: [
        async (req, res, next) => console.log("from mid 1") || next(), // this works
        (req, res, next) => console.log("from mid 2") || next(), // this works too
        (req, res) => console.log("from mid 2"), // this works too
    ]
})
```
Notice how the three middleware functions are different:
- One is async, another is a normal one, but the other one does not have the `next` function parameter used, but this is still okay because Expressive calls it internally
- These cases are handled by Expressive internally and allows you to declare middleware in a flexible way

# Request validation using express-validator
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

# Documentation with Swagger and OpenAPI
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

### Documentation Viewer UIs
Currently there are actually two UI's built-in with Expressive
1. SwaggerUI - this runs on http://localhost:8080/docs and http://localhost:8080/docs/swagger
2. [Redoc](https://github.com/Redocly/redoc) - this runs at http://localhost:8080/docs/redoc

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

# Example Application
See the 'example' folder in this repo.
