const ExpressApp = require('../src/ExpressApp');
const Route = require('../src/Route');

describe('ExpressApp', () => {
  it('should be defined', () => {
    expect(ExpressApp).toBeDefined();
  });

  describe('constructor', () => {
    it('Should init with all defaults', () => {
      const app = new ExpressApp({});
      expect(app.express).toBeDefined();
    });

    it('Should init with all overridden values', () => {
      const app = new ExpressApp(
        {},
        {
          allowCors: true,
          middleware: [() => {}],
          swaggerDefinitions: {},
          basePath: '/api',
          errorHandler: () => {},
          authorizer: () => {},
          showSwaggerOnlyInDev: false,
          swaggerInfo: {}
        }
      );

      expect(app.express).toBeDefined();
    });

    it('constructor with Cors config', () => {
      const app = new ExpressApp(
        {},
        {
          allowCors: true,
          corsConfig: {
            origin: 'http://somepath'
          },
          middleware: [() => {}],
          swaggerDefinitions: {},
          basePath: '/api',
          errorHandler: () => {},
          showSwaggerOnlyInDev: false,
          swaggerInfo: {}
        }
      );

      expect(app.express).toBeDefined();
    });

    it('Should throw error if duplicate urls', () => {
      let response;
      const mockRoutes = {
        routes: [
          Route.get('/hello', () => {}),
          Route.get('/hello/', () => {}),
          Route.get('/v1/hey', () => {})
        ],
        subroutes: [
          {
            path: '/v1',
            router: {
              routes: [Route.get('/hey', () => {})]
            }
          }
        ]
      };
      try {
        new ExpressApp(mockRoutes);
      } catch (error) {
        response = error;
      }

      expect(response.message).toEqual(
        'Duplicate endpoints detected! -> get /hello, get /v1/hey'
      );
    });

    it('Should throw error if authorizer is declared without authObjectHandler', () => {
      let response;
      try {
        new ExpressApp(
          {},
          {
            authorizer: ['hehe']
          }
        );
      } catch (error) {
        response = error;
      }

      expect(response.message).toEqual(
        `'authorizer' object declared, but 'authObjectHandler' is not defined in ExpressApp constructor params, or is an empty function`
      );
    });

    it('Should not throw error if authorizer and authObjectHandler both declared', () => {
      let response;
      try {
        response = new ExpressApp(
          {},
          {
            authorizer: ['hehe'],
            authObjectHandler: (req, res) => {
              return null;
            }
          }
        );
      } catch (error) {
        response = error;
      }

      expect(response).toBeInstanceOf(ExpressApp);
    });

    it('Should throw error if authObjectHandler body is empty', () => {
      let response;
      try {
        response = new ExpressApp(
          {},
          {
            authorizer: ['hehe'],
            authObjectHandler: (req, res) => {}
          }
        );
      } catch (error) {
        response = error;
      }

      expect(response).toBeInstanceOf(Error);
    });
  });
});
