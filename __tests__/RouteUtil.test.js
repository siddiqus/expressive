const BaseController = require('../src/BaseController');
const RouteUtil = require('../src/RouteUtil');

const mockSubroutes = [
  {
    path: '/users',
    router: {
      routes: [
        {
          path: '/',
          method: 'get',
          controller: new BaseController()
        },
        {
          path: '/',
          method: 'post',
          controller: new BaseController()
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
                controller: new BaseController()
              },
              {
                path: '/',
                method: 'post',
                controller: new BaseController()
              }
            ]
          }
        }
      ]
    }
  }
];

describe('RouteUtil', () => {
  describe('getRoutesInfo', () => {
    it('Should register all routes and subroutes with redirects', () => {
      const expectedRoutes = [
        { path: '/', parentPath: '', method: 'get', doc: 'hello' },
        { path: '/users/', parentPath: '/users', method: 'get' },
        { path: '/users/', parentPath: '/users', method: 'post' },
        {
          path: '/users/:userId/posts/',
          parentPath: '/users/:userId/posts',
          method: 'get'
        },
        {
          path: '/users/:userId/posts/',
          parentPath: '/users/:userId/posts',
          method: 'post'
        }
      ];

      const rootController = new BaseController();
      rootController.doc = 'hello';
      const mockRouter = {
        routes: [
          {
            path: '/',
            method: 'get',
            controller: rootController
          }
        ],
        subroutes: mockSubroutes
      };

      const result = RouteUtil.getRoutesInfo(mockRouter);
      expect(result).toEqual(expectedRoutes);
    });

    it('Should register all subroutes from top', () => {
      const expectedRoutes = [
        { path: '/users/', parentPath: '/users', method: 'get' },
        { path: '/users/', parentPath: '/users', method: 'post' },
        {
          path: '/users/:userId/posts/',
          parentPath: '/users/:userId/posts',
          method: 'get'
        },
        {
          path: '/users/:userId/posts/',
          parentPath: '/users/:userId/posts',
          method: 'post'
        }
      ];

      const mockRouter = {
        subroutes: mockSubroutes
      };

      const result = RouteUtil.getRoutesInfo(mockRouter);
      expect(result).toEqual(expectedRoutes);
    });
  });

  describe('getHandlerWithManagedNextCall', () => {
    it('Should return handler with next call managed if no next defined', async () => {
      const fn = RouteUtil.getHandlerWithManagedNextCall(
        async (req, res) => 123
      );

      const mockReq = 1;
      const mockRes = 2;
      const mockNext = jest.fn();

      await fn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('Should return regular handler if 3 args', async () => {
      const fn = RouteUtil.getHandlerWithManagedNextCall(
        async (req, res, next) => next(123)
      );

      const mockReq = 1;
      const mockRes = 2;
      const mockNext = jest.fn();

      await fn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(123);
    });

    it('Should return handler with proper catch block', async () => {
      const someError = new Error('Some error');

      const fn = RouteUtil.getHandlerWithManagedNextCall(
        async (req, res, next) => {
          throw someError;
        }
      );

      const mockReq = 1;
      const mockRes = 2;
      const mockNext = jest.fn();

      await fn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(someError);
    });
  });

  describe('getErrorHandlerWithManagedNextCall', () => {
    it('Should return handler with next call managed if no next defined', async () => {
      const fn = RouteUtil.getErrorHandlerWithManagedNextCall(
        async (err, req, res) => 123
      );

      const mockReq = 1;
      const mockRes = 2;
      const mockNext = jest.fn();

      await fn(null, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('Should return regular handler if 3 args', async () => {
      const fn = RouteUtil.getErrorHandlerWithManagedNextCall(
        async (err, req, res, next) => next(123)
      );

      const mockReq = 1;
      const mockRes = 2;
      const mockNext = jest.fn();

      await fn(null, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(123);
    });

    it('Should return handler with proper catch block', async () => {
      const someError = new Error('Some error');

      const fn = RouteUtil.getErrorHandlerWithManagedNextCall(
        async (err, req, res, next) => {
          throw someError;
        }
      );

      const mockReq = 1;
      const mockRes = 2;
      const mockNext = jest.fn();

      await fn(null, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(someError);
    });
  });

  describe('isFunction', () => {
    it('Should return false if it is a class', () => {
      class SomeClass {}

      const result = RouteUtil.isFunction(SomeClass);

      expect(result).toBeFalsy();
    });

    it('Should return true if a named function', () => {
      function someFunc() {}

      const result = RouteUtil.isFunction(someFunc);

      expect(result).toBeTruthy();
    });

    it('Should return true if an unnamed function', () => {
      const result = RouteUtil.isFunction(() => {});

      expect(result).toBeTruthy();
    });
  });

  describe('isUrlPath', () => {
    it('Should return true for valid urls', () => {
      ['/hehe/some', '/hehe', '/hehe-blah/:id/ahhs/:someId/hash', '/'].forEach(
        (str) => {
          expect(RouteUtil.isUrlPath(str)).toBeTruthy();
        }
      );
    });

    it('Should return false for invalid urls', () => {
      ['ajdlasjdksad', '10980du90', '/hh*ehe', 'hehe/', '/heheh   ooo'].forEach(
        (str) => {
          expect(RouteUtil.isUrlPath(str)).toBeFalsy();
        }
      );
    });

    it('Should return false if non string input is given', () => {
      expect(RouteUtil.isUrlPath(() => {})).toBeFalsy();
      expect(RouteUtil.isUrlPath(class SomeClass {})).toBeFalsy();
    });
  });
});
