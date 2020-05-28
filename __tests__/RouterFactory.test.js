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
        {
          path: '/',
          method: 'get',
          controller: BaseController
        },
        {
          path: '/',
          method: 'post',
          controller: BaseController
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
                controller: BaseController
              },
              {
                path: '/',
                method: 'post',
                controller: BaseController
              }
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
            controller: BaseController
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
        getHandlerWithManagedNextCall: jest.fn()
      };

      factory._registerRoute(mockExpressRouter, {
        method: 'get',
        path: '/',
        controller: BaseController,
        middleware: [(req, res) => 1, (req, res) => 2],
        authorizer: (req, res) => {}
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

      factory._registerRoute(mockExpressRouter, {
        method: 'get',
        path: '/',
        controller: BaseController,
        middleware: [(req, res) => 1, (req, res) => 2],
        authorizer: (req, res) => {},
        validationSchema: schema
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

      factory._registerRoute(mockExpressRouter, {
        method: 'get',
        path: '/',
        controller: BaseController,
        middleware: [(req, res) => 1, (req, res) => 2],
        authorizer: (req, res) => {},
        validationSchema: schema
      });

      expect(factory.celebrateMiddleware).not.toHaveBeenCalledWith(schema);
      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledTimes(2);
      expect(mockExpressRouter.get).toHaveBeenCalled();
    });
  });

  describe('_registerSubroute', () => {
    it('Should register subroute with middleware properly', () => {
      const factory = new RouterFactory({});

      const mockExpressRouter = {
        use: jest.fn()
      };
      factory.getExpressRouter = jest.fn();
      factory.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn()
      };

      factory._registerSubroute(mockExpressRouter, {
        path: '/',
        router: 'somerouter',
        middleware: [(req, res) => 1, (req, res) => 2, (req, res) => 3],
        authorizer: (req, res) => {}
      });

      expect(factory.getExpressRouter).toHaveBeenCalled();
      expect(
        factory.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledTimes(3);
      expect(mockExpressRouter.use).toHaveBeenCalled();
    });
  });

  describe('_getWrappedController', () => {
    it('should execute controller if given a function', async () => {
      const factory = new RouterFactory();

      const mockFn = jest.fn();
      const fn = factory._getWrappedController(mockFn);

      const someReq = 1;
      const someRes = 2;
      const someNext = 3;

      await fn(someReq, someRes, someNext);

      expect(mockFn).toHaveBeenCalledWith(someReq, someRes, someNext);
    });

    it('should execute controller if given an anonymous function', async () => {
      const factory = new RouterFactory();

      const mockFn = jest.fn();
      const fn = factory._getWrappedController((req, res, next) => {
        mockFn(req, res, next);
      });

      const someReq = 1;
      const someRes = 2;
      const someNext = 3;

      await fn(someReq, someRes, someNext);

      expect(mockFn).toHaveBeenCalledWith(someReq, someRes, someNext);
    });

    it('should execute given base controller child', async () => {
      const factory = new RouterFactory();

      const mockFn = jest.fn();

      class SomeController extends BaseController {
        handleRequest() {
          mockFn(this.req, this.res, this.next);
        }
      }

      const fn = factory._getWrappedController(SomeController);

      const someReq = 1;
      const someRes = 2;
      const someNext = 3;

      await fn(someReq, someRes, someNext);

      expect(mockFn).toHaveBeenCalledWith(someReq, someRes, someNext);
    });

    it('should pass error to next', async () => {
      const factory = new RouterFactory();

      class SomeController extends BaseController {
        handleRequest() {
          throw new Error('Some error');
        }
      }

      const fn = factory._getWrappedController(SomeController);

      const someReq = 1;
      const someRes = 2;
      const someNext = jest.fn();

      await fn(someReq, someRes, someNext);

      // expect(mockFn).toHaveBeenCalledWith(someReq, someRes, someNext);
      expect(someNext).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('_executeController', () => {
    it('Should redirect if route url', () => {
      const factory = new RouterFactory();
      const mockRes = {
        redirect: jest.fn()
      };

      factory._executeController('/somepath', {
        req: null,
        res: mockRes,
        next: null
      });

      expect(mockRes.redirect).toHaveBeenCalledWith('/somepath');
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
