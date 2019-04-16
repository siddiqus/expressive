import RouterFactory from "./RouterFactory";

describe("RouterFactory", () => {
    describe("getExpressRouter", () => {
        it("Should register all routes and subroutes", () => {
            const expectedRoutes = [
                { path: "/", method: "get" },
                { path: "/users", method: "get" },
                { path: "/users", method: "post" },
                { path: "/users/:userId/posts", method: "get" },
                { path: "/users/:userId/posts", method: "post" }
            ];

            const mockRouter = {
                routes: [
                    {
                        path: "/",
                        method: "get",
                        controller: () => { }
                    }
                ],
                subroutes: [
                    {
                        path: "/users",
                        router: {
                            routes: [
                                {
                                    path: "/",
                                    method: "get",
                                    controller: () => { }
                                },
                                {
                                    path: "/",
                                    method: "post",
                                    controller: () => { }
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
                                                controller: () => { }
                                            },
                                            {
                                                path: "/",
                                                method: "post",
                                                controller: () => { }
                                            }
                                        ]
                                    }
                                }
                            ]
                        },

                    }
                ]
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
    });
});
