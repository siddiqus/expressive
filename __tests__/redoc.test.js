const registerRedoc = require('../src/redoc/registerRedoc');
const redocHtmlTemplate = require('../src/redoc/redocHtmlTemplate');

describe('Redoc', () => {
  describe('registerRedoc', () => {
    it('Should register redoc with express app', () => {
      const app = {
        get: jest.fn()
      };

      registerRedoc(app, {}, '/docs');

      expect(app.get).toHaveBeenCalledTimes(2);
      expect(app.get.mock.calls[0][0]).toEqual('/docs/swagger.json');
      expect(app.get.mock.calls[1][0]).toEqual('/docs');
    });

    it('Should register first handler properly', () => {
      const app = {
        get: jest.fn()
      };

      const someSwagger = {
        hello: 'world'
      };

      registerRedoc(app, someSwagger, '/docs');
      expect(app.get).toHaveBeenCalledTimes(2);

      const mockSend = jest.fn();
      const mockRes = {
        type: jest.fn(),
        status: jest.fn().mockReturnValue({
          send: mockSend
        })
      };

      const firstHandler = app.get.mock.calls[0][1];
      firstHandler(null, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith(someSwagger);
    });

    it('Should register second handler properly', () => {
      const app = {
        get: jest.fn()
      };

      const someSwagger = {
        hello: 'world'
      };

      registerRedoc(app, someSwagger, '/docs');
      expect(app.get).toHaveBeenCalledTimes(2);

      const mockSend = jest.fn();
      const mockRes = {
        type: jest.fn(),
        status: jest.fn().mockReturnValue({
          send: mockSend
        })
      };

      const secondHandler = app.get.mock.calls[1][1];
      secondHandler(null, mockRes);

      const expectedRedoc = redocHtmlTemplate({
        title: 'ReDoc',
        specUrl: '/docs/swagger.json'
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith(expectedRedoc);
    });
  });

  describe('redocHtmlTemplate', () => {
    it('Should give proper html with defaults', () => {
      const html = redocHtmlTemplate();
      expect(html).toContain('ReDoc');
      expect(html).toContain('http://petstore.swagger.io/v2/swagger.json');
    });

    it('Should give proper html with given params', () => {
      const html = redocHtmlTemplate({
        title: 'This is my title',
        specUrl: '/some/spec'
      });
      expect(html).toContain('This is my title');
      expect(html).toContain('/some/spec');
    });
  });
});
