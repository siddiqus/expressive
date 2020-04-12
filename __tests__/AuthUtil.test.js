const AuthUtil = require('../src/AuthUtil');

describe('AuthUtil', () => {
  describe('getMiddlewareForInjectingAuthPropoerties', () => {
    it('should inject auth if none previously', () => {
      const authUtil = new AuthUtil();

      const handler = authUtil.getMiddlewareForInjectingAuthPropoerties(1);

      const mockReq = {};

      handler(mockReq);

      expect(mockReq.authorizer).toEqual([1]);
    });

    it('should inject auth with previous auth', () => {
      const authUtil = new AuthUtil();

      const handler = authUtil.getMiddlewareForInjectingAuthPropoerties(1);

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
      const handler = authUtil.getMiddlewareForInjectingAuthPropoerties(
        someAuthorizer
      );

      const mockReq = {
        authorizer: [someAuthorizer]
      };

      handler(mockReq);

      expect(mockReq.authorizer).toEqual([someAuthorizer]);
    });

    it('should flatten array for authorizers', () => {
      const authUtil = new AuthUtil();

      const someAuthorizer = ['hehe'];
      const handler = authUtil.getMiddlewareForInjectingAuthPropoerties(
        someAuthorizer
      );

      const mockReq = {
        authorizer: ['hoho']
      };

      handler(mockReq);

      expect(mockReq.authorizer).toEqual(['hoho', 'hehe']);
    });
  });

  describe('getAuthorizerMiddleware', () => {
    it('Should return null if authorizer is falsy', () => {
      // setup
      const authUtil = new AuthUtil();
      // execute
      const result = authUtil.getAuthorizerMiddleware(null);
      // assert
      expect(result).toBeNull();
    });

    it('Should throw error if authorizer is defined but auth object handler is not', () => {
      // setup
      const authUtil = new AuthUtil();
      // execute
      let result;
      try {
        authUtil.getAuthorizerMiddleware([1, 2, 3]);
      } catch (error) {
        result = error;
      }
      // assert

      expect(result.message).toEqual(
        `'authorizer' object declared, but 'authObjectHandler' is not defined in ExpressApp constructor params, or is an empty function`
      );
    });

    it('Should throw error if authorizer is defined but auth object handler is empty function', () => {
      // setup
      const authUtil = new AuthUtil();
      // execute
      let result;
      try {
        authUtil.getAuthorizerMiddleware([1, 2, 3], () => {});
      } catch (error) {
        result = error;
      }
      // assert

      expect(result.message).toEqual(
        `'authorizer' object declared, but 'authObjectHandler' is not defined in ExpressApp constructor params, or is an empty function`
      );
    });

    it('Should return proper middleware if authorizer is object', () => {
      // setup
      const authUtil = new AuthUtil();
      authUtil.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn().mockReturnValue(1)
      };
      const mockAuthorizer = ['hello'];
      const mockAuthObjectHandler = jest.fn();
      // execute
      const result = authUtil.getAuthorizerMiddleware(
        mockAuthorizer,
        mockAuthObjectHandler
      );
      // assert
      expect(result).not.toBeNull();
      expect(
        authUtil.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledTimes(2);
      expect(
        authUtil.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledWith(mockAuthObjectHandler);
    });

    it('Should return proper middleware if authorizer is a function', () => {
      // setup
      const authUtil = new AuthUtil();
      authUtil.routeUtil = {
        getHandlerWithManagedNextCall: jest.fn().mockReturnValue(1)
      };
      const mockAuthorizer = (_) => {};
      const mockAuthObjectHandler = jest.fn();
      // execute
      const result = authUtil.getAuthorizerMiddleware(
        mockAuthorizer,
        mockAuthObjectHandler
      );
      // assert
      expect(result).not.toBeNull();
      expect(
        authUtil.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledTimes(1);
      expect(
        authUtil.routeUtil.getHandlerWithManagedNextCall
      ).toHaveBeenCalledWith(mockAuthorizer);
    });
  });
});
