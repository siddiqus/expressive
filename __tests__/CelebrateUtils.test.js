const { Joi } = jest.requireActual('celebrate');
const CelebrateUtils = require('../src/CelebrateUtils');

describe('CelebrateUtils', () => {
  describe('joiSchemaToSwaggerRequestParameters', () => {
    it('Should convert validationSchema to swagger parameter json for basic query, params, and headers', () => {
      const validationSchema = {
        headers: Joi.object({
          'X-Auth': Joi.string().required()
        }),
        query: {
          page: Joi.number().integer().optional()
        },
        params: {
          userId: Joi.number().integer().required()
        }
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        name: 'page',
        in: 'query',
        required: false,
        schema: {
          type: 'integer'
        }
      });

      expect(json).toContainEqual({
        name: 'userId',
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        }
      });

      expect(json).toContainEqual({
        name: 'x-auth',
        in: 'header',
        schema: {
          type: 'string'
        },
        required: true
      });
    });

    it('Should convert validationSchema to swagger if body is Joi object', () => {
      const validationSchema = {
        body: Joi.object({
          name: Joi.string().required()
        })
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        in: 'body',
        name: 'body',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            }
          },
          required: ['name']
        }
      });
    });

    it('Should convert validationSchema to swagger for property with options - valid, empty, and nullable', () => {
      const validationSchema = {
        body: Joi.object({
          name: Joi.string().valid('hey', 'you').required(),
          someAllow: Joi.string().allow('huh'),
          nullable: Joi.string().valid('hey').allow(null)
        })
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        in: 'body',
        name: 'body',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              enum: ['hey', 'you']
            },
            someAllow: {
              type: 'string',
              enum: ['huh']
            },
            nullable: {
              type: 'string',
              nullable: true,
              enum: ['hey', null]
            }
          },
          required: ['name']
        }
      });
    });

    it('Should convert validationSchema to swagger parameter json for complex body', () => {
      const validationSchema = {
        body: {
          name: Joi.string().required(),
          age: Joi.number().integer().required(),
          income: Joi.number().required(),
          dob: Joi.date()
            .optional()
            .default(new Date('2020-01-31T18:00:00.000Z')),
          email: Joi.string().email().optional(),
          patternString: Joi.string().pattern(/someregex/),
          boundedNumber: Joi.number().min(3).max(5),
          favoriteString: Joi.string().min(5).max(10),
          someMultiple: Joi.number().multiple(5)
        }
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        in: 'body',
        name: 'body',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            age: {
              type: 'integer'
            },
            income: {
              type: 'number'
            },
            dob: {
              type: 'string',
              default: '"2020-01-31T18:00:00.000Z"'
            },
            email: {
              type: 'string'
            },
            patternString: {
              type: 'string',
              pattern: '/someregex/'
            },
            boundedNumber: {
              type: 'number',
              minimum: 3,
              maximum: 5
            },
            favoriteString: {
              type: 'string',
              minLength: 5,
              maxLength: 10
            },
            someMultiple: {
              type: 'number',
              multipleOf: 5
            }
          },
          required: ['name', 'age', 'income']
        }
      });
    });

    it('Should convert swagger json for nested object schema', () => {
      const validationSchema = {
        body: {
          address: Joi.object()
            .keys({
              street: Joi.string().required(),
              house: Joi.string().required(),
              extra: Joi.object()
                .keys({
                  floor: Joi.number(),
                  flat: Joi.number(),
                  houseName: Joi.string()
                })
                .required(),
              zipCode: Joi.number().integer().optional()
            })
            .required()
        }
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        in: 'body',
        name: 'body',
        schema: {
          type: 'object',
          properties: {
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string'
                },
                house: {
                  type: 'string'
                },
                zipCode: {
                  type: 'integer'
                },
                extra: {
                  type: 'object',
                  properties: {
                    floor: {
                      type: 'number'
                    },
                    flat: {
                      type: 'number'
                    },
                    houseName: {
                      type: 'string'
                    }
                  }
                  // required: ["flat"]
                }
              },
              required: ['street', 'house', 'extra']
            }
          },
          required: ['address']
        }
      });
    });

    it('Should convert json for array of items', () => {
      const validationSchema = {
        body: {
          blankArray: Joi.array().min(2).max(5),
          favoriteNumbers: Joi.array().items(Joi.number()),
          favoriteBooks: Joi.array().items(
            Joi.object().keys({
              author: Joi.string().required(),
              publishDate: Joi.date()
            })
          )
        }
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        in: 'body',
        name: 'body',
        schema: {
          type: 'object',
          properties: {
            blankArray: {
              type: 'array',
              items: {},
              maxItems: 5,
              minItems: 2
            },
            favoriteNumbers: {
              type: 'array',
              items: {
                type: 'number'
              }
            },
            favoriteBooks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  author: {
                    type: 'string'
                  },
                  publishDate: {
                    type: 'string'
                  }
                },
                required: ['author']
              }
            }
          }
        }
      });
    });

    it('Should allow body joi object check', () => {
      const validationSchema = {
        body: Joi.object().required()
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        in: 'body',
        name: 'body',
        schema: {
          type: 'object'
        }
      });
    });

    it('Should allow body joi any check', () => {
      const validationSchema = {
        body: Joi.any().required()
      };

      const json = CelebrateUtils.joiSchemaToSwaggerRequestParameters(
        validationSchema
      );

      expect(json).toContainEqual({
        in: 'body',
        name: 'body',
        schema: {
          type: 'object'
        }
      });
    });
  });

  describe('lowercaseHeaderSchemaProperties', () => {
    it('Should do nothing if no headers present', () => {
      const validationSchema = {
        body: {
          some: 'validation'
        }
      };

      CelebrateUtils.lowercaseHeaderSchemaProperties(validationSchema);

      expect(validationSchema).toEqual(validationSchema);
    });

    it('Should lowercase if headers object provided', () => {
      const validationSchema = {
        body: {
          some: 'validation'
        },
        headers: {
          Authorization: 1234,
          ContentType: 'json'
        }
      };

      CelebrateUtils.lowercaseHeaderSchemaProperties(validationSchema);

      expect(validationSchema).toEqual({
        body: {
          some: 'validation'
        },
        headers: {
          authorization: 1234,
          contenttype: 'json'
        }
      });
    });

    it('Should lowercase if headers object provided as joi object', () => {
      const validationSchema = {
        body: {
          some: 'validation'
        },
        headers: Joi.object({
          Authorization: 1234,
          ContentType: 'json'
        })
      };

      CelebrateUtils.lowercaseHeaderSchemaProperties(validationSchema);

      expect(JSON.stringify(validationSchema.headers)).toEqual(
        JSON.stringify(
          Joi.object({
            authorization: 1234,
            contenttype: 'json'
          })
        )
      );
    });
  });

  describe('getCelebrateValidationMiddlewareForFileUpload', () => {
    it('should return proper handler with non joi object - no error', async () => {
      const fileUpload = {
        file: Joi.any().required()
      };

      const handler = CelebrateUtils.getCelebrateValidationMiddlewareForFileUpload(
        fileUpload
      );

      const mockNext = jest.fn();
      const mockReq = {
        file: 'some file'
      };
      await handler(mockReq, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return proper handler with non joi object - no error - multiple files', async () => {
      const fileUpload = {
        files: Joi.any().required()
      };

      const handler = CelebrateUtils.getCelebrateValidationMiddlewareForFileUpload(
        fileUpload
      );

      const mockNext = jest.fn();
      const mockReq = {
        files: ['some files']
      };
      await handler(mockReq, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return proper handler with non joi object - with error', async () => {
      const fileUpload = {
        file: Joi.any().required()
      };

      const handler = CelebrateUtils.getCelebrateValidationMiddlewareForFileUpload(
        fileUpload
      );

      const mockNext = jest.fn();
      const mockReq = {};
      await handler(mockReq, null, mockNext);

      expect(mockNext.mock.calls[0][0].message).toEqual(`"file" is required`);
    });

    it('should return proper handler with joi object - with error', async () => {
      const fileUpload = Joi.object({
        file: Joi.any().required()
      });

      const handler = CelebrateUtils.getCelebrateValidationMiddlewareForFileUpload(
        fileUpload
      );

      const mockNext = jest.fn();
      const mockReq = {};
      await handler(mockReq, null, mockNext);

      expect(mockNext.mock.calls[0][0].message).toEqual(`"file" is required`);
    });
  });
});
