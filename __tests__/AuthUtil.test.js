const AuthUtil = require('../src/AuthUtil');

describe('AuthUtil', () => {
  describe('getAuthInjectorMiddleware', () => {
    it('should inject auth if none previously', () => {
      const authUtil = new AuthUtil();

      const handler = authUtil.getAuthInjectorMiddleware(1);

      const mockReq = {};

      handler(mockReq);

      expect(mockReq.authorizer).toEqual([1]);
    });

    it('should inject auth with previous auth', () => {
      const authUtil = new AuthUtil();

      const handler = authUtil.getAuthInjectorMiddleware(1);

      const mockReq = {
        authorizer: ['hehe']
      };

      handler(mockReq);

      expect(mockReq.authorizer).toEqual(['hehe', 1]);
    });

    it('should maintain unique auth object', () => {
      const authUtil = new AuthUtil();

      const someAuthorizer = {
        someAuthPrivileges: ['hello', 'hey']
      };
      const handler = authUtil.getAuthInjectorMiddleware(someAuthorizer);

      const mockReq = {
        authorizer: [someAuthorizer]
      };

      handler(mockReq);

      expect(mockReq.authorizer).toEqual([someAuthorizer]);
    });

    it('should flatten array for authorizers', () => {
      const authUtil = new AuthUtil();

      const someAuthorizer = ['hehe'];
      const handler = authUtil.getAuthInjectorMiddleware(someAuthorizer);

      const mockReq = {
        authorizer: ['hoho']
      };

      handler(mockReq);

      expect(mockReq.authorizer).toEqual(['hoho', 'hehe']);
    });
  });
});
