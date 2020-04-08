const ExpressApp = require("../src/ExpressApp");
const Route = require("../src/Route");

describe("ExpressApp", () => {
    it("should be defined", () => {
        expect(ExpressApp).toBeDefined();
    });

    describe("_registerSwagger", () => {
        it("Should register properly", () => {
            const swaggerInfo = { name: "John Smith" };
            const mockRouter = {
                some: "routes"
            };
            const mockSwaggerDefinitions = {
                some: " Definition"
            };
            const app = new ExpressApp(mockRouter, {
                swaggerInfo,
                swaggerDefinitions: mockSwaggerDefinitions,
                showSwaggerOnlyInDev: false
            });

            const mockSwaggerHeader = { some: "Header" };
            const mockSwaggerJson = { hello: "world" };
            app.SwaggerUtils = {
                getSwaggerHeader: jest.fn().mockReturnValue(mockSwaggerHeader),
                convertDocsToSwaggerDoc: jest.fn().mockReturnValue(mockSwaggerJson),
                registerExpress: jest.fn()
            };

            app._registerSwagger();

            expect(app.SwaggerUtils.getSwaggerHeader).toHaveBeenCalledWith("/", swaggerInfo);
            expect(app.SwaggerUtils.convertDocsToSwaggerDoc).toHaveBeenCalledWith(
                mockRouter, mockSwaggerHeader, mockSwaggerDefinitions
            );
            expect(app.SwaggerUtils.registerExpress).toHaveBeenCalledWith(app.express, mockSwaggerJson, "/docs/swagger");
        });
    });

    describe("constructor", () => {
        it("Should init with all defaults", () => {
            const app = new ExpressApp({});
            expect(app.express).toBeDefined();
        });

        it("Should init with all overridden values", () => {
            const app = new ExpressApp({}, {
                allowCors: true,
                middleware: [() => { }],
                swaggerDefinitions: {},
                basePath: "/api",
                errorHandler: () => { },
                authorizer: () => { },
                showSwaggerOnlyInDev: false,
                swaggerInfo: {}
            });

            expect(app.express).toBeDefined();
        });

        it("constructor with Cors config", () => {
            const app = new ExpressApp({}, {
                allowCors: true,
                corsConfig: {
                    origin: "http://somepath"
                },
                middleware: [() => { }],
                swaggerDefinitions: {},
                basePath: "/api",
                errorHandler: () => { },
                showSwaggerOnlyInDev: false,
                swaggerInfo: {}
            });

            expect(app.express).toBeDefined();
        });

        it("Should throw error if duplicate urls", () => {
            let response;
            const mockRoutes = {
                routes: [
                    Route.get("/hello", () => { }),
                    Route.get("/hello/", () => { }),
                    Route.get("/v1/hey", () => { }),
                ],
                subroutes: [
                    {
                        path: "/v1",
                        router: {
                            routes: [
                                Route.get("/hey", () => { }),
                            ]
                        }
                    }
                ]
            };
            try {
                new ExpressApp(mockRoutes);
            } catch (error) {
                response = error;
            }

            expect(response.message).toEqual(
                "Duplicate endpoints detected! -> get /hello, get /v1/hey"
            );
        });
    });

    describe("_registerCelebrateMiddleware", () => {
        it("Should register celebrate error middleware if custom is provided", () => {
            const customCelebrateHandler = jest.fn();

            const app = new ExpressApp({}, {
                celebrateErrorHandler: customCelebrateHandler
            });

            const mockUse = jest.fn();

            app.express = {
                use: mockUse
            };

            app._registerCelebrateMiddleware();

            expect(mockUse).toHaveBeenCalledWith(customCelebrateHandler);
        });
    });
});
