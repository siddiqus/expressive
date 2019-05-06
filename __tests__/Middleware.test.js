import response from "../src/middleware/response";
import MiddlewareManager from "../src/middleware/MiddlewareManager";

describe("response middleware", () => {
    it("Should call fn properly", () => {
        const mockNext = jest.fn();
        const mockRes = {
            setHeader: jest.fn()
        };
        response(null, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    });
});

describe("Middleware Manager", () => {
    describe("_getBodyParser", () => {
        it("should return array of body parser configs with default", () => {
            const manager = new MiddlewareManager();
            manager.bodyParser = {
                urlencoded: jest.fn().mockReturnValue(1),
                json: jest.fn().mockReturnValue(2)
            };

            const result = manager._getBodyParser();

            expect(result).toEqual([1, 2]);
            expect(manager.bodyParser.urlencoded).toHaveBeenCalledWith({ extended: true });
            expect(manager.bodyParser.json).toHaveBeenCalledWith({
                limit: "100kb"
            });
        });

        it("should return array of body parser configs with configured bodyLimit", () => {
            const manager = new MiddlewareManager({
                bodyLimit: "50kb"
            });
            manager.bodyParser = {
                urlencoded: jest.fn().mockReturnValue(3),
                json: jest.fn().mockReturnValue(4)
            };

            const result = manager._getBodyParser();

            expect(result).toEqual([3, 4]);
            expect(manager.bodyParser.urlencoded).toHaveBeenCalledWith({ extended: true });
            expect(manager.bodyParser.json).toHaveBeenCalledWith({
                limit: "50kb"
            });
        });
    });

    describe("registerMiddleware", () => {
        it("Should register defaults and user middleware", () => {
            const manager = new MiddlewareManager();
            manager._getBodyParser = jest.fn().mockReturnValue(1);
            manager.addRequestId = jest.fn().mockReturnValue(2);

            const mockExpress = {
                use: jest.fn()
            };

            const mockUserMiddleware = "abc";
            manager.registerMiddleware(mockExpress, mockUserMiddleware);

            expect(mockExpress.use).toHaveBeenCalledTimes(4);

            expect(mockExpress.use.mock.calls[0][0]).toEqual(1);
            expect(mockExpress.use.mock.calls[1][0]).toEqual(response);
            expect(mockExpress.use.mock.calls[2][0]).toEqual(2);
            expect(mockExpress.use.mock.calls[3][0]).toEqual(mockUserMiddleware);
        });

        it("Should register defaults without user middleware", () => {
            const manager = new MiddlewareManager();
            manager._getBodyParser = jest.fn().mockReturnValue(1);
            manager.addRequestId = jest.fn().mockReturnValue(2);

            const mockExpress = {
                use: jest.fn()
            };

            manager.registerMiddleware(mockExpress);

            expect(mockExpress.use).toHaveBeenCalledTimes(3);

            expect(mockExpress.use.mock.calls[0][0]).toEqual(1);
            expect(mockExpress.use.mock.calls[1][0]).toEqual(response);
            expect(mockExpress.use.mock.calls[2][0]).toEqual(2);
        });
    });
});
