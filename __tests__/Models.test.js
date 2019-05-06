import Route from "../src/models/Route";

describe("Route model", () => {
    it("Should have GET function available", () => {
        const routeObject = Route.get(
            "/somepath", "someController", {
                validator: "validatorFunction",
                doc: "docJs"
            }
        );
        expect(routeObject.method).toEqual("get");
        expect(routeObject.path).toEqual("/somepath");
        expect(routeObject.controller).toEqual("someController");
        expect(routeObject.validator).toEqual("validatorFunction");
        expect(routeObject.doc).toEqual("docJs");
    });

    it("Should have POST function available", () => {
        const routeObject = Route.post(
            "/somepath", "someController", {
                validator: "validatorFunction",
                doc: "docJs"
            }
        );
        expect(routeObject.method).toEqual("post");
        expect(routeObject.path).toEqual("/somepath");
        expect(routeObject.controller).toEqual("someController");
        expect(routeObject.validator).toEqual("validatorFunction");
        expect(routeObject.doc).toEqual("docJs");
    });

    it("Should have PUT function available", () => {
        const routeObject = Route.put(
            "/somepath", "someController", {
                validator: "validatorFunction",
                doc: "docJs"
            }
        );
        expect(routeObject.method).toEqual("put");
        expect(routeObject.path).toEqual("/somepath");
        expect(routeObject.controller).toEqual("someController");
        expect(routeObject.validator).toEqual("validatorFunction");
        expect(routeObject.doc).toEqual("docJs");
    });

    it("Should have DELETE function available", () => {
        const routeObject = Route.delete(
            "/somepath", "someController", {
                validator: "validatorFunction",
                doc: "docJs"
            }
        );
        expect(routeObject.method).toEqual("delete");
        expect(routeObject.path).toEqual("/somepath");
        expect(routeObject.controller).toEqual("someController");
        expect(routeObject.validator).toEqual("validatorFunction");
        expect(routeObject.doc).toEqual("docJs");
    });
});
