const { Joi } = jest.requireActual("celebrate");
const JoiUtils = require("../src/JoiUtils");

function _getSchemaBodyDefinition(name, schema, required = true) {
    return {
        name,
        in: "body",
        required,
        schema
    };
}

describe("JoiUtils", () => {
    it("Should convert validationSchema to swagger parameter json for basic body query and params", () => {
        const validationSchema = {
            body: {
                decimalProp: Joi.number().required()
            },
            query: {
                page: Joi.number().integer().optional(),
            },
            params: {
                userId: Joi.number().integer().required()
            }
        };

        const json = JoiUtils.schemaToSwaggerRequestParameters(validationSchema);

        expect(json).toContainEqual({
            name: "page",
            in: "query",
            required: false,
            schema: {
                type: "integer"
            }
        });

        expect(json).toContainEqual({
            name: "userId",
            in: "path",
            required: true,
            schema: {
                type: "integer"
            }
        });

        expect(json).toContainEqual({
            name: "decimalProp",
            in: "body",
            required: true,
            schema: {
                type: "number"
            }
        });
    });

    it("Should convert validationSchema to swagger parameter json for complex body", () => {
        const validationSchema = {
            body: {
                name: Joi.string().required(),
                age: Joi.number().integer().required(),
                income: Joi.number().required(),
                dob: Joi.date().optional().default(new Date("2020-01-31T18:00:00.000Z")),
                email: Joi.string().email().optional(),
                patternString: Joi.string().pattern(/someregex/),
                boundedNumber: Joi.number().min(3).max(5),
                favoriteString: Joi.string().min(5).max(10),
                favoriteNumbers: Joi.array().items(Joi.number()),
                someMultiple: Joi.number().multiple(5)
            }
        };

        const json = JoiUtils.schemaToSwaggerRequestParameters(validationSchema);

        expect(json).toContainEqual(_getSchemaBodyDefinition("name", {
            type: "string"
        }));

        expect(json).toContainEqual(_getSchemaBodyDefinition("age", {
            type: "integer"
        }));

        expect(json).toContainEqual(_getSchemaBodyDefinition("income", {
            type: "number"
        }));

        expect(json).toContainEqual(_getSchemaBodyDefinition("dob", {
            type: "string",
            default: "\"2020-01-31T18:00:00.000Z\""
        }, false));

        expect(json).toContainEqual(_getSchemaBodyDefinition("boundedNumber", {
            type: "number",
            minimum: 3,
            maximum: 5
        }, false));

        expect(json).toContainEqual(_getSchemaBodyDefinition("favoriteString", {
            type: "string",
            minLength: 5,
            maxLength: 10
        }, false));

        expect(json).toContainEqual(_getSchemaBodyDefinition("email", {
            type: "string"
        }, false));

        expect(json).toContainEqual(_getSchemaBodyDefinition("patternString", {
            type: "string",
            pattern: "/someregex/"
        }, false));

        expect(json).toContainEqual(_getSchemaBodyDefinition("someMultiple", {
            type: "number",
            multipleOf: 5
        }, false));
    });

    it("Should convert swagger json for nested object schema", () => {
        const validationSchema = {
            body: {
                address: Joi.object().keys({
                    street: Joi.string().required(),
                    house: Joi.string().required(),
                    extra: Joi.object().keys({
                        floor: Joi.number(),
                        flat: Joi.number(),
                        houseName: Joi.string()
                    }).required(),
                    zipCode: Joi.number().integer().optional()
                }).required()
            }
        };

        const json = JoiUtils.schemaToSwaggerRequestParameters(validationSchema);

        expect(json).toContainEqual(_getSchemaBodyDefinition("address", {
            type: "object",
            properties: {
                street: {
                    type: "string"
                },
                house: {
                    type: "string"
                },
                zipCode: {
                    type: "integer"
                },
                extra: {
                    type: "object",
                    properties: {
                        floor: {
                            type: "number"
                        },
                        flat: {
                            type: "number"
                        },
                        houseName: {
                            type: "string"
                        }
                    },
                    // required: ["flat"]
                }
            },
            required: [
                "street", "house", "extra"
            ]
        }));
    });

    it("Should convert json for array of items", () => {
        const validationSchema = {
            body: {
                blankArray: Joi.array().min(2).max(5),
                favoriteNumbers: Joi.array().items(Joi.number()),
                favoriteBooks: Joi.array().items(Joi.object().keys({
                    author: Joi.string().required(),
                    publishDate: Joi.date()
                }))
            }
        };

        const json = JoiUtils.schemaToSwaggerRequestParameters(validationSchema);

        expect(json).toContainEqual(_getSchemaBodyDefinition("blankArray", {
            type: "array",
            items: {},
            maxItems: 5,
            minItems: 2
        }, false));

        expect(json).toContainEqual(_getSchemaBodyDefinition("favoriteNumbers", {
            type: "array",
            items: {
                type: "number"
            }
        }, false));

        expect(json).toContainEqual(_getSchemaBodyDefinition("favoriteBooks", {
            type: "array",
            items: {
                type: "object",
                properties: {
                    author: {
                        type: "string"
                    },
                    publishDate: {
                        type: "string"
                    }
                },
                required: ["author"]
            }
        }, false));
    });
});
