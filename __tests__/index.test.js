const expressive = require("../src/index");

describe("module index", () => {
    it("should have ExpressApp", () => {
        expect(expressive.ExpressApp).toBeDefined();
    });
    it("should have SwaggerUtils", () => {
        expect(expressive.SwaggerUtils).toBeDefined();
    });
    it("should have Route", () => {
        expect(expressive.Route).toBeDefined();
    });
    it("should have subroute", () => {
        expect(expressive.subroute).toBeDefined();
    });
});
