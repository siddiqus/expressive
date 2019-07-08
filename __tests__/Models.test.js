import Route from "../src/models/Route";

function getRouteObj(method) {
    return Route[method](
        "/somepath", "someController", {
            validator: "validatorFunction",
            doc: "docJs"
        }
    );
}

function testRouteObj(routeObject) {
    expect(routeObject.path).toEqual("/somepath");
    expect(routeObject.controller).toEqual("someController");
    expect(routeObject.validator).toEqual("validatorFunction");
    expect(routeObject.doc).toEqual("docJs");
}

describe("Route model", () => {
    it("Should have GET function available", () => {
        const routeObject = getRouteObj("get");
        expect(routeObject.method).toEqual("get");
        testRouteObj(routeObject);
    });

    it("Should have POST function available", () => {
        const routeObject = getRouteObj("post");
        expect(routeObject.method).toEqual("post");
        testRouteObj(routeObject);
    });

    it("Should have PUT function available", () => {
        const routeObject = getRouteObj("put");
        expect(routeObject.method).toEqual("put");
        testRouteObj(routeObject);
    });

    it("Should have DELETE function available", () => {
        const routeObject = getRouteObj("delete");
        expect(routeObject.method).toEqual("delete");
        testRouteObj(routeObject);
    });

    it("Should have HEAD function available", () => {
        const routeObject = getRouteObj("head");
        expect(routeObject.method).toEqual("head");
        testRouteObj(routeObject);
    });

    it("Should have PATCH function available", () => {
        const routeObject = getRouteObj("patch");
        expect(routeObject.method).toEqual("patch");
        testRouteObj(routeObject);
    });

    it("Should have OPTIONS function available", () => {
        const routeObject = getRouteObj("options");
        expect(routeObject.method).toEqual("options");
        testRouteObj(routeObject);
    });

    it("Should set error handler if given", () => {
        const routeObject = Route.get("/some/path", "someOtherController", {
            errorHandler: "someErrorHandler"
        });

        expect(routeObject.errorHandler).toEqual("someErrorHandler");
    });

    it("Should get route object with all defaults", () => {
        const route = new Route("get", "/", "someController");
        expect(route.method).toEqual("get");
        expect(route.path).toEqual("/");
        expect(route.controller).toEqual("someController");
    });

    it("getRouteFn: Should allow route without optional parameters", () => {
        expect(Route.get("/", () => { })).toBeDefined();
    });
});
