import RouteUtil from "../src/RouteUtil";

const mockSubroutes = [
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
        }
    }
];

describe("RouteUtil", () => {
    describe("getRoutesInfo", () => {
        it("Should register all routes and subroutes", () => {
            const expectedRoutes = [
                { path: "/", method: "get", doc: "hello" },
                { path: "/users/", method: "get" },
                { path: "/users/", method: "post" },
                { path: "/users/:userId/posts/", method: "get" },
                { path: "/users/:userId/posts/", method: "post" }
            ];

            const mockRouter = {
                routes: [
                    {
                        path: "/",
                        method: "get",
                        controller: () => { },
                        doc: "hello"
                    }
                ],
                subroutes: mockSubroutes
            };

            const result = RouteUtil.getRoutesInfo(mockRouter);
            expect(result).toEqual(expectedRoutes);
        });

        it("Should register all subroutes from top", () => {
            const expectedRoutes = [
                { path: "/users/", method: "get" },
                { path: "/users/", method: "post" },
                { path: "/users/:userId/posts/", method: "get" },
                { path: "/users/:userId/posts/", method: "post" }
            ];

            const mockRouter = {
                subroutes: mockSubroutes
            };

            const result = RouteUtil.getRoutesInfo(mockRouter);
            expect(result).toEqual(expectedRoutes);
        });
    });
});
