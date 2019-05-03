import GetRoutesInfo from "../src/GetRoutesInfo";


describe("GetRoutesInfo", () => {
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

        const result = GetRoutesInfo(mockRouter);
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

        const result = GetRoutesInfo(mockRouter);
        expect(result).toEqual(expectedRoutes);
    });
});
