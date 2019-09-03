const serverless = require("../src/serverless");

describe("Serverless", () => {
    it("should get proper handler with logger - warmup plugin", () => {
        const mockServerlessHttp = jest.fn().mockImplementation(() => {
            return (event, context, callback) => {
                return {
                    event, context, callback
                }
            }
        });
        const mockExpress = {};
        const mockLogger = {
            info: jest.fn()
        }
        const handler = serverless.getServerlessHandler(mockExpress, mockServerlessHttp, mockLogger);
        expect(handler).toBeDefined();

        const mockEvent = {
            source: "serverless-plugin-warmup"
        }
        const mockCallback = jest.fn();

        handler(mockEvent, null, mockCallback);

        expect(mockLogger.info).toHaveBeenCalled();
        expect(mockCallback).toHaveBeenCalledWith(null, "Lambda is warm!");

    });

    it("should get proper handler without logger - warmup plugin", () => {
        const mockServerlessHttp = jest.fn().mockImplementation(() => {
            return (event, context, callback) => {
                return {
                    event, context, callback
                }
            }
        });
        const mockExpress = {};

        const handler = serverless.getServerlessHandler(mockExpress, mockServerlessHttp);
        expect(handler).toBeDefined();

        const mockEvent = {
            source: "serverless-plugin-warmup"
        }
        const mockCallback = jest.fn();

        handler(mockEvent, null, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, "Lambda is warm!");

    });

    it("should get proper handler without logger - no warmup plugin", () => {
        let mockRequestObject = null;

        const mockServerlessHttp = (expressApp, obj) =>{
            mockRequestObject = obj;
            return (event, context, callback) => {
                return {
                    event, context, callback
                }
            }
        };
        const mockExpress = {};
       
        const handler = serverless.getServerlessHandler(mockExpress, mockServerlessHttp);
        expect(handler).toBeDefined();

        const mockEvent = {};
        const mockCallback = jest.fn();

        const handlerResponse = handler(mockEvent, null, mockCallback);

        expect(handlerResponse.event).toEqual(mockEvent);
        expect(handlerResponse.context).toBeNull();
        expect(handlerResponse.callback).toEqual(mockCallback);

        const mockReq = {};
        expect(mockRequestObject.request(mockReq, 1, 2));
        expect(mockReq.apiGatewayEvent).toEqual(1);
        expect(mockReq.apiGatewayContext).toEqual(2);
    });
});