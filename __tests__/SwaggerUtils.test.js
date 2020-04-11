const path = require('path');
const fs = require('fs');
const SwaggerUtils = require('../src/SwaggerUtils');

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

      SwaggerUtils.registerExpress(mockApp, {}, '/someurl');

      expect(mockApp.use).toHaveBeenCalled();
      expect(mockApp.get).toHaveBeenCalled();

      const [, mockRedirectHandler] = mockApp.get.mock.calls[0];
      const mockRes = {
        redirect: jest.fn()
      };
      mockRedirectHandler(null, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('/someurl');
    });
  });

  describe('_sanitizeSwaggerPath', () => {
    it('Should sanitize path parameter at the end of the url', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath('some/:path');
      expect(result).toEqual('some/{path}');
    });

    it('Should sanitize path parameter at the end of the url with extra slash', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath('some/:path/');
      expect(result).toEqual('some/{path}/');
    });

    it('Should sanitize path parameter in the middle of url', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath('/some/:path/other');
      expect(result).toEqual('/some/{path}/other');
    });

    it('Should sanitize multiple path parameters', () => {
      const result = SwaggerUtils._sanitizeSwaggerPath(
        '/some/:path/other/:url/'
      );
      expect(result).toEqual('/some/{path}/other/{url}/');
    });
  });

  describe('convertDocsToSwaggerDoc', () => {
    it('Should write json for swagger with redirects', () => {
      const mockRoutes1 = { ...mockRouterWithTopRoutes };
      mockRoutes1.routes.push({
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
      });

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
            200: {},
            400: {}
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
      SwaggerUtils.writeSwaggerJson(
        mockRouterWithTopRoutes,
        outputPath,
        '/api',
        sampleSwaggerInfo
      );

      const file = fs.readFileSync(outputPath);
      expect(file).toBeDefined();
      fs.unlinkSync(outputPath);
    });

    it('should write json for swagger using defaults', () => {
      const outputPath = path.resolve(__dirname, 'output.json');
      SwaggerUtils.writeSwaggerJson(mockRouterWithTopRoutes, outputPath);

      const file = fs.readFileSync(outputPath);
      expect(file).toBeDefined();
      fs.unlinkSync(outputPath);
    });
  });

  describe('getSwaggerHeader', () => {
    it('works with defaults', () => {
      const header = SwaggerUtils.getSwaggerHeader();
      expect(header).toBeDefined();
    });

    it('works with non defaults', () => {
      const header = SwaggerUtils.getSwaggerHeader('/api');
      expect(header).toBeDefined();
    });
  });
});
