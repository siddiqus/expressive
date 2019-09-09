const ExpressApp = require("../src/ExpressApp");

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
                swaggerDefinitions: mockSwaggerDefinitions
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
            expect(app.SwaggerUtils.registerExpress).toHaveBeenCalledWith(app.express, mockSwaggerJson);
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
                middlewares: [() => { }],
                swaggerDefinitions: {},
                basePath: "/api",
                errorMiddleware: () => { },
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
                middlewares: [() => { }],
                swaggerDefinitions: {},
                basePath: "/api",
                errorMiddleware: () => { },
                showSwaggerOnlyInDev: false,
                swaggerInfo: {}
            });

            expect(app.express).toBeDefined();
        });
    });
});
