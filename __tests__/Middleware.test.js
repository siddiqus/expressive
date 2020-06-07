const response = require('../src/middleware/response');
const MiddlewareManager = require('../src/middleware/MiddlewareManager');

const OLD_ENV = process.env;

describe('response middleware', () => {
  it('Should call fn properly', () => {
    const mockNext = jest.fn();
    const mockRes = {
      setHeader: jest.fn()
    };
    response(null, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
  });
});

describe('Middleware Manager', () => {
  describe('registerMiddleware', () => {
    it('Should register defaults and user middleware', () => {
      const mockExpress = {
        use: jest.fn()
      };
      const mockUserMiddleware = ['abc'];
      const manager = new MiddlewareManager(
        {
          middleware: mockUserMiddleware
        },
        mockExpress
      );
      manager.expressModule = {
        json: jest.fn().mockReturnValue(1),
        urlencoded: jest.fn().mockReturnValue(5)
      };
      manager.addRequestId = jest.fn().mockReturnValue(2);
      manager.helmet = jest.fn().mockReturnValue(3);
      manager.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn().mockImplementation((d) => d)
      };

      manager.registerBasicMiddleware();

      expect(mockExpress.use).toHaveBeenCalledTimes(6);

      expect(manager.expressModule.json).toHaveBeenCalledWith({
        limit: manager.options.bodyLimit
      });

      expect(mockExpress.use.mock.calls[0][0]).toEqual(1);
      expect(mockExpress.use.mock.calls[1][0]).toEqual(5);
      expect(mockExpress.use.mock.calls[2][0]).toEqual(response);
      expect(mockExpress.use.mock.calls[3][0]).toEqual(2);
      expect(mockExpress.use.mock.calls[4][0]).toEqual(3);
      expect(mockExpress.use.mock.calls[5][0]).toEqual(mockUserMiddleware);
    });

    it('Should register defaults without user middleware', () => {
      const mockExpress = {
        use: jest.fn()
      };
      const manager = new MiddlewareManager({}, mockExpress);
      manager.expressModule = {
        json: jest.fn().mockReturnValue(1),
        urlencoded: jest.fn().mockReturnValue(2)
      };
      manager.addRequestId = jest.fn().mockReturnValue(3);

      manager.registerBasicMiddleware();

      expect(mockExpress.use).toHaveBeenCalledTimes(5); // registering 4 middleware

      expect(manager.expressModule.json).toHaveBeenCalledWith({
        limit: manager.options.bodyLimit
      });

      expect(mockExpress.use.mock.calls[0][0]).toEqual(1);
      expect(mockExpress.use.mock.calls[1][0]).toEqual(2);
      expect(mockExpress.use.mock.calls[2][0]).toEqual(response);
      expect(mockExpress.use.mock.calls[3][0]).toEqual(3);
    });
  });

  describe('registerNotFoundHandler', () => {
    it('Should register given handler', () => {
      const mockExpress = {
        use: jest.fn()
      };

      const someMockHandler = 'hehe';
      const options = {
        notFoundHandler: someMockHandler
      };
      const manager = new MiddlewareManager(options, mockExpress);

      manager.registerNotFoundHandler(mockExpress, someMockHandler);

      expect(mockExpress.use).toHaveBeenCalledWith(someMockHandler);
    });

    it('Should run default handler properly', () => {
      const manager = new MiddlewareManager();
      const mockReq = {
        path: '/some/path'
      };

      const mockRes = {
        status: jest.fn(),
        json: jest.fn()
      };

      manager.defaultNotFoundHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: `Route \'/some/path\' not found`
      });
    });
  });

  describe('_registerHelmet', () => {
    it('Should register helmet with defaults if no config is given', () => {
      const mockExpress = {
        use: jest.fn()
      };
      const middlewareManager = new MiddlewareManager({}, mockExpress);
      middlewareManager.helmet = jest.fn().mockReturnValue(123);

      middlewareManager._registerHelmet();
      expect(mockExpress.use).toHaveBeenCalledWith(123);
      expect(middlewareManager.helmet).toHaveBeenCalledTimes(1);
      expect(middlewareManager.helmet.mock.calls[0].length).toEqual(0);
    });

    it('Should register helmet with given config', () => {
      const mockHelmetOptions = {
        hello: 'world'
      };

      const mockExpress = {
        use: jest.fn()
      };
      const middlewareManager = new MiddlewareManager(
        {
          helmetOptions: mockHelmetOptions
        },
        mockExpress
      );
      middlewareManager.helmet = jest.fn().mockReturnValue(123);

      middlewareManager._registerHelmet();
      expect(mockExpress.use).toHaveBeenCalledWith(123);
      expect(middlewareManager.helmet).toHaveBeenCalledTimes(1);
      expect(middlewareManager.helmet).toHaveBeenCalledWith(mockHelmetOptions);
    });
  });

  describe('registerCelebrateErrorMiddleware', () => {
    it('Should register custom celebrate error middleware is provided', () => {
      const customCelebrateHandler = jest.fn();

      const mockUse = jest.fn();

      const mockExpress = {
        use: mockUse
      };

      const manager = new MiddlewareManager(
        {
          celebrateErrorHandler: customCelebrateHandler
        },
        mockExpress
      );
      manager.registerCelebrateErrorMiddleware();

      expect(mockUse).toHaveBeenCalledWith(customCelebrateHandler);
    });

    it('Should register default celebrate error middleware if custom is not provided', () => {
      const mockUse = jest.fn();

      const mockExpress = {
        use: mockUse
      };
      const manager = new MiddlewareManager({}, mockExpress);

      const mockCelebrateErrors = jest.fn().mockReturnValue(1);
      manager.celebrateErrors = mockCelebrateErrors;
      manager.registerCelebrateErrorMiddleware();

      expect(mockCelebrateErrors).toHaveBeenCalled();
      expect(mockUse).toHaveBeenCalledWith(1);
    });
  });

  describe('registerDocs', () => {
    it('Should register and redoc properly', () => {
      const swaggerInfo = { name: 'John Smith' };
      const mockRouter = {
        some: 'routes'
      };
      const mockSwaggerDefinitions = {
        some: 'Definition'
      };

      const options = {
        basePath: '/',
        swaggerInfo,
        swaggerDefinitions: mockSwaggerDefinitions,
        showSwaggerOnlyInDev: false
      };

      const mockExpress = {
        get: jest.fn()
      };
      const manager = new MiddlewareManager(options, mockExpress);

      const mockSwaggerHeader = { some: 'Header' };
      const mockSwaggerJson = { hello: 'world' };
      manager.SwaggerUtils = {
        getSwaggerHeader: jest.fn().mockReturnValue(mockSwaggerHeader),
        convertDocsToSwaggerDoc: jest.fn().mockReturnValue(mockSwaggerJson),
        registerExpress: jest.fn()
      };
      manager.registerRedoc = jest.fn();

      manager.registerDocs(mockRouter);

      expect(manager.registerRedoc).toHaveBeenCalledWith({
        app: mockExpress,
        swaggerJson: mockSwaggerJson,
        url: '/docs/redoc',
        authUser: {
          user: 'admin',
          password: 'admin'
        }
      });
      expect(manager.SwaggerUtils.getSwaggerHeader).toHaveBeenCalledWith(
        '/',
        swaggerInfo
      );
      expect(manager.SwaggerUtils.convertDocsToSwaggerDoc).toHaveBeenCalledWith(
        mockRouter,
        mockSwaggerHeader,
        mockSwaggerDefinitions
      );
      expect(manager.SwaggerUtils.registerExpress).toHaveBeenCalledWith({
        app: manager.express,
        swaggerJson: mockSwaggerJson,
        url: '/docs/swagger',
        authUser: {
          user: 'admin',
          password: 'admin'
        }
      });
    });

    describe('test with env set username and password for swagger', () => {
      beforeEach(() => {
        jest.resetModules(); // this is important - it clears the cache
        process.env = {
          ...OLD_ENV,
          EXPRESS_SWAGGER_USER: 'expressive',
          EXPRESS_SWAGGER_PASSWORD: 'expressive321'
        };
      });

      afterEach(() => {
        process.env = OLD_ENV;
      });

      it('description', () => {
        const swaggerInfo = { name: 'John Smith' };
        const mockRouter = {
          some: 'routes'
        };
        const mockSwaggerDefinitions = {
          some: 'Definition'
        };

        const options = {
          basePath: '/',
          swaggerInfo,
          swaggerDefinitions: mockSwaggerDefinitions,
          showSwaggerOnlyInDev: false
        };

        const mockExpress = {
          get: jest.fn()
        };
        const manager = new MiddlewareManager(options, mockExpress);

        const mockSwaggerHeader = { some: 'Header' };
        const mockSwaggerJson = { hello: 'world' };
        manager.SwaggerUtils = {
          getSwaggerHeader: jest.fn().mockReturnValue(mockSwaggerHeader),
          convertDocsToSwaggerDoc: jest.fn().mockReturnValue(mockSwaggerJson),
          registerExpress: jest.fn()
        };
        manager.registerRedoc = jest.fn();

        manager.registerDocs(mockRouter);

        expect(manager.registerRedoc).toHaveBeenCalledWith({
          app: mockExpress,
          swaggerJson: mockSwaggerJson,
          url: '/docs/redoc',
          authUser: {
            user: 'expressive',
            password: 'expressive321'
          }
        });

        expect(manager.SwaggerUtils.registerExpress).toHaveBeenCalledWith({
          app: mockExpress,
          swaggerJson: mockSwaggerJson,
          url: '/docs/swagger',
          authUser: {
            user: 'expressive',
            password: 'expressive321'
          }
        });
      });
    });

    describe('test without NODE_ENV', () => {
      beforeEach(() => {
        jest.resetModules(); // this is important - it clears the cache
        process.env = { ...OLD_ENV };
        delete process.env.NODE_ENV;
      });

      afterEach(() => {
        process.env = OLD_ENV;
      });

      it('Should register with default NODE_ENV', () => {
        const swaggerInfo = { name: 'John Smith' };
        const mockRouter = {
          some: 'routes'
        };
        const mockSwaggerDefinitions = {
          some: 'Definition'
        };

        const options = {
          basePath: '/',
          swaggerInfo,
          swaggerDefinitions: mockSwaggerDefinitions,
          showSwaggerOnlyInDev: false
        };

        const mockExpress = {
          get: jest.fn()
        };
        const manager = new MiddlewareManager(options, mockExpress);

        const mockSwaggerHeader = { some: 'Header' };
        const mockSwaggerJson = { hello: 'world' };
        manager.SwaggerUtils = {
          getSwaggerHeader: jest.fn().mockReturnValue(mockSwaggerHeader),
          convertDocsToSwaggerDoc: jest.fn().mockReturnValue(mockSwaggerJson),
          registerExpress: jest.fn()
        };
        manager.registerRedoc = jest.fn();

        manager.registerDocs(mockRouter);

        expect(manager.registerRedoc).toHaveBeenCalledWith({
          app: mockExpress,
          swaggerJson: mockSwaggerJson,
          url: '/docs/redoc',
          authUser: {
            user: 'admin',
            password: 'admin'
          }
        });

        expect(manager.SwaggerUtils.registerExpress).toHaveBeenCalledWith({
          app: mockExpress,
          swaggerJson: mockSwaggerJson,
          url: '/docs/swagger',
          authUser: {
            user: 'admin',
            password: 'admin'
          }
        });
      });
    });
  });

  describe('registerAuth', () => {
    it('Should throw error if authorizer is declared without authObjectHandler', () => {
      let response;
      try {
        const manager = new MiddlewareManager({
          authorizer: ['hehe']
        });

        manager.registerAuth();
      } catch (error) {
        response = error;
      }

      expect(response.message).toEqual(
        `'authorizer' object declared, but 'authObjectHandler' is not defined in ExpressApp constructor params`
      );
    });

    it('Should not throw error if authorizer and authObjectHandler both declared', () => {
      let response;
      const mockExpress = {
        use: jest.fn()
      };
      const manager = new MiddlewareManager(
        {
          authorizer: ['hehe'],
          authObjectHandler: (req, res) => {
            return null;
          }
        },
        mockExpress
      );
      manager.authUtil = {
        getAuthorizerMiddleware: jest.fn().mockReturnValue(1234)
      };

      try {
        manager.registerAuth();
      } catch (error) {
        response = error;
      }

      expect(response).not.toBeInstanceOf(Error);
      expect(mockExpress.use).toHaveBeenCalledWith(1234);
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
