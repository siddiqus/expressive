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
          authorizer: true,
          authObjectHandler: (req, res) => {
            console.log(req.authorizer);
          },
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

    it('Should register proper error handler for array', () => {
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
          showSwaggerOnlyInDev: false,
          swaggerInfo: {}
        }
      );

      app.express = {
        use: jest.fn()
      };
      app.config.errorHandler = [
        (err, req, res) => ({ err, req, res, next: 1 }),
        (err, req, res, next) => ({ err, req, res, next })
      ];

      app._registerErrorHandlers();

      expect(app.express.use).toHaveBeenCalledTimes(1);
      expect(app.express.use.mock.calls[0][0][0].length).toEqual(4);
      expect(app.express.use.mock.calls[0][0][1].length).toEqual(4);

      expect(app.express.use.mock.calls[0][0][0](1, 2, 3)).toEqual({
        err: 1,
        req: 2,
        res: 3,
        next: 1
      });

      expect(app.express.use.mock.calls[0][0][1](1, 2, 3, 4)).toEqual({
        err: 1,
        req: 2,
        res: 3,
        next: 4
      });
    });

    it('Should register proper error handler for single function', () => {
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
          showSwaggerOnlyInDev: false,
          swaggerInfo: {}
        }
      );

      app.express = {
        use: jest.fn()
      };
      app.config.errorHandler = (err, req, res) => ({ err, req, res, next: 1 });

      app._registerErrorHandlers();

      expect(app.express.use).toHaveBeenCalledTimes(1);
      expect(app.express.use.mock.calls[0][0].length).toEqual(4);
      expect(app.express.use.mock.calls[0][0](1, 2, 3)).toEqual({
        err: 1,
        req: 2,
        res: 3,
        next: 1
      });
    });
  });
});
