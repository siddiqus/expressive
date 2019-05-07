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
        const routeObject = getRouteObj("get")
        expect(routeObject.method).toEqual("get");
        testRouteObj(routeObject);
    });

    it("Should have POST function available", () => {
        const routeObject = getRouteObj("post")
        expect(routeObject.method).toEqual("post");
        testRouteObj(routeObject);
    });

    it("Should have PUT function available", () => {
        const routeObject = getRouteObj("put")
        expect(routeObject.method).toEqual("put");
        testRouteObj(routeObject);
    });

    it("Should have DELETE function available", () => {
        const routeObject = getRouteObj("delete")
        expect(routeObject.method).toEqual("delete");
        testRouteObj(routeObject);
    });
});
