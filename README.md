[![Expressive Logo](https://raw.githubusercontent.com/siddiqus/expressive/master/logo.png)](https://github.com/siddiqus/expressive/)

[![Build Status](https://travis-ci.org/siddiqus/expressive.svg?branch=master)](https://travis-ci.org/siddiqus/expressive)
[![Coverage Status](https://coveralls.io/repos/github/siddiqus/expressive/badge.svg?branch=master)](https://coveralls.io/github/siddiqus/expressive?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/533736ee85578f98a732/maintainability)](https://codeclimate.com/github/siddiqus/expressive/maintainability)
[![codebeat badge](https://codebeat.co/badges/6e3ba61c-d5cf-4a05-9aa7-ee7dd1591fe2)](https://codebeat.co/projects/github-com-siddiqus-expressive-master)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![Google Style](https://badgen.net/badge/eslint/google/4a88ef)](https://github.com/google/eslint-config-google)

# Expressive

Fast, opinionated, minimalist, and conventional REST API framework for [node](http://nodejs.org).
(With Typescript Support :star:)

- [Introduction](#introduction)
- [Quickstart](#quickstart)
- [Routing](#routing)
- [The BaseController](#the-basecontroller)
  - [Routes and subroutes](#routes-and-subroutes)
  - [Routing Example](#routing-example)
- [Express App Configuration](#express-app-configuration)
- [Middleware configuration](#middleware-configuration)
  - [Built-in Middleware](#built-in-middleware)
    - [CORS](#cors)
    - [Security features with Helmet](#security-features-with-helmet)
  - [Configuring your own middleware](#configuring-your-own-middleware)
    - [At the application level](#at-the-application-level)
    - [At the sub route level](#at-the-sub-route-level)
    - [At the route level](#at-the-route-level)
- [Centralized error handling](#centralized-error-handling)
- [Asynchronous request handlers and middleware](#asynchronous-request-handlers-and-middleware)
  - [Handling requests](#handling-requests)
  - [Middleware](#middleware)
- [Request validation using Celebrate](#request-validation-using-celebrate)
- [Centralized authorization](#centralized-authorization)
- [Auto-generated documentation with Swagger](#documentation-with-swagger)
- [File upload example with [multer](https://npmjs.org/package/multer)](#file-upload)
- [Example applications (Both TypeScript and ES5)](#example)

\*Table of contents generated with [markdown-toc](http://ecotrust-canada.github.io/markdown-toc/)

# Introduction

**Expressive** is a NodeJS REST API framework built on ExpressJs and best practices for smooth development. Features include:

- Templated Routing
  - Write APIs with declarative endpoints (including nested endpoints) easily
- Pluggable middleware with built-ins
  - Inject own middleware just like Express
  - Built in middleware e.g. body-parser, cors, etc.
  - Security middleware i.e. helmet
- Built in support for asynchronous request handlers and middleware
  - No need to wrap every controller with a try/catch block. Any error thrown will be sent to a central error handler
- Implicit `next` function calls
  - If you do not declare the `next` variable in your handler function, then it will be called for you automatically after your handler executes. If you declare it as a function parameter, you can use it as you like.
- API validation using [celebrate](https://www.npmjs.com/package/celebrate) with [Joi](https://www.npmjs.com/package/@hapi/joi) schemas (Using Joi schemas also yields generated Swagger documentation!)
- Centralized error handling
  - All errors thrown in controller functions will go into one user-defined error middleware function (can be defined with app constructor)
- Centralized authorization
  - By defining authorizer function at any level - app, subroute, or route
  - Objective Authorization: By defining an authorizer object for each level, and centrally managing request authorization with one handler
- Doc generation through Swagger https://swagger.io/
  - Request parameter docs are generated if `validationSchema` property is provided with Joi schemas!
  - Each endpoint can have an associated doc using Swagger syntax (JSON/JS), making doc writing easier and distributed.
  - Swagger doc can be viewed in development at http://localhost:8080/docs

# Quickstart

Install the package: `npm i -S @siddiqus/expressive`

Here is a basic example:
**\*It is required for controllers to extend BaseController. This also allows for dependencies to be instantiated inside the constructor, which can be useful for testing.**

```javascript
const { Route, ExpressApp, BaseController } = require('@siddiqus/expressive');

class HelloGetController extends BaseController {
  handleRequest(req, res) {
    this.ok({
      hello: 'world'
    });
  }
}

const router = {
  routes: [Route.get('/hello', HelloGetController)]
};

const app = new ExpressApp(router);
const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port ' + port));
```

Run this node script will start an Express app on port 8080. A GET request on [http://localhost:8080/hello] will return the following JSON response

```json
{
  "hello": "world"
}
```

The ExpressJS app can be used from the _express_ property of the _app_ object e.g. `app.express`

# Routing

It is easy to create routes and nested routes using Expressive, with the focus being on each individual endpoint.

# The BaseController

Each separate endpoint e.g. 'GET /users' is handled using a _controller_ class, that extends the `BaseController` class provided by Expressive. There is an 'abstract' method called `handleRequest` that requires an implementation for your own controller. The Express `request`, `response` and `next` objects are available in this method using `this`. This `handleRequest` method can be used as an `async` function also. For example:

```javascript
const { BaseController } = require('@siddiqus/expressive');

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

##### Wrapping response data

Sometimes you will want to always wrap your response data in an object e.g. `{ data: someData }`
The BaseController class has a static method `bodyWrapper` which has the response data as a parameter. This is used in the class methods e.g. `this.ok(data)` etc. to always wrap your response the way you define it.

- Also, you don't always have to extend a BaseController class. You can simply pass a controller function as your request handler. e.g. `function (req, res, next) { }`

## Routes and subroutes

- The ExpressApp class takes a 'router' parameter in its constructor's first parameter. This 'router' object looks like this:
  ```javascript
  {
      routes: [],
      subroutes: []
  }
  ```
- Each object in the _routes_ array is an instance of the Route class. For example, we can use the Route class's GET method to create a GET endpoint like so:

  ```javascript
  const { Route } = require('@siddiqus/expressive');

  const helloGetRoute = Route.get(
    '/some/path', // required - relative end path of endpoint
    SomeController, // required - a controller function or class
    {
      doc: someDocJs, // optional - Swagger json format for a given endpoint
      validationSchema: {
        query: someJoiSchemaForQueryParams
      }, // validationSchema optional - object with Joi schemas for body, query, params, etc.
      errorHandler: function (err, req, res, next) {} // optional - middleware to handle errors for this specific endpoint
    }
  );
  ```

  Similarly, the class methods `post`, `put`, `delete`, `patch`, `head`, and `options` are available for the Route class e.g. `Route.post`.

- Each object in the _subroutes_ array can be constructed using the `subroute` function, like so:

  ```javascript
  const { subroute } = require('@siddiqus/expressive');

  const router = {
    subroutes: [
      subroute('/some/sub/path', someRouter) // 'someRouter' is another router object
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
const { Route, subroute } = require('@siddiqus/expressive');

const helloRouter = {
  routes: [
    [
      // with some predefined controller functions
      Route.get('/', GetHelloController),
      Route.get('/users', GetUsersController),
      Route.post('/users', PostUsersController)
      // get /users and post /users can also be refactored into a separate subroute for "/users"
    ]
  ]
};

const apiRouter = {
  routes: [
    Route.get('/', ApiRootController) // some predefined controller
  ],
  subroutes: [subroute('/hello', helloRouter)]
};
```

# Express App Configuration

The ExpressApp class constructor's second parameter is a configuration object that looks like this:

```javascript
{
  (swaggerInfo = null), // this is an optional JSON with the basic swagger info detailed later
    swaggerDefinitions, // this is an optional JSON for the swagger model definitions
    (allowCors = false), // this uses the 'cors' npm module to allow CORS in the express app, default false
    (corsConfig = null), // config for cors based on the 'cors' npm module, allows all origin by default
    (middleware = null), // Array of express middlewares can be provided (optional)
    (errorHandler = null), // express middleware function to handle errors e.g. function(err, req, res, next){}
    (basePath = '/'), // Root path of the api, default "/"
    (bodyLimit = '100kb'),
    (helmetOptions = null), // options for the 'helmet' middleware
    (celebrateErrorHandler = null), // optional, handler to replace default celebrate 'errors' middleware
    (notFoundHandler = null), // optional, handler that runs after all routes. By default it returns 404 status with a message.
    (authObjectHandler = null); // optional handler to manage authorization via authorizer objects. See 'Centralized authorization' below.
}
```

# Middleware configuration

Expressive comes with some built-in middleware at the application level. Middlware can be defined at any level - the application level (top), the route level (individual endpoint), and the subroute level (group of endpoints). **Bear in mind** since the routes follow a hierarchical structure, the middleware will be executed in the order of:

1. route level
2. subroute level
3. ExpressApp level

So _please_ be aware of using the `next()` function accordingly inside your middleware.

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

## Configuring your own middleware

These are examples on how to declare middleware accross the Expressive application.

#### At the application level

```javascript
const expressApp = new ExpressApp(router, {
  middleware: [] // some array of middleware
});
```

#### At the sub route level

```javascript
const { subroute } = require('@siddiqus/expressive');

const router = {
  subroutes: [
    subroute('/hello', someHelloRouter, {
      middleware: [] // some array of middleware to execute for all routes under /hello
    })
  ]
};
```

#### At the route level

```javascript
const { subroute } = require('@siddiqus/expressive');

const router = {
  routes: [
    Route.get('/hello', someHelloController, {
      middleware: [] // some array of middleware to execute for this particular endpoint
    })
  ]
};
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
  errorMiddleware: centralizedErrorHandling // all errors go here, can also be an array
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
Route.get(
  '/hello',
  (req, res) => {
    res.json({
      hello: 'world'
    });
  },
  {
    middleware: [
      async (req, res, next) => console.log('from mid 1') || next(), // this works
      (req, res, next) => console.log('from mid 2') || next(), // this works too
      (req, res) => console.log('from mid 2') // this works too
    ]
  }
);
```

Notice how the three middleware functions are different:

- One is async, another is a normal one, but the other one does not have the `next` function parameter used, but this is still okay because Expressive calls it internally
- These cases are handled by Expressive internally and allows you to declare middleware in a flexible way

# Request validation using Celebrate

Expressive uses [celebrate](https://www.npmjs.com/package/celebrate) for API endpoint validations. A schema can be added to any endpoint using the 'validationSchema' property of a route.

```javascript
const { Route, Joi } = require('@siddiqus/expressive');

const getUserById = Route.get(
  '/users/:userId',
  GetSpecificUser, // some predefined controller
  {
    validationSchema: {
      params: {
        userId: Joi.number().required()
      },
      body: {}, // keys with Joi schema
      query: {},
      headers: {} // and others based on celebrate's documentation
    }
  }
);
```

# Centralized authorization

You can define an `authorizer` property at the app, subroute or route level (in case of multiple definitions, they will be executed in that order respectively). Here are the examples:

```javascript
const expressiveRouter = {
  routes: [
    Route.get("/users", {
      controller: someControllerFn, // required controller for the endpoint
      authorizer: (req, res) => {} // authorizer function for this particular route
    })
  ],
  subroutes: [
    {
      path: '/products',
      router: productRouter, // some other defined Expressive router
      authorizer: (req, res) => {} // authorizer function for all routes under /products/*
    }
  ]
}
const app = new ExpressApp(expressiveRouter, {
  authorizer: (req, res, next) => { // authorizer function for the whole app
})
```

While defining a function at every level gives you granular control over your endpoint authorization, Expressive gives you another way: authorizer objects

#### Objective authorization (with authorizer objects)

This implementation can be summarized as:

`For an endpoint [x], there is a criteria [y] that describes who is authorized to access the endpoint.`

You can use this authorization mechanism by defining an `authObjectHandler` function as a parameter in ExpressApp, with any `authorizer` property at any level being defined as an object, a string, or an array of those. Defining an `authorizer` property without declaring the `authObjectHandler` will throw an error while initializing the app. Here is an example.

1. Let's say we define an endpoint with an authorizer

```javascript
const expressiveRouter = {
  routes: [
    Route.get('/hello', {
      controller: (req, res) => {}, // some controller
      authorizer: {
        permissions: 'some-permission-criteria'
      }
    })
  ]
};
```

2. And we have declared our `authObjectHandler` in `ExpressApp` params

```javascript
const app = new ExpressApp(expressiveRouter, {
  authObjectHandler: async (req, res) => {
    const user = req.user; // this object is allowed for any user data
    const authorizer = req.authorizer; // req.authorizer is a flattened array of all authorizer objects
    // in our case, req.authorizer = [{ some: 'permission-criteria' }]
    // some logic to authorize the user
    const hasPermissions = authorizer.filter(
      (a) => a.permissions === user.permissions
    );

    if (!hasPermissions.length) {
      res.status(401).json({
        message: 'Unauthorized'
      });
    }
  }
});
```

If the authorizer object is declared at any level (app, subroute, or route), the authorizer object (or string) will be appended to a flattened array in `req.authorizer`.

So by declaring the `authObjectHandler` in a generic way, we can centrally manage authorization for the whole application at any level by simply defining the authorization criteria in the `authorizer` object.

# Documentation with Swagger

#### Auto-generated documentation

Firstly, Expressive auto generates Swagger documentation from the declared routes, even if you do not provide any documentation of your own. Currently:

- For any project, if you declare basic routes, then the swagger will at least show you the routes that are available on the server.
- If you declare a request validation schema with [celebrate](https://www.npmjs.com/package/celebrate) syntax, then Swagger parameter definitions will also be auto-generated.

---

Swagger UI is accessible on the url `/docs`, and it requires basic authentication. The default value for both user and password is `admin`.

To set your own username and password, set the environment variables `EXPRESS_SWAGGER_USER` and `EXPRESS_SWAGGER_PASSWORD` respectively.

#### Swagger options

There are a few things you can configure for Swagger through the ExpressApp options parameter.

---

You can initialize your app with the basic swagger 'info' property as shown below:

```javascript
const { ExpressApp } = require('@siddiqus/expressive');

const swaggerInfo = {
  version: '1.0.0',
  title: 'Example Expressive App',
  contact: {
    name: 'Sabbir Siddiqui',
    email: 'sabbir.m.siddiqui@gmail.com'
  }
};

const app = new ExpressApp(router, {
  swaggerInfo: swaggerInfo
});
```

---

You can configure whether to only show Swagger UI in development mode, or otherwise

```javascript
const app = new ExpressApp(router, {
  showSwaggerOnlyInDev: false // default value is true, set to false to enable swagger for non-development environments
});
```

---

You can add API authentication using [OpenAPI 2.0 specification](https://swagger.io/docs/specification/2-0/authentication/). For example:

```javascript
const app = new ExpressApp(router, {
  swaggerSecurityDefinitions: {
    authHeader: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
});
```
This will add Authorize option in Swagger UI to add an `Authorization` header value.

#### Declaring docs manually

Each API endpoint can be documented using Swagger syntax, simply by adding a 'doc' property to the route object.
Example:

```javascript
const getUserById = Route.get(
  '/hello',
  GetHelloController, // some predefined controller
  {
    doc: GetHelloDocJs // Swagger doc format for an endpoint
  }
);
```

The 'GetUserByIdDocJs' JS or JSON could be an Open API 2.x specification JSON, for example:

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

#### Writing Swagger specs to a JSON file

To create a swagger.json file, the function `writeSwaggerJson` can be used from the `SwaggerUtils` export. Example:

```javascript
const { SwaggerUtils } = require('expressive');
...
SwaggerUtils.writeSwaggerJson({
  router, // expressive router configuration
  output, // absolute path of output file
  basePath, // api base path
  swaggerInfo, // basic Swagger info
  swaggerSecurityDefinitions // security definitions as per OpenAPI 2 specification
});
```

# File upload

The recommended middleware for file uploads is [multer](https://www.npmjs.com/package/multer). Currently Typescript support is available for `req.file` and `req.files` but you can declare your own `req` type if you need.

Here's an example using `multer`, with schema validation:

```javascript
import { Route, Joi } from '@siddiqus/expressive';
import multer from 'multer';

const uploadFile = multer();

const fileUploadRoute = Route.put('/file-upload', {
  validationSchema: {
    fileUpload: {
      file: Joi.any().required() // use Joi.any() for any validations
    }
  },
  middleware: [uploadFile.single('file')], // adding multer middleware
  controller: (req, res) => {
    const file = req.file;
    const filename = file.originalname;
    const content = file.buffer.toString();
    res.json({
      filename,
      content
    });
  }
});
```

This provides two benefits:

1. Celebrate error handling with validate the form data according to the schema
2. Generates swagger doc for file upload

\*\*\* Current limitation is the `fileUpload` in `validationSchema` is limited to `file` and `files`, which means the `formData` property has to be either `file` or `files` for this to work. You can use `multer`'s other methods like `fields`, but in that case, you won't be able to name the field anything other than `file` or `files`.

# Examples

- For regular JavaScript, see the 'example' folder in this repo.
- For TypeScript, see the 'ts-example' folder
