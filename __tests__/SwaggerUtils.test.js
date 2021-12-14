const path = require('path');
const fs = require('fs');
const SwaggerUtils = require('../src/SwaggerUtils');
const { Joi } = require('celebrate');
const Route = require('../src/Route');
const BaseController = require('../src/BaseController');
const { subroute } = require('../src');

class SomeTestController extends BaseController {
  constructor() {
    super();

    this.doc = {
      tags: ['SomeTag']
    };
  }
}
const mockRouterWithTopRoutes = {
  routes: [Route.get('/', new SomeTestController())],
  subroutes: [
    {
      path: '/users',
      router: {
        routes: [
          Route.get('/', new SomeTestController()),
          Route.post('/', new SomeTestController())
        ],
        subroutes: [
          subroute('/:userId/posts', {
            routes: [
              Route.get('/', new BaseController()),
              Route.post('/', new BaseController())
            ]
          })
        ]
      }
    }
  ]
};

describe('SwaggerUtils', () => {
  describe('registerExpress', () => {
    it('Should register both url and redirect', () => {
      const mockApp = {
        use: jest.fn(),
        get: jest.fn()
      };

      SwaggerUtils.registerExpress({
        app: mockApp,
        swaggerJson: {},
        url: '/someurl',
        authUser: {
          user: 'admin',
          password: 'admin'
        }
      });

      expect(mockApp.use).toHaveBeenCalled();
      expect(mockApp.get).toHaveBeenCalled();

      // eslint-disable-next-line prefer-destructuring
      const [, , mockRedirectHandler] = mockApp.get.mock.calls[0];
      const mockRes = {
        redirect: jest.fn()
      };

      mockRedirectHandler(null, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('someurl');
    });

    it('Should sanitize redirect url', () => {
      const mockApp = {
        use: jest.fn(),
        get: jest.fn()
      };

      SwaggerUtils.registerExpress({
        app: mockApp,
        swaggerJson: {},
        url: 'someurl',
        authUser: {
          user: 'admin',
          password: 'admin'
        }
      });

      expect(mockApp.use).toHaveBeenCalled();
      expect(mockApp.get).toHaveBeenCalled();

      // eslint-disable-next-line prefer-destructuring
      const [, , mockRedirectHandler] = mockApp.get.mock.calls[0];
      const mockRes = {
        redirect: jest.fn()
      };

      mockRedirectHandler(null, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('someurl');
    });
  });

  describe('_sanitizeSwaggerPath', () => {
    it('Should sanitize path parameter at the end of the url', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath('some/:path');
      expect(result).toEqual('some/{path}/');
    });

    it('Should sanitize path parameter at the end of the url with extra slash', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath('some/:path/');
      expect(result).toEqual('some/{path}/');
    });

    it('Should sanitize path parameter in the middle of url', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath('/some/:path/other');
      expect(result).toEqual('/some/{path}/other/');
    });

    it('Should sanitize multiple path parameters', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath(
        '/some/:path/other/:url/'
      );
      expect(result).toEqual('/some/{path}/other/{url}/');
    });
  });

  describe('convertDocsToSwaggerDoc', () => {
    it('Should handle case for parent tags to capitalize', () => {
      const routes = {
        subroutes: [
          {
            path: '/',
            router: {
              routes: [
                {
                  path: '/hey',
                  controller: new BaseController(),
                  method: 'get'
                }
              ]
            }
          },
          {
            path: '/v',
            router: {
              routes: [
                {
                  path: '/hey',
                  controller: new BaseController(),
                  method: 'get'
                }
              ]
            }
          },
          {
            path: '/hey-there',
            router: {
              routes: [
                {
                  path: '/hey',
                  controller: new BaseController(),
                  method: 'get'
                }
              ]
            }
          },
          {
            path: '/hi_there',
            router: {
              routes: [
                {
                  path: '/hey',
                  controller: new BaseController(),
                  method: 'get'
                }
              ]
            }
          }
        ]
      };

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(routes);
      expect(swaggerDoc.tags.map((t) => t.name)).toContain('V');
      expect(swaggerDoc.tags.map((t) => t.name)).toContain('Hey There');
      expect(swaggerDoc.tags.map((t) => t.name)).toContain('Hi There');
      expect(swaggerDoc).toBeDefined();
    });

    it('Should handle case for no parent tags, and tags with multi word', () => {
      const routes = {
        subroutes: [
          {
            path: '/',
            controller: {
              routes: [
                {
                  path: '/hey',
                  controller: new BaseController(),
                  method: 'get'
                }
              ]
            }
          }
        ]
      };

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(routes);
      expect(swaggerDoc).toBeDefined();
    });

    it('Should write json for swagger with redirects', () => {
      const mockRoutes1 = { ...mockRouterWithTopRoutes };
      mockRoutes1.routes.push(
        {
          path: '/hey',
          controller: new BaseController(),
          method: 'get',
          doc: {
            summary: 'hey route',
            responses: {
              200: {},
              400: {}
            }
          }
        },
        {
          path: '/hello',
          controller: new BaseController(),
          method: 'get',
          doc: {
            responses: {
              200: {},
              400: {}
            }
          }
        }
      );

      let swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);

      mockRoutes1.routes.push({
        path: '/hello',
        controller: '/hey/',
        method: 'get',
        doc: {
          responses: {}
        },
        authorizer: (req, res) => {}
      });
      swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);

      expect(swaggerDoc).toBeDefined();
    });

    it.skip('Should write json for swagger with authorizer object', () => {
      const mockRoutes1 = { ...mockRouterWithTopRoutes };
      class Controller extends BaseController {
        constructor() {
          super();
          this.doc = {
            summary: 'hey route',
            responses: {
              200: {}
            }
          };
          this.authorizer = ['hello from hey route'];
        }
      }
      mockRoutes1.routes.push({
        path: '/hey',
        controller: new Controller(),
        method: 'get'
      });

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);

      expect(swaggerDoc).toBeDefined();

      const swaggerstr = JSON.stringify(swaggerDoc);
      expect(
        swaggerstr.includes(`Authorized: ["hello from hey route"]`)
      ).toBeTruthy();
    });

    it('Should write json for swagger with responses defined', () => {
      const mockRoutes1 = { routes: [] };

      class Controller extends BaseController {
        constructor() {
          super();
          this.doc = {
            summary: 'hey route',
            responses: {
              200: {}
            }
          };
          this.authorizer = ['hello'];
          this.validationSchema = {
            some: 'schema'
          };
        }
      }

      mockRoutes1.routes.push({
        path: '/hey',
        controller: new Controller(),
        method: 'get'
      });

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);
      expect(swaggerDoc).toBeDefined();

      const swaggerstr = JSON.stringify(swaggerDoc);
      expect(
        swaggerstr.includes(`Schema validation error response`)
      ).toBeTruthy();
    });

    it('Should write json for swagger with file upload defined', () => {
      const mockRoutes1 = { routes: [] };
      class FileUploadController extends BaseController {
        constructor() {
          super();

          this.doc = {
            summary: 'hey route',
            responses: {
              200: {}
            }
          };
          this.authorizer = ['hello'];
          this.validationSchema = {
            fileUpload: {
              file: Joi.any().required()
            }
          };
        }
      }

      mockRoutes1.routes.push({
        path: '/hey',
        controller: new FileUploadController(),
        method: 'get'
      });

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);
      expect(swaggerDoc).toBeDefined();

      const swaggerstr = JSON.stringify(swaggerDoc);
      expect(swaggerstr.includes(`multipart/form-data`)).toBeTruthy();
    });

    it('Should write json for swagger with responses defined for validation', () => {
      const mockRoutes1 = { routes: [] };
      class Controller extends BaseController {
        constructor() {
          super();
          this.doc = {
            summary: 'hey route',
            description: 'hey route',
            responses: {
              200: {},
              400: {
                response: 'this is a response schema'
              }
            },
            tags: ['hello']
          };
          this.authorizer = ['hello'];
        }
      }

      mockRoutes1.routes.push({
        path: '/hey',
        controller: new Controller(),
        method: 'get'
      });

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);
      expect(swaggerDoc).toBeDefined();

      const swaggerstr = JSON.stringify(swaggerDoc);
      expect(
        swaggerstr.includes(`Schema validation error response`)
      ).toBeFalsy();

      expect(swaggerstr.includes(`this is a response schema`)).toBeTruthy();
    });
  });

  describe('writeSwaggerJson', () => {
    it('should write json for swagger', () => {
      const sampleSwaggerInfo = {
        version: '1.0.0',
        title: 'Expressive API',
        contact: {
          name: 'Author',
          email: 'Your email address',
          url: ''
        }
      };

      const outputPath = path.resolve(__dirname, 'output.json');
      SwaggerUtils.writeSwaggerJson({
        router: mockRouterWithTopRoutes,
        output: outputPath,
        basePath: '/api',
        swaggerInfo: sampleSwaggerInfo
      });

      const file = fs.readFileSync(outputPath);
      expect(file).toBeDefined();
      fs.unlinkSync(outputPath);
    });

    it('should write json for swagger using defaults', () => {
      const outputPath = path.resolve(__dirname, 'output.json');
      SwaggerUtils.writeSwaggerJson({
        router: mockRouterWithTopRoutes,
        output: outputPath
      });

      const file = fs.readFileSync(outputPath);
      expect(file).toBeDefined();
      fs.unlinkSync(outputPath);
    });
  });

  describe('getSwaggerHeader', () => {
    it('works with defaults', () => {
      const header = SwaggerUtils.getSwaggerHeader({});
      expect(header).toBeDefined();
    });

    it('works with non defaults', () => {
      const header = SwaggerUtils.getSwaggerHeader({ basePath: '/api' });
      expect(header).toBeDefined();
    });

    it('should set auth properly for header', () => {
      const header = SwaggerUtils.getSwaggerHeader({
        basePath: '/api',
        swaggerSecurityDefinitions: {
          someAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-KEY'
          }
        }
      });

      expect(header).toBeDefined();
      expect(header.securityDefinitions).toEqual({
        someAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-KEY'
        }
      });
      expect(header.security).toEqual([
        {
          someAuth: []
        }
      ]);
    });
  });
});
