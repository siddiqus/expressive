const path = require('path');
const fs = require('fs');
const SwaggerUtils = require('../src/SwaggerUtils');
const { Joi } = require('celebrate');

const mockRouterWithTopRoutes = {
  routes: [
    {
      path: '/',
      method: 'get',
      controller: () => {},
      doc: {
        tags: ['SomeTag']
      }
    }
  ],
  subroutes: [
    {
      path: '/users',
      router: {
        routes: [
          {
            path: '/',
            method: 'get',
            controller: () => {},
            doc: {
              tags: ['SomeTag']
            }
          },
          {
            path: '/',
            method: 'post',
            controller: () => {},
            doc: {}
          }
        ],
        subroutes: [
          {
            path: '/:userId/posts',
            router: {
              routes: [
                {
                  path: '/',
                  method: 'get',
                  controller: () => {}
                },
                {
                  path: '/',
                  method: 'post',
                  controller: () => {}
                }
              ]
            }
          }
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
                  controller: () => {},
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
                  controller: () => {},
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
                  controller: () => {},
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
                  controller: () => {},
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
            router: {
              routes: [
                {
                  path: '/hey',
                  controller: () => {},
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
          controller: '/users',
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
          controller: '/products',
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

    it('Should write json for swagger with authorizer object', () => {
      const mockRoutes1 = { ...mockRouterWithTopRoutes };
      mockRoutes1.routes.push({
        path: '/hey',
        controller: () => {},
        method: 'get',
        doc: {
          summary: 'hey route',
          responses: {
            200: {}
          }
        },
        authorizer: ['hello']
      });

      let swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);

      mockRoutes1.routes.push({
        path: '/hello',
        controller: '/hey/',
        method: 'get',
        doc: {
          responses: {}
        }
      });
      swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);

      expect(swaggerDoc).toBeDefined();

      const swaggerstr = JSON.stringify(swaggerDoc);
      expect(swaggerstr.substring(`Authorized: ["hello"]`)).toBeDefined();
    });

    it('Should write json for swagger with responses defined', () => {
      const mockRoutes1 = { routes: [] };
      mockRoutes1.routes.push({
        path: '/hey',
        controller: () => {},
        method: 'get',
        doc: {
          summary: 'hey route',
          responses: {
            200: {}
          }
        },
        authorizer: ['hello'],
        validationSchema: {
          some: 'schema'
        }
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
      mockRoutes1.routes.push({
        path: '/hey',
        controller: () => {},
        method: 'get',
        doc: {
          summary: 'hey route',
          responses: {
            200: {}
          }
        },
        authorizer: ['hello'],
        validationSchema: {
          fileUpload: {
            file: Joi.any().required()
          }
        }
      });

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);
      expect(swaggerDoc).toBeDefined();

      const swaggerstr = JSON.stringify(swaggerDoc);
      expect(swaggerstr.includes(`multipart/form-data`)).toBeTruthy();
    });

    it('Should write json for swagger with responses defined for validation', () => {
      const mockRoutes1 = { ...mockRouterWithTopRoutes };
      mockRoutes1.routes.push({
        path: '/hey',
        controller: () => {},
        method: 'get',
        doc: {
          summary: 'hey route',
          responses: {
            200: {},
            400: {
              response: 'hehe'
            }
          }
        },
        authorizer: ['hello']
      });

      const swaggerDoc = SwaggerUtils.convertDocsToSwaggerDoc(mockRoutes1);
      expect(swaggerDoc).toBeDefined();

      const swaggerstr = JSON.stringify(swaggerDoc);
      expect(
        swaggerstr.includes(`Schema validation error response`)
      ).toBeFalsy();
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
