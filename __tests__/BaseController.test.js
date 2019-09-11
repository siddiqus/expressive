const BaseController = require("../src/BaseController");

describe("BaseController", () => {
    it("should be defined and should have handleRequest method", () => {
        expect(BaseController).toBeDefined();

        const base = new BaseController();
        base.handleRequest();
        expect(base.handleRequest).toBeDefined();
        expect(base.handleRequest.length).toEqual(3);
    });
});
