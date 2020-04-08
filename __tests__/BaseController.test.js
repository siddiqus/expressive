const BaseController = require('../src/BaseController');

describe('BaseController', () => {
  it('should be defined and should have handleRequest method', () => {
    expect(BaseController).toBeDefined();

    const base = new BaseController();
    base.handleRequest();
    expect(base.handleRequest).toBeDefined();
  });

  it('should throw error if handleRequest is not implemented', async () => {
    class SomeController extends BaseController {}

    const controller = new SomeController();

    let result;
    try {
      await controller.handleRequest();
    } catch (error) {
      result = error;
    }

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toEqual(
      '\'handleRequest\' not implemented in SomeController'
    );
  });

  describe('response', () => {
    const controller = new BaseController();
    const mockSendJson = jest.fn();

    controller.res = {
      status: jest.fn().mockReturnValue({
        json: mockSendJson
      }),
      sendStatus: jest.fn()
    };

    beforeEach(() => {
      mockSendJson.mockClear();
      controller.res.sendStatus.mockClear();
      controller.res.status = jest.fn().mockReturnValue({
        json: mockSendJson
      });
    });

    it('should handle method \'ok\' properly', () => {
      controller.ok();
      expect(controller.res.sendStatus).toHaveBeenCalledWith(200);

      controller.ok(123);
      expect(controller.res.status).toHaveBeenCalledWith(200);
      expect(mockSendJson).toHaveBeenCalledWith(123);
    });

    it('should handle method \'created\' properly with dto', () => {
      controller.created();
      expect(controller.res.sendStatus).toHaveBeenCalledWith(201);

      controller.created(123);
      expect(controller.res.status).toHaveBeenCalledWith(201);
      expect(mockSendJson).toHaveBeenCalledWith(123);
    });

    it('should handle method \'accepted\' properly with dto', () => {
      controller.accepted();
      expect(controller.res.sendStatus).toHaveBeenCalledWith(202);

      controller.accepted(123);
      expect(controller.res.status).toHaveBeenCalledWith(202);
      expect(mockSendJson).toHaveBeenCalledWith(123);
    });

    it('should handle method \'noContent\' properly with dto', () => {
      controller.noContent();
      expect(controller.res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('should handle method \'badRequest\' properly with message', () => {
      controller.badRequest();
      expect(controller.res.status).toHaveBeenCalledWith(400);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'Bad request'
      });

      controller.badRequest('some message');
      expect(controller.res.status).toHaveBeenCalledWith(400);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'some message'
      });
    });

    it('should handle method \'unauthorized\' properly with message', () => {
      controller.unauthorized();
      expect(controller.res.status).toHaveBeenCalledWith(401);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });

      controller.unauthorized('some message');
      expect(controller.res.status).toHaveBeenCalledWith(401);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'some message'
      });
    });

    it('should handle method \'forbidden\' properly with message', () => {
      controller.forbidden();
      expect(controller.res.status).toHaveBeenCalledWith(403);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'Forbidden'
      });

      controller.forbidden('some message');
      expect(controller.res.status).toHaveBeenCalledWith(403);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'some message'
      });
    });

    it('should handle method \'notFound\' properly with message', () => {
      controller.notFound();
      expect(controller.res.status).toHaveBeenCalledWith(404);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'Not Found'
      });

      controller.notFound('some message');
      expect(controller.res.status).toHaveBeenCalledWith(404);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'some message'
      });
    });

    it('should handle method \'tooMany\' properly with message', () => {
      controller.tooMany();
      expect(controller.res.status).toHaveBeenCalledWith(429);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'Too many requests'
      });

      controller.tooMany('some message');
      expect(controller.res.status).toHaveBeenCalledWith(429);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'some message'
      });
    });

    it('Should handle method \'internalServerError\' properly', () => {
      controller.internalServerError();
      expect(controller.res.status).toHaveBeenCalledWith(500);
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'Internal server error'
      });

      controller.internalServerError('some message');
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'some message'
      });

      controller.internalServerError('some message', {
        some: 'data'
      });
      expect(mockSendJson).toHaveBeenCalledWith({
        message: 'some message',
        some: 'data'
      });
    });
  });
});
