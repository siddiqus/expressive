const ExpressApp = require('../src/ExpressApp');

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
  });
});
