const BaseController = require("../src/BaseController");

describe("BaseController", () => {
    it("should be defined and should have handleRequest method", () => {
        expect(BaseController).toBeDefined();

        const base = new BaseController();
        base.handleRequest();
        expect(base.handleRequest).toBeDefined();
    });

    it("should call handleRequest method on _handleRequestBase", async () => {
        expect(BaseController).toBeDefined();

        const base = new BaseController();
        base.handleRequest = jest.fn();

        const mockReq = 1;
        const mockRes = 2;
        const mockNext = 3;

        await base._handleRequestBase(mockReq, mockRes, mockNext);

        expect(base.handleRequest).toHaveBeenCalled();
        expect(base.req).toEqual(mockReq);
        expect(base.res).toEqual(mockRes);
        expect(base.next).toEqual(mockNext);
    });

    it("should handle method '_jsonResponse' properly", () => {
        const controller = new BaseController();

        const mockJson = jest.fn().mockReturnValue(123);
        const mockStatus = jest.fn().mockReturnValue({
            json: mockJson
        });
        controller.res = {
            status: mockStatus
        };

        const result = controller._jsonResponse(200, "some message");
        expect(result).toEqual(123);
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
            message: "some message"
        });
    });


    describe("response", () => {
        const controller = new BaseController();

        beforeEach(() => {
            controller.res = jest.fn();
            controller._jsonResponse = jest.fn();
        });


        it("should handle method 'ok' properly", () => {

        });
    });
});
