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

    it("should handle method '_sendJsonResponse' properly with data", () => {
        const controller = new BaseController();

        const mockJson = jest.fn().mockReturnValue(123);
        const mockStatus = jest.fn().mockReturnValue({
            json: mockJson
        });

        const mockRes = {
            status: mockStatus
        };

        controller.res = mockRes;

        const result = controller._sendJsonResponse(200, { message: "some message" });
        expect(result).toEqual(123);
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
            message: "some message"
        });
    });

    it("should handle method '_sendJsonResponse' properly without data", () => {
        const controller = new BaseController();

        const mockStatus = jest.fn().mockReturnValue(123);
        const mockRes = {
            sendStatus: mockStatus
        };

        controller.res = mockRes;

        const result = controller._sendJsonResponse(200);
        expect(result).toEqual(123);
        expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it("should throw error if handleRequest is not implemented", async () => {
        class SomeController extends BaseController { }

        const controller = new SomeController();

        let result;
        try {
            await controller.handleRequest();
        } catch (error) {
            result = error;
        }

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toEqual("'handleRequest' not implemented in SomeController");
    });

    it("_sendJsonResponseWithMessage: should call sendJsonResponse properly", () => {
        const controller = new BaseController();
        controller._sendJsonResponse = jest.fn().mockReturnValue(123);

        const result = controller._sendJsonResponseWithMessage(200, "some message");
        expect(result).toEqual(123);
        expect(controller._sendJsonResponse).toHaveBeenCalledWith(200, {
            message: "some message"
        });
    });

    describe("response", () => {
        const controller = new BaseController();

        beforeEach(() => {
            controller.res = jest.fn();
            controller._sendJsonResponseWithMessage = jest.fn();
            controller._sendJsonResponse = jest.fn();
        });


        it("should handle method 'ok' properly", () => {

        });
    });
});
