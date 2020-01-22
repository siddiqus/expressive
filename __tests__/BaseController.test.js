const BaseController = require("../src/BaseController");

describe("BaseController", () => {
    it("should be defined and should have handleRequest method", () => {
        expect(BaseController).toBeDefined();

        const base = new BaseController();
        base.handleRequest();
        expect(base.handleRequest).toBeDefined();
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
        let mockSendJson;
        let mockSendJsonWithMessage;
        
        beforeEach(() => {
            mockSendJson = jest.fn();
            mockSendJsonWithMessage = jest.fn();
            controller.res = jest.fn();
            controller._sendJsonResponseWithMessage = mockSendJsonWithMessage;
            controller._sendJsonResponse = mockSendJson;
        });

        
        it("should handle method 'ok' properly", () => {
            controller.ok();
            expect(mockSendJson).toHaveBeenCalledWith(200, null);

            controller.ok(123);
            expect(mockSendJson).toHaveBeenCalledWith(200, 123);
        });

        it("should handle method 'created' properly with dto", () => {
            controller.created();
            expect(mockSendJson).toHaveBeenCalledWith(201, null);

            controller.created(123);
            expect(mockSendJson).toHaveBeenCalledWith(201, 123);
        });

        it("should handle method 'accepted' properly with dto", () => {
            controller.accepted();
            expect(mockSendJson).toHaveBeenCalledWith(202, null);

            controller.accepted(123);
            expect(mockSendJson).toHaveBeenCalledWith(202, 123);
        });

        it("should handle method 'noContent' properly with dto", () => {
            controller.noContent();
            expect(mockSendJson).toHaveBeenCalledWith(204);
        });

        it("should handle method 'badRequest' properly with message", () => {
            controller.badRequest();
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(400, "Bad request");

            controller.badRequest("some message");
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(400, "some message");
        });
        
        it("should handle method 'unauthorized' properly with message", () => {
            controller.unauthorized();
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(401, "Unauthorized");

            controller.unauthorized("some message");
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(401, "some message");
        });
        
        it("should handle method 'forbidden' properly with message", () => {
            controller.forbidden();
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(403, "Forbidden");

            controller.forbidden("some message");
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(403, "some message");
        });
        
        it("should handle method 'notFound' properly with message", () => {
            controller.notFound();
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(404, "Not found");

            controller.notFound("some message");
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(404, "some message");
        });
        
        it("should handle method 'tooMany' properly with message", () => {
            controller.tooMany();
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(429, "Too many requests");

            controller.tooMany("some message");
            expect(mockSendJsonWithMessage).toHaveBeenCalledWith(429, "some message");
        });

        it("Should handle method 'internalServerError' properly", () => {
            controller.internalServerError();
            expect(mockSendJson).toHaveBeenCalledWith(500, {
                message: "Internal server error"
            });

            controller.internalServerError("some message");
            expect(mockSendJson).toHaveBeenCalledWith(500, {
                message: "some message"
            });

            controller.internalServerError("some message", {
                some: "data"
            });
            expect(mockSendJson).toHaveBeenCalledWith(500, {
                message: "some message",
                some: "data"
            });
        });
    });
});
