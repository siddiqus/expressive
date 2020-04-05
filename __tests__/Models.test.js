const Route = require("../src/Route");
const subroute = require("../src/subroute");

function getRouteObj(method) {
    return Route[method](
        "/somepath",
        {
            controller: "someController",
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

describe("subroute", () => {
    it("should return object", () => {
        const someRouter = { some: "router" };
        const somePath = "/somepath";
        const obj = subroute(somePath, someRouter);
        expect(obj.path).toEqual(somePath);
        expect(obj.router).toEqual(someRouter);
    });
});

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

    it("Should set authorizer if given", () => {
        const routeObject = Route.get("/some/path", {
            controller: "someOtherController",
            authorizer: "someAuthorizer"
        });

        expect(routeObject.authorizer).toEqual("someAuthorizer");
    });

    it("Should set middleware if given", () => {
        const routeObject = Route.get("/some/path", {
            controller: "someOtherController",
            middleware: "someMiddleware"
        });

        expect(routeObject.middleware).toEqual("someMiddleware");
    });

    it("getRouteFn: Should allow route without optional parameters", () => {
        expect(Route.get("/", () => { })).toBeDefined();
    });
});
