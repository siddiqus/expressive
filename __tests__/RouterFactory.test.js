const RouterFactory = require('../src/RouterFactory');
const BaseController = require('../src/BaseController');
const Route = require('../src/Route');

class MockControllerThrowsError extends BaseController {}
const mockErrorJestFn = jest.fn().mockImplementation(() => {
  throw new Error('mockErrorJestFn');
});
MockControllerThrowsError.prototype.handleRequest = mockErrorJestFn;

const mockSubroutes = [
  {
    path: '/users',
    router: {
      routes: [
        Route.get('/', new BaseController()),
        Route.post('/', new BaseController())
      ],
      subroutes: [
        {
          path: '/:userId/posts',
          router: {
            routes: [
              Route.get('/', new BaseController()),
              Route.post('/', new BaseController())
            ]
          }
        }
      ]
    }
  }
];

describe('RouterFactory', () => {
  beforeEach(() => {
    mockErrorJestFn.mockClear();
  });

  afterEach(() => {
    mockErrorJestFn.mockClear();
  });

  describe('getExpressRouter', () => {
    it('Should register all routes and subroutes', () => {
      const mockRouter = {
        routes: [
          {
            path: '/',
            method: 'get',
            controller: new BaseController()
          }
        ],
        subroutes: mockSubroutes
      };

      const routerFactory = new RouterFactory({});
      const mockExpressRouter = {
        get: jest.fn(),
        use: jest.fn(),
        post: jest.fn()
      };
      routerFactory._getRouter = jest.fn().mockReturnValue(mockExpressRouter);
      routerFactory.getExpressRouter(mockRouter);

      expect(mockExpressRouter.get).toHaveBeenCalledTimes(3);
      expect(mockExpressRouter.get.mock.calls[0][0]).toEqual('/');
      expect(mockExpressRouter.get.mock.calls[1][0]).toEqual('/');
      expect(mockExpressRouter.get.mock.calls[2][0]).toEqual('/');

      expect(mockExpressRouter.post).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.get.mock.calls[0][0]).toEqual('/');
      expect(mockExpressRouter.get.mock.calls[1][0]).toEqual('/');

      expect(mockExpressRouter.use).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.use.mock.calls[0][0]).toEqual('/:userId/posts');
      expect(mockExpressRouter.use.mock.calls[1][0]).toEqual('/users');
    });

    it('Should register all subroutes from top', () => {
      const mockRouter = {
        subroutes: mockSubroutes
      };
      const routerFactory = new RouterFactory({});
      const mockExpressRouter = {
        get: jest.fn(),
        use: jest.fn(),
        post: jest.fn()
      };
      routerFactory._getRouter = jest.fn().mockReturnValue(mockExpressRouter);
      routerFactory.getExpressRouter(mockRouter);

      expect(mockExpressRouter.get).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.get.mock.calls[0][0]).toEqual('/');
      expect(mockExpressRouter.get.mock.calls[1][0]).toEqual('/');

      expect(mockExpressRouter.post).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.get.mock.calls[0][0]).toEqual('/');
      expect(mockExpressRouter.get.mock.calls[1][0]).toEqual('/');

      expect(mockExpressRouter.use).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.use.mock.calls[0][0]).toEqual('/:userId/posts');
      expect(mockExpressRouter.use.mock.calls[1][0]).toEqual('/users');
    });
  });

  describe('_registerRoute', () => {
    it('Should register route with middleware properly', () => {
      const factory = new RouterFactory({});

      const mockExpressRouter = {
        get: jest.fn(),
        use: jest.fn(),
        post: jest.fn()
      };

      factory.routeUtil = {
        getDuplicateUrls: jest.fn().mockReturnValue([]),
        getHandlerWithManagedNextCall: jest.fn()
      };

      class SomeController extends BaseController {}
      const controller = new SomeController();
      controller.router = {
        routes: [Route.get('/hello', new BaseController())]
      };
      controller.middleware = [(req, res) => 1, (req, res) => 2];
      controller.authorizer = (req, res) => {};

      factory._registerRoute(mockExpressRouter, {
        method: 'get',
        path: '/',
        controller
      });

      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.get).toHaveBeenCalled();
    });

    it('Should use celebrate validation schema', () => {
      const factory = new RouterFactory({});

      factory.celebrateMiddleware = jest.fn().mockReturnValue(1);

      const mockExpressRouter = {
        get: jest.fn(),
        use: jest.fn(),
        post: jest.fn()
      };

      factory.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn()
      };

      const schema = {
        body: {
          someId: 1
        }
      };

      class SomeController extends BaseController {}
      const controller = new SomeController();
      controller.middleware = [(req, res) => 1, (req, res) => 2];
      controller.authorizer = (req, res) => {};
      controller.validationSchema = schema;

      factory._registerRoute(mockExpressRouter, {
        method: 'get',
        path: '/',
        controller
      });

      expect(factory.celebrateMiddleware).toHaveBeenCalledWith(schema, {
        abortEarly: false
      });
      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.get).toHaveBeenCalled();
    });

    it('Should not use celebrate validation schema with file upload', () => {
      const factory = new RouterFactory({});

      factory.celebrateMiddleware = jest.fn().mockReturnValue(1);

      const mockExpressRouter = {
        get: jest.fn(),
        use: jest.fn(),
        post: jest.fn()
      };

      factory.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn()
      };

      const schema = {
        fileUpload: {
          someId: 1
        }
      };

      class SomeCtr extends BaseController {}
      const controller = new SomeCtr();
      controller.middleware = [(req, res) => 1, (req, res) => 2];
      controller.authorizer = (req, res) => {};
      controller.validationSchema = schema;

      factory._registerRoute(mockExpressRouter, {
        method: 'get',
        path: '/',
        controller
      });

      expect(factory.celebrateMiddleware).not.toHaveBeenCalledWith(schema);
      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.get).toHaveBeenCalled();
    });
  });

  describe('_registerPreHandlers', () => {
    it('Should not change routerArgs if no pre handlers defined', () => {
      const factory = new RouterFactory({});

      const routerArgs = [];

      factory._registerPreHandlers(routerArgs, null);

      expect(routerArgs).toEqual([]);
    });

    it('Should register handler if single handler defined', () => {
      const factory = new RouterFactory({});
      factory.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn().mockReturnValue(123)
      };
      const routerArgs = [];
      const handler = (req, res) => {};
      factory._registerPreHandlers(routerArgs, handler);

      expect(routerArgs).toEqual([123]);
      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledWith(handler);
    });

    it('Should register handler if array of handlers defined', () => {
      const factory = new RouterFactory({});
      factory.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn().mockReturnValue(123)
      };
      const routerArgs = [];
      const handlers = [
        (req, res) => {
          return 1;
        },
        (req, res) => {
          return 2;
        }
      ];
      factory._registerPreHandlers(routerArgs, handlers);

      expect(routerArgs).toEqual([123, 123]);
      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledWith(handlers[0]);
      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledWith(handlers[1]);
    });
  });

  describe('_getWrappedController', () => {
    it('should execute given base controller child', async () => {
      const factory = new RouterFactory();

      const mockFn = jest.fn();

      class SomeController extends BaseController {
        handleRequest() {
          mockFn();
        }
      }

      const controller = new SomeController();

      const mockHandleInternalError = jest.fn();
      controller.internalServerError = mockHandleInternalError;

      const fn = factory._getWrappedController(controller);

      const someReq = 1;
      const someRes = {
        status: jest.fn(),
        json: jest.fn,
        headersSent: false
      };
      const someNext = 3;

      await fn(someReq, someRes, someNext);

      expect(mockFn).toHaveBeenCalled();
      expect(mockHandleInternalError).toHaveBeenCalledWith(
        'Server did not send any response'
      );
    });

    it('should pass error to next', async () => {
      const factory = new RouterFactory();

      class SomeController extends BaseController {
        handleRequest() {
          throw new Error('Some error');
        }
      }

      const fn = factory._getWrappedController(new SomeController());

      const someReq = 1;
      const someRes = 2;
      const someNext = jest.fn();

      await fn(someReq, someRes, someNext);

      // expect(mockFn).toHaveBeenCalledWith(someReq, someRes, someNext);
      expect(someNext).toHaveBeenCalledWith(new Error('Some error'));
    });

    it('should not call internal if resolvedBy was populated', async () => {
      const factory = new RouterFactory();
      class SomeController extends BaseController {
        handleRequest() {
          this.ok({ some: 'data' });
        }
      }

      const controller = new SomeController();
      controller.resolvedBy = 'test';
      controller.internalServerError = jest.fn();
      const fn = factory._getWrappedController(controller);

      const someReq = 1;
      const someRes = {
        status: jest.fn(),
        json: jest.fn(),
        headersSent: true
      };
      const someNext = jest.fn();

      await fn(someReq, someRes, someNext);

      expect(someNext).not.toHaveBeenCalled();
      expect(controller.internalServerError).not.toHaveBeenCalled();
    });
  });

  it('Should get router from method', () => {
    const factory = new RouterFactory();

    const result = factory._getRouter();

    expect(result).toBeDefined();
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
      new RouterFactory({})._handleDuplicateUrls(mockRoutes);
    } catch (error) {
      response = error;
    }

    expect(response.message).toEqual(
      'Duplicate endpoints detected! -> get /hello/, get /v1/hey/'
    );
  });
});
