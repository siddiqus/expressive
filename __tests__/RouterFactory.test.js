const RouterFactory = require("../src/RouterFactory");
const BaseController = require("../src/BaseController");

class MockControllerThrowsError extends BaseController { }
const mockErrorJestFn = jest.fn().mockImplementation(() => {
    throw new Error("mockErrorJestFn")
});
MockControllerThrowsError.prototype.handleRequest = mockErrorJestFn;

const mockSubroutes = [
    {
        path: "/users",
        router: {
            routes: [
                {
                    path: "/",
                    method: "get",
                    controller: BaseController
                },
                {
                    path: "/",
                    method: "post",
                    controller: BaseController
                }
            ],
            subroutes: [
                {
                    path: "/:userId/posts",
                    router: {
                        routes: [
                            {
                                path: "/",
                                method: "get",
                                controller: BaseController
                            },
                            {
                                path: "/",
                                method: "post",
                                controller: BaseController
                            }
                        ]
                    }
                }
            ]
        }
    }
];

describe("RouterFactory", () => {
    beforeEach(() => {
        mockErrorJestFn.mockClear();
    });

    afterEach(() => {
        mockErrorJestFn.mockClear();
    });

    describe("getExpressRouter", () => {
        it("Should register all routes and subroutes", () => {
            const mockRouter = {
                routes: [
                    {
                        path: "/",
                        method: "get",
                        controller: BaseController
                    }
                ],
                subroutes: mockSubroutes
            }

            const routerFactory = new RouterFactory();
            const mockExpressRouter = {
                get: jest.fn(),
                use: jest.fn(),
                post: jest.fn()
            }
            routerFactory._getRouter = jest.fn().mockReturnValue(mockExpressRouter);
            routerFactory.getExpressRouter(mockRouter);

            expect(mockExpressRouter.get).toHaveBeenCalledTimes(3);
            expect(mockExpressRouter.get.mock.calls[0][0]).toEqual("/");
            expect(mockExpressRouter.get.mock.calls[1][0]).toEqual("/");
            expect(mockExpressRouter.get.mock.calls[2][0]).toEqual("/");

            expect(mockExpressRouter.post).toHaveBeenCalledTimes(2);
            expect(mockExpressRouter.get.mock.calls[0][0]).toEqual("/");
            expect(mockExpressRouter.get.mock.calls[1][0]).toEqual("/");

            expect(mockExpressRouter.use).toHaveBeenCalledTimes(2);
            expect(mockExpressRouter.use.mock.calls[0][0]).toEqual("/:userId/posts");
            expect(mockExpressRouter.use.mock.calls[1][0]).toEqual("/users");
        });

        it("Should register all subroutes from top", () => {
            const mockRouter = {
                subroutes: mockSubroutes
            };

            const routerFactory = new RouterFactory();
            const mockExpressRouter = {
                get: jest.fn(),
                use: jest.fn(),
                post: jest.fn()
            }
            routerFactory._getRouter = jest.fn().mockReturnValue(mockExpressRouter);
            routerFactory.getExpressRouter(mockRouter);

            expect(mockExpressRouter.get).toHaveBeenCalledTimes(2);
            expect(mockExpressRouter.get.mock.calls[0][0]).toEqual("/");
            expect(mockExpressRouter.get.mock.calls[1][0]).toEqual("/");

            expect(mockExpressRouter.post).toHaveBeenCalledTimes(2);
            expect(mockExpressRouter.get.mock.calls[0][0]).toEqual("/");
            expect(mockExpressRouter.get.mock.calls[1][0]).toEqual("/");

            expect(mockExpressRouter.use).toHaveBeenCalledTimes(2);
            expect(mockExpressRouter.use.mock.calls[0][0]).toEqual("/:userId/posts");
            expect(mockExpressRouter.use.mock.calls[1][0]).toEqual("/users");
        });
    });

    describe("_hasValidationErrors", () => {
        it("Should return true if validation errors", () => {
            const factory = new RouterFactory();
            const errors = {
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue([1, 2, 3])
            }
            factory.validationResult = jest.fn().mockReturnValue(errors);

            const mockRes = {
                status: jest.fn(),
                json: jest.fn()
            };
            const mockReq = { name: "some name" };
            const result = factory._hasValidationErrors(mockReq, mockRes);

            expect(result).toEqual(true);
            expect(mockRes.status).toHaveBeenCalledWith(422);
            expect(mockRes.json).toHaveBeenCalledWith({
                errors: [1, 2, 3]
            });
        });

        it("Should return false if no validation errors", () => {
            const factory = new RouterFactory();
            const errors = {
                isEmpty: jest.fn().mockReturnValue(true),
                array: jest.fn().mockReturnValue([])
            }
            factory.validationResult = jest.fn().mockReturnValue(errors);

            const mockRes = {
                status: jest.fn(),
                json: jest.fn()
            };
            const mockReq = { name: "some name" };
            const result = factory._hasValidationErrors(mockReq, mockRes);

            expect(result).toEqual(false);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe("_registerRoute", () => {
        it("Should register route with middleware properly", () => {
            const factory = new RouterFactory();

            const mockExpressRouter = {
                get: jest.fn(),
                use: jest.fn(),
                post: jest.fn()
            }
            
            factory._getHandlerWithManagedNextCall = jest.fn();

            factory._registerRoute(mockExpressRouter, {
                method: "get",
                path: "/",
                controller: BaseController,
                middleware: [
                    (req, res) => 1,
                    (req, res) => 2,
                ]
            });

            expect(factory._getHandlerWithManagedNextCall).toHaveBeenCalledTimes(2);
            expect(mockExpressRouter.get).toHaveBeenCalled();
        });
    });
    
    describe("_registerSubroute", () => {
        it("Should register subroute with middleware properly", () => {
            const factory = new RouterFactory();

            const mockExpressRouter = {
                use: jest.fn()
            };
            factory.getExpressRouter = jest.fn();
            factory._getHandlerWithManagedNextCall = jest.fn();

            factory._registerSubroute(mockExpressRouter, {
                path: "/",
                router: "somerouter",
                middleware: [
                    (req, res) => 1,
                    (req, res) => 2,
                    (req, res) => 3,
                ]
            });

            expect(factory.getExpressRouter).toHaveBeenCalled();
            expect(factory._getHandlerWithManagedNextCall).toHaveBeenCalledTimes(3);
            expect(mockExpressRouter.use).toHaveBeenCalled();
        });
    });

    describe("_getHandlerWithManagedNextCall", () => {
        it("Should return handler with next call managed if no next defined", async () => {
            const factory = new RouterFactory();

            const fn = factory._getHandlerWithManagedNextCall(
                async (req, res) => 123
            );

            const mockReq = 1;
            const mockRes = 2;
            const mockNext = jest.fn();

            await fn(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it("Should return regular handler if 3 args", async () => {
            const factory = new RouterFactory();

            const fn = factory._getHandlerWithManagedNextCall(
                async (req, res, next) => next(123)
            );

            const mockReq = 1;
            const mockRes = 2;
            const mockNext = jest.fn();

            await fn(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(123);
        });

        it("Should return handler with proper catch block", async () => {
            const factory = new RouterFactory();

            const someError = new Error("Some error");

            const fn = factory._getHandlerWithManagedNextCall(
                async (req, res, next) => { throw someError }
            );

            const mockReq = 1;
            const mockRes = 2;
            const mockNext = jest.fn();

            await fn(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(someError);
        });

    });

    describe("_getWrappedController", () => {
        it("should handle internal error with error handler", async () => {
            const factory = new RouterFactory();
            factory._hasValidationErrors = jest.fn().mockReturnValue(false);

            const mockErrorHandler = jest.fn();
            const mockNext = jest.fn();

            MockControllerThrowsError.prototype._handleRequestBase = mockErrorJestFn;
            const fn = factory._getWrappedController(MockControllerThrowsError, mockErrorHandler);
            const mockReq = 1;
            const mockRes = 2;

            await fn(mockReq, mockRes, mockNext);

            expect(mockErrorJestFn).toHaveBeenCalled();
            const err = new Error("mockErrorJestFn");
            expect(mockErrorHandler).toHaveBeenCalledWith(err, mockReq, mockRes, mockNext);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should handle if error but no error handler specified", async () => {
            const factory = new RouterFactory();
            factory._hasValidationErrors = jest.fn().mockReturnValue(false);

            const mockNext = jest.fn();


            class SomeMockController extends BaseController {
                handleRequest() {
                    throw new Error("some error");
                }
            }

            const fn = factory._getWrappedController(SomeMockController);
            const mockReq = 1;
            const mockRes = 2;

            await fn(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext.mock.calls[0][0].message).toEqual("some error");
        });


        it("should handle if there is validation error", async () => {
            const factory = new RouterFactory();
            factory._hasValidationErrors = jest.fn().mockReturnValue(true);

            const mockNext = jest.fn();

            const fn = factory._getWrappedController(MockControllerThrowsError);
            const mockReq = 1;
            const mockRes = 2;

            await fn(mockReq, mockRes, mockNext);

            expect(mockErrorJestFn).not.toHaveBeenCalled();
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should execute controller if given a function", async () => {
            const factory = new RouterFactory();
            factory._hasValidationErrors = jest.fn().mockReturnValue(false);

            const mockFn = jest.fn();
            const fn = factory._getWrappedController(mockFn);

            const someReq = 1;
            const someRes = 2;
            const someNext = 3;

            await fn(someReq, someRes, someNext);

            expect(mockFn).toHaveBeenCalledWith(someReq, someRes, someNext);
        });

        it("should execute controller if given an anonymous function", async () => {
            const factory = new RouterFactory();
            factory._hasValidationErrors = jest.fn().mockReturnValue(false);

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
    });

    it("Should get router from method", () => {
        const factory = new RouterFactory();

        const result = factory._getRouter();

        expect(result).toBeDefined();

    });

});
