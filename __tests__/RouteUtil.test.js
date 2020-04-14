const RouteUtil = require('../src/RouteUtil');

const mockSubroutes = [
  {
    path: '/users',
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
        },
        {
          path: '/hey',
          method: 'get',
          controller: '/'
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
];

describe('RouteUtil', () => {
  describe('getRoutesInfo', () => {
    it('Should register all routes and subroutes with redirects', () => {
      const expectedRoutes = [
        { path: '/', method: 'get', doc: 'hello' },
        { path: '/users/', method: 'get' },
        { path: '/users/', method: 'post' },
        { path: '/users/hey/', method: 'get', redirectUrl: '/users/' },
        { path: '/users/:userId/posts/', method: 'get' },
        { path: '/users/:userId/posts/', method: 'post' }
      ];

      const mockRouter = {
        routes: [
          {
            path: '/',
            method: 'get',
            controller: () => {},
            doc: 'hello'
          }
        ],
        subroutes: mockSubroutes
      };

      const result = RouteUtil.getRoutesInfo(mockRouter);
      expect(result).toEqual(expectedRoutes);
    });

    it('Should register all routes and subroutes without redirects', () => {
      const expectedRoutes = [
        { path: '/', method: 'get', doc: 'hello' },
        { path: '/hey/', method: 'get', redirectUrl: '/' },
        { path: '/users/', method: 'get' },
        { path: '/users/', method: 'post' },
        { path: '/users/:userId/posts/', method: 'get' },
        { path: '/users/:userId/posts/', method: 'post' }
      ];

      const mockSubroutesWithoutRedirect = [...mockSubroutes];
      const mockRoutesArr = mockSubroutesWithoutRedirect[0].router.routes;
      mockRoutesArr.pop();
      mockSubroutesWithoutRedirect[0].router.routes = mockRoutesArr;

      const mockRouter = {
        routes: [
          {
            path: '/',
            method: 'get',
            controller: () => {},
            doc: 'hello'
          },
          {
            path: '/hey/',
            method: 'get',
            controller: '/'
          }
        ],
        subroutes: mockSubroutesWithoutRedirect
      };

      const result = RouteUtil.getRoutesInfo(mockRouter);
      expect(result).toEqual(expectedRoutes);
    });

    it('Should register all subroutes from top', () => {
      const expectedRoutes = [
        { path: '/users/', method: 'get' },
        { path: '/users/', method: 'post' },
        { path: '/users/:userId/posts/', method: 'get' },
        { path: '/users/:userId/posts/', method: 'post' }
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
